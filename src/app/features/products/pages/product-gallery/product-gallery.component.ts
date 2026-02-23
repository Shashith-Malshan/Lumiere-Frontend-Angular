import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProductService, Product } from '../../../../core/services/product.service';
import { CartService, CartItem } from '../../../../core/services/cart.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

type NavState = 'collections' | 'new-arrivals' | 'editorial';

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, CurrencyPipe],
  template: `
    <div class="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans antialiased overflow-x-hidden">
      
      <!-- Navigation -->
      <div class="fixed top-0 left-0 right-0 z-50 glass-panel transition-all duration-300">
        <header class="flex items-center justify-between px-6 py-4 max-w-[1440px] mx-auto w-full">
          <!-- Brand -->
          <div class="flex items-center gap-8">
            <a class="flex items-center gap-3 text-white group" href="#" (click)="setNav('collections', $event)">
              <div class="size-6 text-primary transition-transform group-hover:rotate-45 duration-500">
                <span class="material-symbols-outlined !text-[24px]">diamond</span>
              </div>
              <h2 class="text-white text-2xl font-display font-bold tracking-[0.05em]">AURELIA</h2>
            </a>
            <!-- Desktop Nav Links -->
            <nav class="hidden md:flex items-center gap-8 ml-8">
              <a 
                class="hover:text-primary text-xs font-medium uppercase tracking-widest transition-colors cursor-pointer"
                [class.text-primary]="navState() === 'collections'"
                [class.text-white/70]="navState() !== 'collections'"
                (click)="setNav('collections', $event)"
              >Collections</a>
              <a 
                class="hover:text-primary text-xs font-medium uppercase tracking-widest transition-colors cursor-pointer"
                [class.text-primary]="navState() === 'new-arrivals'"
                [class.text-white/70]="navState() !== 'new-arrivals'"
                (click)="setNav('new-arrivals', $event)"
              >New Arrivals</a>
              <a 
                class="hover:text-primary text-xs font-medium uppercase tracking-widest transition-colors cursor-pointer"
                [class.text-primary]="navState() === 'editorial'"
                [class.text-white/70]="navState() !== 'editorial'"
                (click)="setNav('editorial', $event)"
              >Editorial</a>
            </nav>
          </div>
          <!-- Actions -->
          <div class="flex items-center gap-6">
            <div class="hidden lg:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-64 focus-within:border-primary/50 transition-colors">
              <span class="material-symbols-outlined text-white/50 !text-[20px]">search</span>
              <input class="bg-transparent border-none text-sm text-white placeholder-white/30 focus:ring-0 w-full ml-2 font-light" placeholder="Search curated items..." type="text"/>
            </div>
            <div class="flex items-center gap-4">
              <button class="text-white hover:text-primary transition-colors">
                <span class="material-symbols-outlined">favorite</span>
              </button>
              <button 
                class="relative flex items-center gap-2 text-white hover:text-primary transition-colors group"
                (click)="toggleCart()"
              >
                <span class="material-symbols-outlined">shopping_bag</span>
                @if (cartCount() > 0) {
                  <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background-dark">
                    {{ cartCount() }}
                  </span>
                }
              </button>
            </div>
          </div>
        </header>
      </div>

      <!-- Cart Sidebar Overlay -->
      @if (isCartOpen()) {
        <div 
          class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity"
          (click)="toggleCart()"
        ></div>
      }

      <!-- Cart Sidebar -->
      <aside 
        class="fixed top-0 right-0 z-[110] h-full w-full max-w-md bg-surface-dark shadow-2xl transition-transform duration-500 transform"
        [class.translate-x-0]="isCartOpen()"
        [class.translate-x-full]="!isCartOpen()"
      >
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between p-6 border-b border-white/5">
            <h2 class="text-xl font-display text-white">Your Selection</h2>
            <button (click)="toggleCart()" class="text-white/40 hover:text-white transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 no-scrollbar">
            @if (cartItems().length === 0) {
              <div class="h-full flex flex-col items-center justify-center gap-4 text-center">
                <span class="material-symbols-outlined !text-[64px] text-white/5">shopping_bag</span>
                <p class="text-white/40 italic">Your collection is empty.</p>
                <button (click)="toggleCart()" class="text-primary text-xs font-bold uppercase tracking-widest hover:underline">Start Browsing</button>
              </div>
            } @else {
              <div class="space-y-6">
                @for (item of cartItems(); track item.id) {
                  <div class="flex gap-4 group">
                    <div class="size-24 rounded bg-background-dark overflow-hidden flex-shrink-0">
                      <img [src]="item.thumbnail" [alt]="item.title" class="w-full h-full object-cover"/>
                    </div>
                    <div class="flex-1 flex flex-col justify-center gap-1">
                      <div class="flex justify-between">
                        <h4 class="text-white text-sm font-medium">{{ item.title }}</h4>
                        <button (click)="removeFromCart(item.id)" class="text-white/20 hover:text-red-400 transition-colors">
                          <span class="material-symbols-outlined !text-[18px]">delete</span>
                        </button>
                      </div>
                      <p class="text-white/40 text-[10px] uppercase tracking-widest font-bold">{{ item.category }}</p>
                      <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center border border-white/10 rounded overflow-hidden">
                          <button (click)="updateQty(item.id, item.quantity - 1)" class="px-2 py-1 text-white/40 hover:bg-white/5 transition-colors">-</button>
                          <span class="px-3 py-1 text-white text-xs">{{ item.quantity }}</span>
                          <button (click)="updateQty(item.id, item.quantity + 1)" class="px-2 py-1 text-white/40 hover:bg-white/5 transition-colors">+</button>
                        </div>
                        <span class="text-primary font-bold text-sm">{{ item.price * item.quantity | currency }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          @if (cartItems().length > 0) {
            <div class="p-6 bg-background-dark border-t border-white/5">
              <div class="flex justify-between items-center mb-6">
                <span class="text-white/40 text-sm uppercase tracking-widest">Subtotal</span>
                <span class="text-2xl font-display text-white">{{ cartTotal() | currency }}</span>
              </div>
              <button class="w-full bg-primary text-background-dark font-bold uppercase tracking-[0.2em] py-4 rounded hover:bg-white transition-colors">
                Checkout Now
              </button>
              <p class="text-center text-white/20 text-[10px] mt-4 uppercase tracking-widest font-medium italic">
                Complimentary shipping on all luxury orders.
              </p>
            </div>
          }
        </div>
      </aside>

      <!-- Main Content -->
      <main class="relative min-h-screen pb-20 pt-[72px]">
        <!-- Hero Section -->
        @if (navState() !== 'editorial') {
          <section class="relative h-[85vh] w-full overflow-hidden">
            <div class="absolute inset-0 z-0">
              <img alt="Collection" class="h-full w-full object-cover object-center opacity-70" src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"/>
              <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/30 to-transparent"></div>
              <div class="absolute inset-0 bg-gradient-to-r from-background-dark/60 via-transparent to-transparent"></div>
            </div>
            <div class="relative z-10 flex h-full flex-col justify-center px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto">
              <div class="max-w-2xl animate-fade-in-up">
                <span class="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4 block">New Season 2024</span>
                <h1 class="text-5xl md:text-7xl lg:text-8xl font-display font-medium text-white leading-[1.1] mb-6">
                  {{ navState() === 'new-arrivals' ? 'Fresh' : 'Divine' }} <br/>
                  <span class="italic text-white/90 font-light">{{ navState() === 'new-arrivals' ? 'arrivals' : 'Elegance' }}</span>
                </h1>
                <p class="text-lg md:text-xl text-white/70 font-light max-w-md mb-10 leading-relaxed">
                  Experience the pinnacle of fashion artistry. Curated for those who command presence and celebrate sophistication.
                </p>
                <button (click)="setNav('collections', $event)" class="group relative px-8 py-4 overflow-hidden rounded-none bg-transparent text-white border border-white/30 hover:border-primary transition-colors duration-300">
                  <div class="absolute inset-0 w-0 bg-primary transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
                  <span class="relative flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
                    Explore Selection
                    <span class="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1 !text-[18px]">arrow_forward</span>
                  </span>
                </button>
              </div>
            </div>
          </section>
        }

        <!-- Editorial Section -->
        @if (navState() === 'editorial') {
          <section class="relative min-h-[85vh] flex items-center justify-center p-6 md:p-12 lg:p-24 overflow-hidden">
          <div class="max-w-4xl text-center animate-fade-in-up">
             <span class="text-primary text-sm font-bold uppercase tracking-[0.3em] mb-8 block">Exclusive Editorial</span>
             <h2 class="text-5xl md:text-7xl font-display text-white mb-12 italic leading-tight">The Modern Muse</h2>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                <p class="text-white/60 text-lg leading-relaxed font-light">
                  A deep dive into the silhouettes of tomorrow. Our latest editorial explores the intersection of traditional craftsmanship and avant-garde design, featuring pieces that redefine contemporary luxury.
                </p>
                <p class="text-white/60 text-lg leading-relaxed font-light">
                  Captured in the heart of Milan, these visuals speak to the soul of the collection—refined, daring, and unapologetically elegant. Discover the story behind the stitches.
                </p>
             </div>
             <button (click)="setNav('collections', $event)" class="mt-16 text-primary border-b border-primary pb-2 text-sm font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all">
                Discover the story pieces
             </button>
          </div>
          <!-- Background accent -->
           <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none">
             <span class="material-symbols-outlined !text-[500px]">auto_awesome</span>
           </div>
        </section>

        <!-- Product Gallery Section -->
        <section *ngIf="navState() !== 'editorial'" class="p-6 md:p-12 lg:p-24 max-w-[1600px] mx-auto">
          <!-- Filter / Breadcrumbs -->
          <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/5 pb-6">
            <div>
              <div class="flex items-center gap-2 text-sm text-white/40 mb-2">
                <a class="hover:text-primary transition-colors cursor-pointer" (click)="setNav('collections', $event)">Home</a>
                <span>/</span>
                <span class="text-primary">{{ navState() === 'new-arrivals' ? 'New Arrivals' : selectedCategory() }}</span>
              </div>
              <h2 class="text-3xl md:text-4xl font-display text-white">
                {{ navState() === 'new-arrivals' ? 'New Arrivals' : (selectedCategory() === 'All Items' ? 'Curated Collection' : selectedCategory()) }}
              </h2>
            </div>
            <!-- Categories (only for collections) -->
            <div *ngIf="navState() === 'collections'" class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              @for (cat of UI_CATEGORIES; track cat) {
                <button 
                  (click)="setCategory(cat)"
                  [class]="cat === selectedCategory() 
                    ? 'px-5 py-2 rounded-full border border-primary/50 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all'
                    : 'px-5 py-2 rounded-full border border-white/10 hover:border-white/30 text-white/60 hover:text-white text-xs font-medium uppercase tracking-widest whitespace-nowrap transition-all'"
                >
                  {{ cat }}
                </button>
              }
            </div>
          </div>

          <!-- Error State -->
          @if (error()) {
            <div class="text-center py-20 bg-surface-dark/50 rounded-2xl border border-white/5">
              <span class="material-symbols-outlined !text-[48px] text-zinc-700 mb-4">error</span>
              <h4 class="text-xl font-display text-white mb-2">A momentary interruption</h4>
              <p class="text-white/40 mb-6">{{ error() }}</p>
              <button (click)="loadProducts()" class="text-primary uppercase tracking-widest text-xs font-bold hover:underline">Try Again</button>
            </div>
          }

          <!-- Product Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
            <!-- Skeleton Loading State -->
            @if (isLoading()) {
              @for (i of [1,2,3,4,5,6,7,8,9,10,11,12]; track i) {
                <div class="relative flex flex-col gap-3 animate-pulse">
                  <div class="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-white/5">
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] animate-shimmer"></div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <div class="h-4 w-3/4 bg-white/10 rounded"></div>
                    <div class="h-3 w-1/4 bg-white/10 rounded"></div>
                  </div>
                </div>
              }
            } @else {
              <!-- Product Cards Grid -->
              @for (product of filteredProducts(); track product.id) {
                <app-product-card [product]="product" class="animate-fade-in-up" [style.animation-delay]="($index % 10 * 50) + 'ms'"></app-product-card>
              }
            }
          </div>

          @if (filteredProducts().length === 0 && !isLoading()) {
            <div class="text-center py-20">
              <p class="text-white/40 italic">No pieces found in this collection currently.</p>
            </div>
          }

          <div *ngIf="navState() === 'collections'" class="mt-20 flex justify-center">
            <button class="px-8 py-3 text-white border border-white/20 rounded-full hover:bg-white hover:text-background-dark transition-all text-sm font-bold uppercase tracking-widest">
              Load More Products
            </button>
          </div>
        </section>

        <!-- Newsletter Section -->
        <section class="py-24 bg-surface-dark border-t border-white/5">
          <div class="max-w-4xl mx-auto px-6 text-center">
            <span class="material-symbols-outlined !text-[48px] text-primary mb-6">mark_email_read</span>
            <h2 class="text-3xl md:text-5xl font-display text-white mb-4">Join the Inner Circle</h2>
            <p class="text-white/60 mb-8 max-w-lg mx-auto">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input class="flex-1 bg-background-dark border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:ring-0" placeholder="Enter your email" type="email"/>
              <button class="bg-primary text-background-dark px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </section>

        <!-- Footer -->
        <footer class="bg-background-dark border-t border-white/5 pt-16 pb-8">
          <div class="max-w-[1440px] mx-auto px-6 lg:px-24">
            <div class="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
              <div class="flex flex-col gap-6 max-w-xs">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">diamond</span>
                  <h3 class="text-white text-xl font-display font-bold tracking-widest">AURELIA</h3>
                </div>
                <p class="text-white/50 text-sm leading-relaxed">
                  A curated sanctuary for the modern connoisseur. We believe in quality, craftsmanship, and the art of living well.
                </p>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-24">
                <div class="flex flex-col gap-4">
                  <h4 class="text-white text-sm font-bold uppercase tracking-widest">Shop</h4>
                  <a class="text-white/60 hover:text-primary transition-colors text-sm cursor-pointer" (click)="setNav('new-arrivals', $event)">New Arrivals</a>
                  <a class="text-white/60 hover:text-primary transition-colors text-sm cursor-pointer" (click)="setNav('collections', $event)">Bestsellers</a>
                  <a class="text-white/60 hover:text-primary transition-colors text-sm cursor-pointer" (click)="setCategory('Bags')">Accessories</a>
                </div>
                <div class="flex flex-col gap-4">
                  <h4 class="text-white text-sm font-bold uppercase tracking-widest">Company</h4>
                  <a class="text-white/60 hover:text-primary transition-colors text-sm cursor-pointer" (click)="setNav('editorial', $event)">Our Story</a>
                  <a class="text-white/60 hover:text-primary transition-colors text-sm" href="#">Careers</a>
                  <a class="text-white/60 hover:text-primary transition-colors text-sm" href="#">Press</a>
                </div>
                <div class="flex flex-col gap-4">
                  <h4 class="text-white text-sm font-bold uppercase tracking-widest">Support</h4>
                  <a class="text-white/60 hover:text-primary transition-colors text-sm" href="#">Contact Us</a>
                  <a class="text-white/60 hover:text-primary transition-colors text-sm" href="#">Shipping</a>
                  <a class="text-white/60 hover:text-primary transition-colors text-sm" href="#">Returns</a>
                </div>
              </div>
            </div>
            <div class="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 pt-8">
              <p class="text-white/30 text-xs">© 2024 Aurelia Luxury. All rights reserved.</p>
              <div class="flex gap-6">
                <a class="text-white/30 hover:text-white transition-colors text-xs" href="#">Privacy Policy</a>
                <a class="text-white/30 hover:text-white transition-colors text-xs" href="#">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ProductGalleryComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  products = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedCategory = signal<string>('All Items');
  navState = signal<NavState>('collections');
  isCartOpen = signal<boolean>(false);

  cartItems = this.cartService.items;
  cartCount = this.cartService.count;
  cartTotal = this.cartService.total;

  UI_CATEGORIES = ['All Items', 'Apparel', 'Shoes', 'Bags', 'Accessories'];

  private categoryMap: Record<string, string[]> = {
    'Apparel': ['mens-shirts', 'womens-dresses', 'tops'],
    'Shoes': ['womens-shoes', 'mens-shoes'],
    'Bags': ['womens-bags'],
    'Accessories': ['sunglasses']
  };

  filteredProducts = computed(() => {
    let list = this.products();
    const nav = this.navState();
    const category = this.selectedCategory();

    if (nav === 'new-arrivals') {
      return list.slice(0, 12);
    }

    if (nav === 'editorial') {
      return []; // Editorial view has its own content
    }

    if (category === 'All Items') return list;

    const apiCategories = this.categoryMap[category] || [];
    return list.filter(p => apiCategories.includes(p.category));
  });

  ngOnInit() {
    this.loadProducts();
  }

  setNav(state: NavState, event?: Event) {
    if (event) event.preventDefault();
    this.navState.set(state);
    if (state !== 'collections') {
      this.selectedCategory.set('All Items');
    }
  }

  setCategory(category: string) {
    this.navState.set('collections');
    this.selectedCategory.set(category);
  }

  toggleCart() {
    this.isCartOpen.update(v => !v);
  }

  removeFromCart(id: number) {
    this.cartService.removeFromCart(id);
  }

  updateQty(id: number, qty: number) {
    this.cartService.updateQuantity(id, qty);
  }

  loadProducts() {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.error.set('Failed to fetch products. Please check your connection.');
        this.isLoading.set(false);
      }
    });
  }
}
