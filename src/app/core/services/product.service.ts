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
    private deletedProductsKey = 'lumiere_deleted_products';

    getProducts(): Observable<Product[]> {
        return this.http.get<ProductResponse>('https://dummyjson.com/products?limit=100').pipe(
            map(response => {
                const apiProducts = response.products.filter(p => this.categories.includes(p.category));
                const customProducts = JSON.parse(localStorage.getItem(this.customProductsKey) || '[]');
                const deletedIds = JSON.parse(localStorage.getItem(this.deletedProductsKey) || '[]');

                // Merge and filter deleted
                return [...customProducts, ...apiProducts].filter(p => !deletedIds.includes(p.id));
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

    deleteProduct(id: number) {
        // Handle custom products
        const customProducts = JSON.parse(localStorage.getItem(this.customProductsKey) || '[]');
        const filteredCustom = customProducts.filter((p: Product) => p.id !== id);
        localStorage.setItem(this.customProductsKey, JSON.stringify(filteredCustom));

        // Track deleted API products
        const deletedIds = JSON.parse(localStorage.getItem(this.deletedProductsKey) || '[]');
        if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            localStorage.setItem(this.deletedProductsKey, JSON.stringify(deletedIds));
        }
    }
}
