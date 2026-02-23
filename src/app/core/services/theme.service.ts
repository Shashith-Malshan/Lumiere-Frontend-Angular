import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    theme = signal<Theme>((localStorage.getItem('user-theme') as Theme) || 'dark');
    isChristmasMode = signal<boolean>(localStorage.getItem('christmas-mode') === 'true');

    constructor() {
        // Apply initial state
        this.applyTheme(this.theme());
        this.applyChristmas(this.isChristmasMode());

        // Sync theme
        effect(() => {
            const currentTheme = this.theme();
            localStorage.setItem('user-theme', currentTheme);
            this.applyTheme(currentTheme);
        });

        // Sync Christmas Mode
        effect(() => {
            const isChristmas = this.isChristmasMode();
            localStorage.setItem('christmas-mode', String(isChristmas));
            this.applyChristmas(isChristmas);
        });
    }

    toggleTheme() {
        this.theme.update(t => t === 'light' ? 'dark' : 'light');
    }

    toggleChristmasMode() {
        this.isChristmasMode.update(v => !v);
    }

    private applyTheme(theme: Theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }

    private applyChristmas(active: boolean) {
        const root = document.documentElement;
        if (active) {
            root.classList.add('christmas');
        } else {
            root.classList.remove('christmas');
        }
    }
}
