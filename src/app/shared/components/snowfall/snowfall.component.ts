import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Snowflake {
    left: string;
    delay: string;
    duration: string;
    size: string;
    opacity: number;
}

@Component({
    selector: 'app-snowfall',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      <div 
        *ngFor="let flake of flakes()" 
        class="absolute top-[-20px] text-white select-none animate-snowfall"
        [style.left]="flake.left"
        [style.animation-delay]="flake.delay"
        [style.animation-duration]="flake.duration"
        [style.font-size]="flake.size"
        [style.opacity]="flake.opacity"
      >
        ❅
      </div>
    </div>
  `,
    styles: [`
    .animate-snowfall {
      animation-name: snowfall;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  `]
})
export class SnowfallComponent implements OnInit {
    flakes = signal<Snowflake[]>([]);

    ngOnInit() {
        this.generateFlakes();
    }

    generateFlakes() {
        const flakeCount = 50;
        const newFlakes: Snowflake[] = [];

        for (let i = 0; i < flakeCount; i++) {
            newFlakes.push({
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 20}s`,
                duration: `${10 + Math.random() * 20}s`,
                size: `${10 + Math.random() * 20}px`,
                opacity: 0.3 + Math.random() * 0.7
            });
        }

        this.flakes.set(newFlakes);
    }
}
