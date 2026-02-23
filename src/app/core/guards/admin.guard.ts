import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
    const router = inject(Router);
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (isAdmin) {
        return true;
    } else {
        router.navigate(['/admin/login']);
        return false;
    }
};
