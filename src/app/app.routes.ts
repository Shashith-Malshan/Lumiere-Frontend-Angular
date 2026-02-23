import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/products/pages/product-gallery/product-gallery.component').then(m => m.ProductGalleryComponent)
    },
    {
        path: 'admin/login',
        loadComponent: () => import('./features/admin/pages/login/admin-login.component').then(m => m.AdminLoginComponent)
    },
    {
        path: 'admin/dashboard',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/pages/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
    }
];
