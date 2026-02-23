import { Component, Input, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="group relative flex flex-col gap-4">
      <div class="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface-dark">
        <!-- Image -->
        <img
          [src]="product.thumbnail"
          [alt]="product.title"
          class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        
        <!-- Badge -->
        <div *ngIf="product.discountPercentage > 10" class="absolute top-4 left-4">
          <span class="px-2 py-1 bg-primary text-background-dark text-[10px] uppercase font-bold tracking-widest rounded-sm">
            -{{ product.discountPercentage | number:'1.0-0' }}%
          </span>
        </div>

        <!-- Hover Action Overlay -->
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <button 
            (click)="addToCart($event)"
            class="translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-background-dark font-bold text-xs uppercase tracking-widest px-6 py-3 rounded hover:bg-primary shadow-lg hover:shadow-primary/50"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="flex flex-col gap-1">
        <div class="flex justify-between items-start gap-2">
          <h3 class="text-white text-base font-display leading-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-1">
            {{ product.title }}
          </h3>
          <span class="text-white font-medium text-sm">
            {{ product.price | currency }}
          </span>
        </div>
        <p class="text-white/40 text-[10px] font-bold uppercase tracking-widest">
          {{ product.category }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  private cartService = inject(CartService);

  addToCart(event: Event) {
    event.stopPropagation();
    this.cartService.addToCart(this.product);
  }
}
