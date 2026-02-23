import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProductService, Product } from '../../../../core/services/product.service';
import { CartService, CartItem } from '../../../../core/services/cart.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SnowfallComponent } from '../../../../shared/components/snowfall/snowfall.component';

type NavState = 'collections' | 'new-arrivals' | 'editorial';

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, CurrencyPipe, SnowfallComponent],
  template: `
    <div class="min-h-screen bg-background-base text-text-base font-sans antialiased overflow-x-hidden transition-colors duration-500">
      
      <!-- Snowfall Effect -->
      <app-snowfall *ngIf="themeService.isChristmasMode()"></app-snowfall>
      
      <!-- Navigation -->
      <div class="fixed top-0 left-0 right-0 z-50 glass-panel transition-all duration-300">
        <header class="flex items-center justify-between px-6 py-4 max-w-[1440px] mx-auto w-full">
                <div class="flex items-center gap-8">
            <a class="flex items-center group" href="#" (click)="setNav('collections', $event)">
              <h2 class="text-2xl font-display font-bold tracking-[0.05em] transition-colors" [class.text-primary]="themeService.isChristmasMode()" [class.text-text-base]="!themeService.isChristmasMode()">AURELIA</h2>
            </a>
            <!-- Desktop Nav Links -->
            <nav class="hidden md:flex items-center gap-8 ml-8">
              <a 
                class="hover:text-primary text-xs font-medium uppercase tracking-widest transition-colors cursor-pointer"
                [class.text-primary]="navState() === 'collections'"
                [class.text-text-base/70]="navState() !== 'collections'"
                (click)="setNav('collections', $event)"
              >Collections</a>
              <a 
                class="hover:text-primary text-xs font-medium uppercase tracking-widest transition-colors cursor-pointer"
                [class.text-primary]="navState() === 'new-arrivals'"
                [class.text-text-base/70]="navState() !== 'new-arrivals'"
                (click)="setNav('new-arrivals', $event)"
              >New Arrivals</a>
              <a 
                class="hover:text-primary text-xs font-medium uppercase tracking-widest transition-colors cursor-pointer"
                [class.text-primary]="navState() === 'editorial'"
                [class.text-text-base/70]="navState() !== 'editorial'"
                (click)="setNav('editorial', $event)"
              >Editorial</a>
            </nav>
          </div>
          <!-- Actions -->
          <div class="flex items-center gap-6">
            <div class="hidden lg:flex items-center bg-surface-base/5 border border-surface-base/10 rounded-full px-4 py-2 w-64 focus-within:border-primary/50 transition-colors">
              <span class="material-symbols-outlined text-text-base/50 !text-[20px]">search</span>
              <input class="bg-transparent border-none text-sm text-text-base placeholder-text-base/30 focus:ring-0 w-full ml-2 font-light" placeholder="Search curated items..." type="text"/>
            </div>
            <div class="flex items-center gap-4">
              <button 
                (click)="themeService.toggleTheme()"
                class="text-text-base/60 hover:text-text-base transition-colors"
                title="Toggle Theme"
              >
                <span class="material-symbols-outlined">{{ themeService.theme() === 'light' ? 'dark_mode' : 'light_mode' }}</span>
              </button>
              <button class="text-text-base hover:text-primary transition-colors">
                <span class="material-symbols-outlined">favorite</span>
              </button>
              <button 
                class="relative flex items-center gap-2 text-text-base hover:text-primary transition-colors group"
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
        class="fixed top-0 right-0 z-[110] h-full w-full max-w-md bg-surface-base shadow-2xl transition-transform duration-500 transform border-l border-surface-base/5"
        [class.translate-x-0]="isCartOpen()"
        [class.translate-x-full]="!isCartOpen()"
      >
        <div class="flex flex-col h-full text-text-base">
          <div class="flex items-center justify-between p-6 border-b border-surface-base/5">
            <h2 class="text-xl font-display">Your Selection</h2>
            <button (click)="toggleCart()" class="text-text-base/40 hover:text-text-base transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 no-scrollbar">
            @if (cartItems().length === 0) {
              <div class="h-full flex flex-col items-center justify-center gap-4 text-center">
                <span class="material-symbols-outlined !text-[64px] text-text-base/5">shopping_bag</span>
                <p class="text-text-base/40 italic">Your collection is empty.</p>
                <button (click)="toggleCart()" class="text-primary text-xs font-bold uppercase tracking-widest hover:underline">Start Browsing</button>
              </div>
            } @else {
              <div class="space-y-6">
                @for (item of cartItems(); track item.id) {
                  <div class="flex gap-4 group">
                    <div class="size-24 rounded bg-background-base overflow-hidden flex-shrink-0 border border-surface-base/5">
                      <img [src]="item.thumbnail" [alt]="item.title" class="w-full h-full object-cover"/>
                    </div>
                    <div class="flex-1 flex flex-col justify-center gap-1">
                      <div class="flex justify-between">
                        <h4 class="text-sm font-medium">{{ item.title }}</h4>
                        <button (click)="removeFromCart(item.id)" class="text-text-base/20 hover:text-red-400 transition-colors">
                          <span class="material-symbols-outlined !text-[18px]">delete</span>
                        </button>
                      </div>
                      <p class="text-text-base/40 text-[10px] uppercase tracking-widest font-bold">{{ item.category }}</p>
                      <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center border border-surface-base/10 rounded overflow-hidden">
                          <button (click)="updateQty(item.id, item.quantity - 1)" class="px-2 py-1 text-text-base/40 hover:bg-surface-base/5 transition-colors">-</button>
                          <span class="px-3 py-1 text-xs font-medium">{{ item.quantity }}</span>
                          <button (click)="updateQty(item.id, item.quantity + 1)" class="px-2 py-1 text-text-base/40 hover:bg-surface-base/5 transition-colors">+</button>
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
            <div class="p-6 bg-background-base border-t border-surface-base/5">
              <div class="flex justify-between items-center mb-6">
                <span class="text-text-base/40 text-sm uppercase tracking-widest">Subtotal</span>
                <span class="text-2xl font-display">{{ cartTotal() | currency }}</span>
              </div>
              <button class="w-full bg-primary text-background-base font-bold uppercase tracking-[0.2em] py-4 rounded hover:bg-text-base hover:text-background-base transition-colors shadow-lg shadow-primary/20">
                Checkout Now
              </button>
              <p class="text-center text-text-base/20 text-[10px] mt-4 uppercase tracking-widest font-medium italic">
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
              <div class="absolute inset-0 bg-gradient-to-t from-background-base via-background-base/30 to-transparent"></div>
              <div class="absolute inset-0 bg-gradient-to-r from-background-base/60 via-transparent to-transparent"></div>
            </div>
            <div class="relative z-10 flex h-full flex-col justify-center px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto">
              <div class="max-w-2xl animate-fade-in-up">
                <span class="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4 block">New Season 2024</span>
                <h1 class="text-5xl md:text-7xl lg:text-8xl font-display font-medium leading-[1.1] mb-6 transition-colors" [class.text-primary]="themeService.isChristmasMode()" [class.text-text-base]="!themeService.isChristmasMode()">
                  {{ themeService.isChristmasMode() ? 'Festive' : (navState() === 'new-arrivals' ? 'Fresh' : 'Divine') }} <br/>
                  <span class="italic font-light" [class.text-text-base/90]="!themeService.isChristmasMode()" [class.text-primary/80]="themeService.isChristmasMode()">{{ themeService.isChristmasMode() ? 'Magic' : (navState() === 'new-arrivals' ? 'arrivals' : 'Elegance') }}</span>
                </h1>
                <p class="text-lg md:text-xl text-text-base/70 font-light max-w-md mb-10 leading-relaxed">
                  Experience the pinnacle of fashion artistry. Curated for those who command presence and celebrate sophistication.
                </p>
                <button (click)="setNav('collections', $event)" class="group relative px-8 py-4 overflow-hidden rounded-none bg-transparent text-text-base border border-text-base/30 hover:border-primary transition-colors duration-300">
                  <div class="absolute inset-0 w-0 bg-primary transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
                  <span class="relative flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
                    Explore Selection
                    <span class="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1 !text-[18px]">arrow_forward</span>
                  </span>
                </button>
              </div>
            </div>
          </section>

          <!-- Christmas Promotion Banner -->
          <div *ngIf="themeService.isChristmasMode()" class="bg-primary text-background-base py-4 overflow-hidden relative group">
            <div class="flex items-center gap-12 whitespace-nowrap animate-marquee">
              <span class="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                <span class="material-symbols-outlined !text-[14px]">celebration</span>
                Festive Season Sale: Up to 40% Off Selected Pieces
              </span>
              <span class="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                <span class="material-symbols-outlined !text-[14px]">ac_unit</span>
                Complimentary Holiday Wrapping on All Orders
              </span>
              <span class="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                <span class="material-symbols-outlined !text-[14px]">card_giftcard</span>
                Double Loyalty Points for Inner Circle Members
              </span>
              <!-- Repeat for seamless loop -->
              <span class="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                <span class="material-symbols-outlined !text-[14px]">celebration</span>
                Festive Season Sale: Up to 40% Off Selected Pieces
              </span>
            </div>
          </div>
        }

        <!-- Editorial Section -->
        @if (navState() === 'editorial') {
          <section class="relative min-h-[85vh] flex items-center justify-center p-6 md:p-12 lg:p-24 overflow-hidden">
          <div class="max-w-4xl text-center animate-fade-in-up">
             <span class="text-primary text-sm font-bold uppercase tracking-[0.3em] mb-8 block">Exclusive Editorial</span>
             <h2 class="text-text-base text-5xl md:text-7xl font-display mb-12 italic leading-tight uppercase">The Modern Muse</h2>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                <p class="text-text-base/60 text-lg leading-relaxed font-light">
                  A deep dive into the silhouettes of tomorrow. Our latest editorial explores the intersection of traditional craftsmanship and avant-garde design, featuring pieces that redefine contemporary luxury.
                </p>
                <p class="text-text-base/60 text-lg leading-relaxed font-light">
                  Captured in the heart of Milan, these visuals speak to the soul of the collection — refined, daring, and unapologetically elegant. Discover the story behind the stitches.
                </p>
             </div>
             <button (click)="setNav('collections', $event)" class="mt-16 text-primary border-b border-primary pb-2 text-sm font-bold uppercase tracking-widest hover:text-text-base hover:border-text-base transition-all">
                The Heritage Collection
             </button>
          </div>
          <!-- Background accent -->
           <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none">
             <span class="material-symbols-outlined !text-[500px]">auto_awesome</span>
           </div>
        </section>
        }

        <!-- Product Gallery Section -->
        <section *ngIf="navState() !== 'editorial'" class="p-6 md:p-12 lg:p-24 max-w-[1600px] mx-auto">
          <!-- Filter / Breadcrumbs -->
          <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-surface-base/10 pb-6">
            <div>
              <div class="flex items-center gap-2 text-sm text-text-base/40 mb-2">
                <a class="hover:text-primary transition-colors cursor-pointer" (click)="setNav('collections', $event)">Home</a>
                <span>/</span>
                <span class="text-primary">{{ navState() === 'new-arrivals' ? 'New Arrivals' : selectedCategory() }}</span>
              </div>
              <h2 class="text-3xl md:text-4xl font-display transition-colors" [class.text-primary]="themeService.isChristmasMode()" [class.text-text-base]="!themeService.isChristmasMode()">
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
                    : 'px-5 py-2 rounded-full border border-surface-base/10 hover:border-surface-base/30 text-text-base/60 hover:text-text-base text-xs font-medium uppercase tracking-widest whitespace-nowrap transition-all'"
                >
                  {{ cat }}
                </button>
              }
            </div>
          </div>

          <!-- Error State -->
          @if (error()) {
            <div class="text-center py-20 bg-surface-base/5 rounded-2xl border border-surface-base/10">
              <span class="material-symbols-outlined !text-[48px] text-text-base/20 mb-4">error</span>
              <h4 class="text-xl font-display text-text-base mb-2">A momentary interruption</h4>
              <p class="text-text-base/40 mb-6">{{ error() }}</p>
              <button (click)="loadProducts()" class="text-primary uppercase tracking-widest text-xs font-bold hover:underline">Try Again</button>
            </div>
          }

          <!-- Product Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
            <!-- Skeleton Loading State -->
            @if (isLoading()) {
              @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) {
                <div class="animate-pulse flex flex-col gap-4">
                  <div class="aspect-[3/4] bg-surface-base/5 rounded-lg border border-surface-base/5"></div>
                  <div class="h-4 bg-surface-base/5 rounded w-3/4"></div>
                  <div class="h-4 bg-surface-base/5 rounded w-1/4"></div>
                </div>
              }
            } @else {
              <!-- Product Cards Grid -->
              @for (product of paginatedProducts(); track product.id) {
                <app-product-card [product]="product" class="animate-fade-in-up" [style.animation-delay]="($index % 10 * 50) + 'ms'"></app-product-card>
              }
            }
          </div>

          @if (filteredProducts().length === 0 && !isLoading()) {
            <div class="text-center py-20">
              <p class="text-text-base/40 italic">No pieces found in this collection currently.</p>
            </div>
          }

          <!-- Pagination Controls -->
          <div *ngIf="!isLoading() && (hasMore() || currentPage() > 0)" class="mt-20 flex justify-center items-center gap-8 border-t border-surface-base/10 pt-12">
            <button 
              *ngIf="currentPage() > 0"
              (click)="prevPage()" 
              class="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-text-base/40 hover:text-primary transition-all"
            >
              <span class="material-symbols-outlined !text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
              Previous
            </button>
            <button 
              *ngIf="hasMore()"
              (click)="nextPage()" 
              class="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-text-base/40 hover:text-primary transition-all"
            >
              Next
              <span class="material-symbols-outlined !text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>

        </section>

        <!-- Newsletter Section -->
        <section class="py-24 bg-surface-base/5 border-t border-surface-base/10">
          <div class="max-w-4xl mx-auto px-6 text-center">
            <span class="material-symbols-outlined !text-[48px] text-primary mb-6">mark_email_read</span>
            <h2 class="text-3xl md:text-5xl font-display mb-4 transition-colors" [class.text-primary]="themeService.isChristmasMode()" [class.text-text-base]="!themeService.isChristmasMode()">Join the Inner Circle</h2>
            <p class="text-text-base/60 mb-8 max-w-lg mx-auto">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input class="flex-1 bg-surface-base/5 border border-surface-base/10 rounded-lg px-4 py-3 text-text-base placeholder-text-base/30 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Enter your email" type="email"/>
              <button class="bg-primary text-background-base px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-text-base hover:text-background-base transition-colors shadow-lg shadow-primary/20">
                Subscribe
              </button>
            </form>
          </div>
        </section>

        <!-- Footer -->
        <footer class="bg-surface-base border-t border-surface-base/5 pt-24 pb-12 px-6">
          <div class="max-w-[1440px] mx-auto space-y-24">
            <div class="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
              <div class="flex flex-col gap-6 max-w-xs">
                <div class="flex items-center gap-2">
                  <h3 class="text-text-base text-xl font-display font-bold tracking-widest uppercase">Aurelia</h3>
                </div>
                <p class="text-text-base/50 text-sm leading-relaxed">
                  A curated sanctuary for the modern connoisseur. We believe in quality, craftsmanship, and the art of living well.
                </p>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-24">
                <div class="flex flex-col gap-4">
                  <h4 class="text-text-base text-sm font-bold uppercase tracking-widest">Shop</h4>
                  <a class="text-text-base/60 hover:text-primary transition-colors text-sm cursor-pointer" (click)="setNav('new-arrivals', $event)">New Arrivals</a>
                  <a class="text-text-base/60 hover:text-primary transition-colors text-sm cursor-pointer" (click)="setNav('collections', $event)">Bestsellers</a>
                  <a class="text-text-base/60 hover:text-primary transition-colors text-sm cursor-pointer" (click)="setCategory('Bags')">Accessories</a>
                </div>
                <div class="flex flex-col gap-4">
                  <h4 class="text-text-base text-sm font-bold uppercase tracking-widest">Company</h4>
                  <a class="text-text-base/60 hover:text-primary transition-colors text-sm cursor-pointer" (click)="setNav('editorial', $event)">Our Story</a>
                  <a class="text-text-base/60 hover:text-primary transition-colors text-sm" href="/admin/login">Admin Portal</a>
                  <a class="text-text-base/60 hover:text-primary transition-colors text-sm" href="#">Careers</a>
                </div>
                <div class="flex flex-col gap-4">
                  <h4 class="text-text-base text-sm font-bold uppercase tracking-widest">Support</h4>
                  <a class="text-text-base/60 hover:text-primary transition-colors text-sm" href="#">Contact Us</a>
                  <a class="text-text-base/60 hover:text-primary transition-colors text-sm" href="#">Shipping</a>
                  <a class="text-text-base/60 hover:text-primary transition-colors text-sm" href="#">Returns</a>
                </div>
              </div>
            </div>
            <div class="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-surface-base/5 pt-8">
              <p class="text-text-base/30 text-xs">© 2024 Aurelia Luxury. All rights reserved.</p>
              <div class="flex gap-6">
                <a class="text-text-base/30 hover:text-text-base transition-colors text-xs" href="#">Privacy Policy</a>
                <a class="text-text-base/30 hover:text-text-base transition-colors text-xs" href="#">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  `,
  export class ProductGalleryComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  public themeService = inject(ThemeService);

  products = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedCategory = signal<string>('All Items');
  navState = signal<NavState>('collections');
  isCartOpen = signal<boolean>(false);
  currentPage = signal<number>(0);
  pageSize = 10;

  cartItems = this.cartService.items;
  cartCount = this.cartService.count;
  cartTotal = this.cartService.total;

  UI_CATEGORIES =['All Items', 'Apparel', 'Shoes', 'Bags', 'Accessories'];

  private categoryMap: Record<string, string[]> = {
    'Apparel': ['mens-shirts', 'womens-dresses', 'tops'],
    'Shoes': ['womens-shoes', 'mens-shoes'],
    'Bags': ['Bags', 'womens-bags'],
    'Accessories': ['sunglasses', 'mens-watches', 'womens-watches', 'womens-jewellery']
  };

  filteredProducts = computed(() => {
    let list = this.products().filter(p => p.isVisible);
    const nav = this.navState();
    const category = this.selectedCategory();

    if (nav === 'new-arrivals') {
      return list.slice(0, 12);
    }

    if (nav === 'editorial') {
      return [];
    }

    if (category === 'All Items') return list;

    const apiCategories = this.categoryMap[category] || [];
    return list.filter(p => apiCategories.includes(p.category));
  });

  paginatedProducts = computed(() => {
    const list = this.filteredProducts();
    const start = this.currentPage() * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  hasMore = computed(() => {
    return (this.currentPage() + 1) * this.pageSize < this.filteredProducts().length;
  });

  ngOnInit() {
    this.loadProducts();
  }

  setNav(state: NavState, event?: Event) {
    if (event) event.preventDefault();
    this.navState.set(state);
    this.currentPage.set(0);
    if (state !== 'collections') {
      this.selectedCategory.set('All Items');
    }
  }

  setCategory(category: string) {
    this.navState.set('collections');
    this.selectedCategory.set(category);
    this.currentPage.set(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  nextPage() {
    this.currentPage.update(p => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevPage() {
    this.currentPage.update(p => Math.max(0, p - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private readonly BAG_ASSETS =[
    { title: 'Signature Leather Tote', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000' },
    { title: 'Classic Quilted Flap', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000' },
    { title: 'Minimalist Bucket Bag', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=1000' },
    { title: 'Structured Top Handle', image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1000' },
    { title: 'Velvet Evening Clutch', image: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=1000' }
  ];

  loadProducts() {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        const transformedData = data.map(p => {
          if (p.category === 'fragrances' || p.category === 'womens-bags') {
            const isFragrance = p.category === 'fragrances';
            const assetIndex = p.id % this.BAG_ASSETS.length;
            const asset = this.BAG_ASSETS[assetIndex];

            return {
              ...p,
              title: isFragrance ? asset.title : p.title,
              category: 'Bags',
              thumbnail: isFragrance ? asset.image : p.thumbnail,
              images: isFragrance ? [asset.image] : p.images
            };
          }
          return p;
        });

        this.products.set(transformedData);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.error.set('Failed to fetch products. Please check your connection.');
        this.isLoading.set(false);
      }
    });
  }
}

