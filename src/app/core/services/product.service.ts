import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    brand: string;
    category: string;
    thumbnail: string;
    images: string[];
    isVisible?: boolean;
}

export interface ProductResponse {
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = 'https://dummyjson.com/products/category';
    private categories = ['mens-shirts', 'womens-dresses', 'tops', 'womens-shoes', 'mens-shoes', 'womens-bags', 'sunglasses', 'mens-watches', 'womens-watches', 'womens-jewellery', 'fragrances'];

    private customProductsKey = 'lumiere_custom_products';
    private hiddenProductsKey = 'lumiere_hidden_products';

    getProducts(): Observable<Product[]> {
        return this.http.get<ProductResponse>('https://dummyjson.com/products?limit=100').pipe(
            map(response => {
                const apiProducts = response.products
                    .filter(p => this.categories.includes(p.category))
                    .map(p => {
                        if (p.category === 'fragrances') {
                            const bagImages = [
                                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
                                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
                                'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1000&auto=format&fit=crop',
                                'https://images.unsplash.com/photo-1566150905458-1bf1fd113961?q=80&w=1000&auto=format&fit=crop',
                                'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop'
                            ];
                            // Deterministic image based on ID
                            p.thumbnail = bagImages[p.id % bagImages.length];
                            p.images = [p.thumbnail];
                        }
                        return p;
                    });
                const customProducts = JSON.parse(localStorage.getItem(this.customProductsKey) || '[]');
                const hiddenIds = JSON.parse(localStorage.getItem(this.hiddenProductsKey) || '[]');

                // Merge and map visibility
                return [...customProducts, ...apiProducts].map(p => ({
                    ...p,
                    isVisible: !hiddenIds.includes(p.id)
                }));
            })
        );
    }

    addProduct(product: Partial<Product>) {
        const customProducts = JSON.parse(localStorage.getItem(this.customProductsKey) || '[]');
        const newProduct = {
            ...product,
            id: Date.now(), // Simple unique ID
            discountPercentage: product.discountPercentage || 0,
            rating: 5,
            stock: product.stock || 10,
            brand: 'Lumiere Exclusive',
            images: [product.thumbnail || '']
        } as Product;

        customProducts.unshift(newProduct);
        localStorage.setItem(this.customProductsKey, JSON.stringify(customProducts));
    }

    toggleVisibility(id: number) {
        const hiddenIds = JSON.parse(localStorage.getItem(this.hiddenProductsKey) || '[]');
        const index = hiddenIds.indexOf(id);

        if (index > -1) {
            hiddenIds.splice(index, 1); // Make visible
        } else {
            hiddenIds.push(id); // Hide
        }

        localStorage.setItem(this.hiddenProductsKey, JSON.stringify(hiddenIds));
    }
}
