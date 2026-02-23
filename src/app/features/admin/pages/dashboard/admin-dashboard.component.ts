import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../../../core/services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <div class="min-h-screen bg-background-base text-text-base font-sans antialiased transition-colors duration-500">
      <!-- Top Bar -->
      <nav class="glass-panel sticky top-0 z-50 border-b border-surface-base/5 px-6 py-4">
        <div class="max-w-[1600px] mx-auto flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-display font-bold tracking-wider">AURELIA <span class="text-[10px] text-primary ml-2 uppercase tracking-[0.2em] font-sans">Admin</span></h1>
          </div>
          <div class="flex items-center gap-6">
            <button (click)="logout()" class="text-text-base/40 hover:text-text-base text-[10px] font-bold uppercase tracking-widest transition-colors">Logout</button>
            <a href="/" class="bg-surface-base/5 border border-surface-base/10 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:border-primary transition-colors">Storefront</a>
          </div>
        </div>
      </nav>

      <main class="p-6 md:p-12 max-w-[1600px] mx-auto space-y-12">
        <!-- Header Actions -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in-up">
          <div class="space-y-2">
            <h2 class="text-4xl font-display italic">Product Management</h2>
            <p class="text-text-base/40 text-sm font-light">Curate and manage your high-end inventory.</p>
          </div>
          <button 
            (click)="showAddForm.set(true)"
            class="bg-primary text-background-dark font-bold text-xs uppercase tracking-widest px-8 py-4 rounded hover:scale-105 transition-transform shadow-xl shadow-primary/20"
          >
            Add New Item
          </button>
        </div>

        <!-- Filters & Search -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style="animation-delay: 100ms">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-base/30 !text-[20px]">search</span>
            <input 
              [(ngModel)]="searchQuery"
              placeholder="Search by name..."
              class="w-full bg-surface-base/5 border border-surface-base/10 rounded-lg pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary/50 transition-colors text-text-base"
            />
          </div>
          <select 
            [(ngModel)]="selectedCategory"
            class="bg-surface-base/5 border border-surface-base/10 rounded-lg px-4 py-4 text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none text-text-base"
          >
            <option value="All" class="bg-surface-base text-text-base">All Categories</option>
            @for (cat of categories; track cat) {
              <option [value]="cat" class="bg-surface-base text-text-base">{{ cat | titlecase }}</option>
            }
          </select>
        </div>

        <!-- Table -->
        <div class="glass-panel border border-surface-base/5 rounded-xl overflow-hidden animate-fade-in-up" style="animation-delay: 200ms">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-base/5 text-[10px] uppercase font-bold tracking-widest text-text-base/50">
                  <th class="px-6 py-4">Item</th>
                  <th class="px-6 py-4">Category</th>
                  <th class="px-6 py-4">Price</th>
                  <th class="px-6 py-4">Stock</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-base/5">
                @for (product of filteredProducts(); track product.id) {
                  <tr class="group hover:bg-surface-base/[0.02] transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-4">
                        <div class="size-12 rounded bg-surface-base/5 overflow-hidden flex-shrink-0">
                          <img [src]="product.thumbnail" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <span class="text-sm font-medium">{{ product.title }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-[10px] font-bold uppercase tracking-widest text-text-base/30 border border-surface-base/10 px-2 py-1 rounded">{{ product.category }}</span>
                    </td>
                    <td class="px-6 py-4 text-sm">{{ product.price | currency }}</td>
                    <td class="px-6 py-4">
                      <span class="text-sm" [class.text-red-400]="product.stock < 10">{{ product.stock }}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button 
                        (click)="deleteProduct(product.id)"
                        class="text-text-base/20 hover:text-red-500 transition-colors p-2"
                      >
                        <span class="material-symbols-outlined !text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-6 py-20 text-center text-text-base/20 italic">No products found matching your criteria.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <!-- Add Product Modal -->
      @if (showAddForm()) {
        <div class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div class="glass-panel w-full max-w-xl border border-text-base/10 rounded-2xl overflow-hidden animate-scale-in">
            <div class="p-8 border-b border-surface-base/5 flex items-center justify-between">
              <h3 class="text-2xl font-display">New Masterpiece</h3>
              <button (click)="showAddForm.set(false)" class="text-text-base/40 hover:text-text-base transition-colors">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <form (ngSubmit)="addProduct()" class="p-8 space-y-6">
              <div class="grid grid-cols-2 gap-6 text-text-base">
                <div class="space-y-2 col-span-2">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-text-base/40 block">Product Title</label>
                  <input [(ngModel)]="newProduct.title" name="title" required class="w-full bg-surface-base/5 border border-surface-base/10 rounded px-4 py-3 focus:outline-none focus:border-primary/50" placeholder="E.g. Vintage Silk Scarf" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-text-base/40 block">Category</label>
                  <select [(ngModel)]="newProduct.category" name="category" class="w-full bg-surface-base/5 border border-surface-base/10 rounded px-4 py-3 focus:outline-none focus:border-primary/50 appearance-none">
                    @for (cat of categories; track cat) {
                      <option [value]="cat">{{ cat | titlecase }}</option>
                    }
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-text-base/40 block">Price (USD)</label>
                  <input type="number" [(ngModel)]="newProduct.price" name="price" required class="w-full bg-surface-base/5 border border-surface-base/10 rounded px-4 py-3 focus:outline-none focus:border-primary/50" placeholder="0.00" />
                </div>
                <div class="space-y-2 col-span-2">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-text-base/40 block">Image URL (Unsplash recommended)</label>
                  <input [(ngModel)]="newProduct.thumbnail" name="thumbnail" required class="w-full bg-surface-base/5 border border-surface-base/10 rounded px-4 py-3 focus:outline-none focus:border-primary/50" placeholder="https://..." />
                </div>
              </div>
              <button type="submit" class="w-full bg-text-base text-background-base font-bold text-xs uppercase tracking-widest py-4 rounded hover:bg-primary hover:text-background-base transition-colors shadow-lg shadow-text-base/5">
                Release Product
              </button>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .glass-panel {
      background: rgba(24, 22, 17, 0.7);
      backdrop-filter: blur(20px);
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-scale-in {
      animation: scaleIn 0.3s ease-out forwards;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  products = signal<Product[]>([]);
  searchQuery = '';
  selectedCategory = 'All';
  showAddForm = signal(false);

  categories = [
    'mens-shirts', 'womens-dresses', 'tops', 'womens-shoes',
    'mens-shoes', 'womens-bags', 'sunglasses', 'mens-watches',
    'womens-watches', 'womens-jewellery', 'fragrances'
  ];

  newProduct: Partial<Product> = {
    category: 'womens-bags',
    stock: 25
  };

  filteredProducts = computed(() => {
    return this.products().filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.selectedCategory === 'All' || p.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  });

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => {
      this.products.set(data);
    });
  }

  addProduct() {
    if (!this.newProduct.title || !this.newProduct.price || !this.newProduct.thumbnail) return;

    this.productService.addProduct(this.newProduct);
    this.showAddForm.set(false);
    this.newProduct = { category: 'womens-bags', stock: 25 };
    this.loadProducts();
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to remove this piece from the collection?')) {
      this.productService.deleteProduct(id);
      this.loadProducts();
    }
  }

  logout() {
    localStorage.removeItem('isAdmin');
    this.router.navigate(['/admin/login']);
  }
}
