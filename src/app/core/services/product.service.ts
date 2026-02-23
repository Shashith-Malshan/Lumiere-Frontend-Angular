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

    getProducts(): Observable<Product[]> {
        // Fetch all products and filter for fashion categories to get a diverse set
        return this.http.get<ProductResponse>('https://dummyjson.com/products?limit=100').pipe(
            map(response => response.products.filter(p => this.categories.includes(p.category)))
        );
    }
}
