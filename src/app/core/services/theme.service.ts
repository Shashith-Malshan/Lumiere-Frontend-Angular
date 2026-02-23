import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    theme = signal<Theme>((localStorage.getItem('user-theme') as Theme) || 'dark');

    constructor() {
        // Apply theme on initialization
        this.applyTheme(this.theme());

        // Sync localStorage and document class when signal changes
        effect(() => {
            const currentTheme = this.theme();
            localStorage.setItem('user-theme', currentTheme);
            this.applyTheme(currentTheme);
        });
    }

    toggleTheme() {
        this.theme.update(t => t === 'light' ? 'dark' : 'light');
    }

    private applyTheme(theme: Theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }
}
