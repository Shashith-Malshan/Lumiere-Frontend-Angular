import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-background-base flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      <!-- Background Accents -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="w-full max-w-md animate-fade-in-up relative z-10">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-display font-medium text-text-base mb-2 tracking-wider uppercase">Lumiere</h1>
          <p class="text-text-base/40 text-xs font-bold uppercase tracking-[0.3em]">Management Portal</p>
        </div>

        <div class="glass-panel p-10 border border-text-base/10 rounded-xl">
          <form (ngSubmit)="login()" #loginForm="ngForm" class="space-y-8">
            <div class="space-y-2">
              <label class="text-text-base/50 text-[10px] font-bold uppercase tracking-widest block ml-1">Username</label>
              <input 
                type="text" 
                name="username"
                [(ngModel)]="username"
                required
                class="w-full bg-surface-base/5 border border-text-base/10 rounded px-4 py-3 text-text-base focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="Manager access"
              />
            </div>

            <div class="space-y-2">
              <label class="text-text-base/50 text-[10px] font-bold uppercase tracking-widest block ml-1">Password</label>
              <input 
                type="password" 
                name="password"
                [(ngModel)]="password"
                required
                class="w-full bg-surface-base/5 border border-text-base/10 rounded px-4 py-3 text-text-base focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="••••"
              />
            </div>

            <div *ngIf="error()" class="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded text-center">
              {{ error() }}
            </div>

            <button 
              type="submit"
              class="w-full bg-text-base text-background-base font-bold text-xs uppercase tracking-widest py-4 rounded hover:bg-primary hover:text-background-base transition-all duration-300 shadow-xl shadow-text-base/5"
            >
              Authenticate
            </button>
          </form>
          
          <div class="mt-8 text-center border-t border-text-base/5 pt-8">
            <a href="/" class="text-text-base/30 hover:text-text-base text-[10px] font-bold uppercase tracking-widest transition-colors decoration-dotted underline underline-offset-4">Return to Storefront</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .glass-panel {
      background: color-mix(in srgb, var(--bg) 70%, transparent);
      backdrop-filter: blur(20px);
    }
  `]
})
export class AdminLoginComponent {
  private router = inject(Router);

  username = '';
  password = '';
  error = signal<string | null>(null);

  login() {
    this.error.set(null);
    if (this.username === 'admin' && this.password === '1234') {
      localStorage.setItem('isAdmin', 'true');
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.error.set('Invalid credentials provided.');
    }
  }
}
