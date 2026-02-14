import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../../core/services/photo.service';
import { Photo } from '../../models/photo.model';
import { Observable, switchMap, take } from 'rxjs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 relative">
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div class="space-y-1 text-center md:text-left">
          <h2 class="text-4xl font-romantic text-slate-700 italic">Galería de Recuerdos</h2>
          <p class="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-light">Revive cada instante especial</p>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Filtro Activo -->
          <div *ngIf="(selectedAlbumId$ | async) as albumId" class="animate-fade-in flex items-center gap-3 bg-gold/5 px-4 py-2 rounded-full border border-gold/20">
            <span class="text-[10px] uppercase tracking-widest text-gold-dark font-semibold">Álbum actual</span>
            <button (click)="clearFilter()" class="text-slate-400 hover:text-gold transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Botón de Modo Selección -->
          <button 
            (click)="toggleSelectionMode()"
            [class.bg-gold]="isSelectionMode"
            [class.text-white]="isSelectionMode"
            [class.bg-white]="!isSelectionMode"
            [class.text-gold-dark]="!isSelectionMode"
            class="px-6 py-2.5 rounded-full border border-gold/30 text-xs font-bold uppercase tracking-widest shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {{ isSelectionMode ? 'Cancelar Selección' : 'Seleccionar Fotos' }}
          </button>
        </div>
      </div>
      
      <!-- GRID DE FOTOS -->
      <div *ngIf="(photos$ | async) as photos; else loading" class="masonry-grid pb-24">
        <div *ngFor="let photo of photos; let i = index" 
             class="masonry-item animate-fade-in cursor-pointer"
             [style.animation-delay]="(i % 10) * 100 + 'ms'"
             (click)="isSelectionMode ? togglePhotoSelection(photo) : null">
          
          <div 
            class="group relative overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 border-2"
            [class.border-gold]="isPhotoSelected(photo)"
            [class.border-transparent]="!isPhotoSelected(photo)"
            [class.scale-[0.97]]="isPhotoSelected(photo)"
          >
            <!-- Checkbox de Selección -->
            <div 
              *ngIf="isSelectionMode" 
              class="absolute top-4 right-4 z-20 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center"
              [class.bg-gold]="isPhotoSelected(photo)"
              [class.border-gold]="isPhotoSelected(photo)"
              [class.border-white]="!isPhotoSelected(photo)"
              [class.shadow-lg]="isPhotoSelected(photo)"
            >
              <svg *ngIf="isPhotoSelected(photo)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="white" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>

            <!-- Imagen -->
            <img 
              [src]="photo.url" 
              [alt]="photo.name"
              class="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              [class.opacity-75]="isSelectionMode && !isPhotoSelected(photo)"
              loading="lazy"
            >

            <!-- Overlay normal con fecha/info -->
            <div *ngIf="!isSelectionMode" class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <div class="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p class="text-white text-[9px] font-bold tracking-[0.2em] uppercase mb-1 opacity-80">
                   {{ photo.createdAt?.seconds ? (photo.createdAt.seconds * 1000 | date:'dd MMM, HH:mm') : 'Recién subida' }}
                </p>
                <p class="text-white/60 text-[8px] uppercase tracking-widest font-light">Toca para ampliar</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Estado Vacío -->
        <div *ngIf="photos.length === 0" class="col-span-full text-center py-24 bg-cream/20 rounded-[4rem] border-2 border-dashed border-gold/10">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gold/20 mx-auto mb-6 shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-10 h-10">
               <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1.75 0z" />
             </svg>
          </div>
          <p class="text-slate-500 italic font-light text-lg">Aún no hay fotos en este álbum.</p>
          <button (click)="clearFilter()" class="mt-6 text-[10px] text-gold-dark hover:text-gold transition-colors uppercase tracking-[0.3em] font-bold">Ver toda la galería</button>
        </div>
      </div>
      
      <!-- BARRA DE ACCIÓN FLOTANTE -->
      <div 
        *ngIf="isSelectionMode && selectedPhotos.size > 0" 
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-2xl bg-slate-900/90 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] p-2 md:p-4 flex items-center justify-between shadow-2xl border border-white/10 animate-fade-in-up"
      >
        <div class="pl-4 md:px-6 flex flex-col min-w-0">
          <span class="text-white text-xs md:text-sm font-bold truncate">
            {{ selectedPhotos.size }} {{ selectedPhotos.size === 1 ? 'Foto' : 'Fotos' }}
          </span>
          <span class="text-white/40 text-[8px] md:text-[9px] uppercase tracking-widest truncate">Seleccionadas</span>
        </div>

        <div class="flex items-center gap-1 md:gap-2">
          <button 
            (click)="clearSelection()"
            class="px-3 md:px-6 py-3 text-white/60 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
          >
            Limpiar
          </button>
          <button 
            (click)="downloadSelected()"
            [disabled]="isDownloading"
            class="px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-gold-dark to-gold text-white rounded-[1rem] md:rounded-[1.2rem] font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-gold/20 hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50 flex items-center gap-2 md:gap-3"
          >
            <svg *ngIf="!isDownloading" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 md:w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <div *ngIf="isDownloading" class="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span class="hidden xs:inline">{{ isDownloading ? 'Preparando...' : 'Descargar ZIP' }}</span>
            <span class="xs:hidden">{{ isDownloading ? '...' : 'ZIP' }}</span>
          </button>
        </div>
      </div>

      <!-- OVERLAY DE DESCARGA -->
      <div *ngIf="isDownloading" class="fixed inset-0 z-[150] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
        <div class="relative w-32 h-32 mb-8">
          <div class="absolute inset-0 border-4 border-gold/10 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center text-gold">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 animate-bounce">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
        </div>
        <h3 class="text-2xl font-romantic text-slate-800 italic mb-2 px-8 text-center">Generando archivo comprimido</h3>
        <p class="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-light px-8 text-center max-w-sm">Esto puede tardar unos segundos, por favor espera...</p>
      </div>

      <!-- CARGANDO -->
      <ng-template #loading>
        <div class="flex justify-center py-32">
          <div class="flex flex-col items-center px-8 text-center">
            <div class="w-16 h-16 border-4 border-gold/10 border-t-gold rounded-full animate-spin mb-6"></div>
            <p class="text-gold-dark/40 tracking-[0.4em] uppercase text-[10px] font-bold">Iniciando Galería</p>
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

  // Estado de Selección
  isSelectionMode = false;
  selectedPhotos = new Set<Photo>();
  isDownloading = false;

  ngOnInit() {
    this.selectedAlbumId$ = this.photoService.selectedAlbumId$;
    this.photos$ = this.selectedAlbumId$.pipe(
      switchMap(albumId => this.photoService.getPhotos(albumId || undefined))
    );
  }

  clearFilter() {
    this.photoService.selectAlbum(null);
  }

  // LÓGICA DE SELECCIÓN
  toggleSelectionMode() {
    this.isSelectionMode = !this.isSelectionMode;
    if (!this.isSelectionMode) {
      this.clearSelection();
    }
  }

  togglePhotoSelection(photo: Photo) {
    if (this.selectedPhotos.has(photo)) {
      this.selectedPhotos.delete(photo);
    } else {
      this.selectedPhotos.add(photo);
    }
  }

  isPhotoSelected(photo: Photo): boolean {
    return this.selectedPhotos.has(photo);
  }

  clearSelection() {
    this.selectedPhotos.clear();
  }

  // LÓGICA DE DESCARGA ZIP
  async downloadSelected() {
    if (this.selectedPhotos.size === 0 || this.isDownloading) return;

    this.isDownloading = true;

    try {
      const zip = new JSZip();
      const folder = zip.folder("Fotos_Boda");

      const downloadPromises = Array.from(this.selectedPhotos).map(async (photo, index) => {
        try {
          // Usamos un proxy o fetch directo si el CORS lo permite
          const response = await fetch(photo.url);
          const blob = await response.blob();

          // Extension detectada o por defecto jpg
          const extension = photo.name.split('.').pop() || 'jpg';
          const fileName = `${index + 1}_Recuerdo.${extension}`;

          folder?.file(fileName, blob);
        } catch (err) {
          console.error(`Error descargando foto: ${photo.url}`, err);
        }
      });

      await Promise.all(downloadPromises);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "Fotos_Boda_Seleccionadas.zip");

      // Opcional: Salir del modo selección tras descarga
      this.isSelectionMode = false;
      this.clearSelection();

    } catch (error) {
      console.error("Error al generar el ZIP:", error);
      alert("Hubo un error al generar el archivo. Por favor, intenta de nuevo.");
    } finally {
      this.isDownloading = false;
    }
  }
}
