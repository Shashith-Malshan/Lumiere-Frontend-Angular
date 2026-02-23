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
      <div class="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-background-base/50 border border-surface-base/5">
        <!-- Ambient Background -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            [src]="product.thumbnail"
            class="h-full w-full object-cover blur-3xl opacity-40 scale-150 transition-transform duration-1000 group-hover:scale-[1.7]"
            alt=""
          />
          <div class="absolute inset-0 bg-gradient-to-b from-transparent via-background-base/10 to-background-base/40"></div>
        </div>

        <!-- Main Image -->
        <img
          [src]="product.thumbnail"
          [alt]="product.title"
          class="relative h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 z-10"
        />
        
        <!-- Badge -->
        <div *ngIf="product.discountPercentage > 10" class="absolute top-4 left-4 z-20">
          <span class="px-2 py-1 bg-primary text-background-dark text-[10px] uppercase font-bold tracking-widest rounded-sm">
            -{{ product.discountPercentage | number:'1.0-0' }}%
          </span>
        </div>

        <!-- Hover Action Overlay -->
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-30">
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
          <h3 class="text-text-base text-base font-display leading-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-1">
            {{ product.title }}
          </h3>
          <span class="text-text-base font-medium text-sm">
            {{ product.price | currency }}
          </span>
        </div>
        <p class="text-text-base/40 text-[10px] font-bold uppercase tracking-widest">
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
