import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../../core/services/photo.service';
import { Photo } from '../../models/photo.model';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
        <h2 class="text-3xl font-romantic text-slate-700 italic">Galería de Recuerdos</h2>
        
        <div *ngIf="(selectedAlbumId$ | async) as albumId" class="animate-fade-in flex items-center gap-3 bg-gold/5 px-4 py-2 rounded-full border border-gold/20">
          <span class="text-xs uppercase tracking-widest text-gold-dark font-medium">Filtrado por álbum</span>
          <button (click)="clearFilter()" class="text-slate-400 hover:text-gold transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
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
              <div>
                <p class="text-white text-[10px] font-light tracking-[0.2em] uppercase mb-1">
                   {{ photo.createdAt?.seconds ? (photo.createdAt.seconds * 1000 | date:'dd MMM, HH:mm') : 'Subiendo...' }}
                </p>
                <!-- We could show the album name here if we had it in the photo model or fetched it -->
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="photos.length === 0" class="col-span-full text-center py-20 bg-cream/30 rounded-[3rem] border border-dashed border-gold/20">
          <div class="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-gold/30 mx-auto mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
               <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1.75 0z" />
             </svg>
          </div>
          <p class="text-slate-400 italic font-light">No se encontraron fotos en este álbum.</p>
          <button (click)="clearFilter()" class="mt-4 text-xs text-gold-dark hover:underline uppercase tracking-widest font-medium">Ver todas las fotos</button>
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
  private photoService = inject(PhotoService);

  photos$!: Observable<Photo[]>;
  selectedAlbumId$!: Observable<string | null>;

  ngOnInit() {
    this.selectedAlbumId$ = this.photoService.selectedAlbumId$;
    this.photos$ = this.selectedAlbumId$.pipe(
      switchMap(albumId => this.photoService.getPhotos(albumId || undefined))
    );
  }

  clearFilter() {
    this.photoService.selectAlbum(null);
  }
}
