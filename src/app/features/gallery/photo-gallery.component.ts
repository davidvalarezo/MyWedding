import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../../core/services/photo.service';
import { Photo } from '../../models/photo.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <h2 class="text-3xl text-center mb-12 text-slate-700 italic">Galería de Recuerdos</h2>
      
      <div *ngIf="(photos$ | async) as photos; else loading" class="masonry-grid">
        <div *ngFor="let photo of photos; let i = index" 
             class="masonry-item animate-fade-in"
             [style.animation-delay]="(i % 10) * 100 + 'ms'">
          <div class="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gold/10">
            <img 
              [src]="photo.url" 
              [alt]="photo.name"
              class="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <p class="text-white text-xs font-light tracking-widest uppercase">
                {{ photo.createdAt?.seconds ? (photo.createdAt.seconds * 1000 | date:'shortTime') : 'Subiendo...' }}
              </p>
            </div>
          </div>
        </div>
        
        <div *ngIf="photos.length === 0" class="col-span-full text-center py-20">
          <p class="text-slate-400 italic">Aún no hay fotos. ¡Sé el primero en compartir un momento!</p>
        </div>
      </div>
      
      <ng-template #loading>
        <div class="flex justify-center py-20">
          <div class="animate-pulse flex flex-col items-center">
            <div class="w-12 h-12 bg-gold/20 rounded-full mb-4"></div>
            <p class="text-gold/40 tracking-[0.3em] uppercase text-xs">Cargando Galería</p>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PhotoGalleryComponent implements OnInit {
  photos$!: Observable<Photo[]>;

  constructor(private photoService: PhotoService) { }

  ngOnInit() {
    this.photos$ = this.photoService.getPhotos();
  }
}
