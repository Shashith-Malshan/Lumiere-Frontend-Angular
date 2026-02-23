import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductGalleryComponent } from './features/products/pages/product-gallery/product-gallery.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProductGalleryComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('lumiere');
}
