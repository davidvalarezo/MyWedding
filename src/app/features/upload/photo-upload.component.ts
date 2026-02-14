import { Component, ElementRef, OnInit, ViewChild, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PhotoService } from '../../core/services/photo.service';
import { Album } from '../../models/album.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6 space-y-12">
      <!-- DISPARADOR PRINCIPAL (Icono de cámara habitual) -->
      <div 
        (click)="fileInput.click()"
        (dragover)="$event.preventDefault()"
        (drop)="onFileDropped($event)"
        class="bg-white border-2 border-dashed border-gold/30 rounded-[3rem] p-16 text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all duration-500 group shadow-xl shadow-gold/5 relative overflow-hidden"
      >
        <div class="absolute -top-12 -left-12 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-colors"></div>
        <div class="absolute -bottom-12 -right-12 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-colors"></div>

        <input 
          #fileInput 
          type="file" 
          (change)="onFileSelected($event)" 
          accept="image/*" 
          class="hidden"
          multiple
        >
        
        <div class="flex flex-col items-center gap-6 relative z-10">
          <div class="w-24 h-24 bg-cream rounded-full flex items-center justify-center text-gold group-hover:scale-110 transition-transform shadow-inner border border-gold/10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" class="w-12 h-12">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
          
          <div class="space-y-2">
            <p class="text-3xl font-romantic text-slate-700 italic">Capturar la Magia</p>
            <p class="text-slate-400 text-xs uppercase tracking-[0.3em] font-light">Toca aquí o arrastra tus fotos</p>
          </div>

          <button class="px-8 py-3 rounded-full bg-gold/10 text-gold-dark text-xs font-semibold uppercase tracking-widest hover:bg-gold hover:text-white transition-all duration-300">
            Elegir desde Galería
          </button>
        </div>
      </div>

      <!-- MODAL DE CONFIGURACIÓN (Diseño tipo Alerta Premium) -->
      <div *ngIf="showModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div (click)="closeModal()" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"></div>
        
        <div class="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-[120] overflow-visible animate-scale-in border-t-[12px] border-x border-b border-gold/20" style="border-top-color: #d4af37;">
          <!-- El borde superior ahora es parte del div principal para que siga la curva perfectamente -->
          
          <div class="p-10 space-y-8">
            <header class="text-center">
              <h3 class="text-2xl font-romantic text-gold-dark italic">Detalles del Recuerdo</h3>
              <p class="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Organiza tus fotos subidas</p>
            </header>

            <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Selector de Tipo -->
              <div class="flex justify-center">
                <div class="inline-flex p-1 bg-cream-dark rounded-xl border border-gold/10">
                  <button 
                    type="button"
                    (click)="setDestinationType('existing')"
                    [class.bg-white]="destinationType === 'existing'"
                    [class.shadow-sm]="destinationType === 'existing'"
                    [class.text-gold-dark]="destinationType === 'existing'"
                    [class.text-slate-500]="destinationType !== 'existing'"
                    class="px-6 py-2 rounded-lg text-xs font-semibold uppercase tracking-tighter transition-all duration-300"
                  >
                    Álbum Existente
                  </button>
                  <button 
                    type="button"
                    (click)="setDestinationType('new')"
                    [class.bg-white]="destinationType === 'new'"
                    [class.shadow-sm]="destinationType === 'new'"
                    [class.text-gold-dark]="destinationType === 'new'"
                    [class.text-slate-500]="destinationType !== 'new'"
                    class="px-6 py-2 rounded-lg text-xs font-semibold uppercase tracking-tighter transition-all duration-300"
                  >
                    Nuevo Álbum
                  </button>
                </div>
              </div>

              <!-- Contenido: Álbum Existente (DROPDOWN PERSONALIZADO) -->
              <div *ngIf="destinationType === 'existing'" class="space-y-3 animate-fade-in relative">
                <label class="block text-[10px] font-bold text-gold-dark uppercase tracking-widest ml-1">Seleccionar Álbum</label>
                
                <!-- CUSTOM DROPDOWN TRIGGER -->
                <div class="relative" id="customAlbumDropdown">
                  <button 
                    type="button"
                    (click)="toggleDropdown()"
                    class="w-full bg-cream-dark/50 border border-gold/20 rounded-2xl px-6 py-5 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-gold/30 focus:bg-white transition-all text-slate-700 text-sm font-medium shadow-sm hover:border-gold/40"
                  >
                    <span>{{ selectedAlbumName || '-- Elige un álbum --' }}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" viewBox="0 0 24 24" 
                      stroke-width="2.5" stroke="currentColor" 
                      class="w-4 h-4 text-gold transition-transform duration-300"
                      [class.rotate-180]="isDropdownOpen"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  <!-- DROPDOWN OPTIONS (The real fix for weird positioning) -->
                  <div 
                    *ngIf="isDropdownOpen" 
                    class="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gold/10 z-[200] max-h-60 overflow-y-auto animate-fade-in py-2"
                  >
                    <div 
                      *ngFor="let album of (albums$ | async)"
                      (click)="selectAlbumFromList(album)"
                      class="px-6 py-4 hover:bg-cream transition-colors cursor-pointer border-b border-cream-dark last:border-0"
                    >
                      <div class="font-medium text-slate-700">{{ album.name }}</div>
                      <div class="text-[10px] text-gold-dark uppercase tracking-widest mt-0.5">Autor: {{ album.author }}</div>
                    </div>
                  </div>
                </div>

                <p class="text-[9px] text-slate-400 italic ml-1">¿No encuentras el álbum? Crea uno en la pestaña "Nuevo Álbum".</p>
              </div>

              <!-- Contenido: Nuevo Álbum -->
              <div *ngIf="destinationType === 'new'" class="space-y-5 animate-fade-in">
                <div class="space-y-2">
                  <label class="block text-[10px] font-bold text-gold-dark uppercase tracking-widest ml-1">Nombre del Álbum</label>
                  <input 
                    type="text" 
                    formControlName="newAlbumName"
                    [class.border-red-300]="uploadForm.get('newAlbumName')?.invalid && uploadForm.get('newAlbumName')?.touched"
                    class="w-full bg-cream border border-gold/20 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all text-sm text-slate-700 font-medium"
                    placeholder="Ej: La Ceremonia"
                  >
                  <p *ngIf="uploadForm.get('newAlbumName')?.invalid && uploadForm.get('newAlbumName')?.touched" class="text-[9px] text-red-400 ml-1">Mínimo 2 caracteres</p>
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-bold text-gold-dark uppercase tracking-widest ml-1">Tu Nombre</label>
                  <input 
                    type="text" 
                    formControlName="authorName"
                    [class.border-red-300]="uploadForm.get('authorName')?.invalid && uploadForm.get('authorName')?.touched"
                    class="w-full bg-cream border border-gold/20 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all text-sm text-slate-700 font-medium"
                    placeholder="¿Quién eres?"
                  >
                </div>
              </div>

              <div class="pt-6 flex gap-4">
                <button 
                  type="button"
                  (click)="closeModal()"
                  class="flex-1 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  [disabled]="!isFormReady || uploading"
                  class="flex-[2] py-4 bg-gradient-to-r from-gold-dark to-gold text-white rounded-2xl font-bold text-sm shadow-lg shadow-gold/20 transition-all hover:shadow-gold/40 active:scale-[0.98] disabled:opacity-40 disabled:grayscale-[0.8] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span *ngIf="!uploading">Confirmar y Subir</span>
                  <span *ngIf="uploading" class="flex items-center gap-2">
                    <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subiendo...
                  </span>
                  <svg *ngIf="!uploading" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Sección de Explorar Álbumes (Carrusel Premium) -->
      <section class="space-y-8 animate-fade-in-up relative group/carousel">
        <div class="text-center">
          <h3 class="text-2xl font-romantic text-slate-700 italic">Explorar Álbumes</h3>
          <p class="text-slate-400 text-[10px] uppercase tracking-[0.3em] font-light mt-1">Navega por los mejores momentos</p>
        </div>

        <!-- Botones de Navegación del Carrusel -->
        <button 
          (click)="scrollCarousel('left')"
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-xl border border-gold/10 text-gold flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0 transition-all duration-300 hover:bg-gold hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button 
          (click)="scrollCarousel('right')"
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-xl border border-gold/10 text-gold flex items-center justify-center opacity-0 group-carousel:opacity-100 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0 transition-all duration-300 hover:bg-gold hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <!-- Contenedor del Carrusel -->
        <div 
          #carouselContainer
          class="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-8 px-4 scrollbar-hide scroll-smooth"
          style="mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);"
        >
          <div 
            *ngFor="let album of (albums$ | async)" 
            (click)="onAlbumClick(album.id!)"
            class="flex-none w-[260px] snap-center group cursor-pointer"
          >
            <!-- Tarjeta Polaroid -->
            <div class="bg-white p-4 shadow-xl rounded-sm transition-all duration-500 group-hover:-rotate-2 group-hover:-translate-y-2 group-hover:shadow-2xl border border-slate-50 relative overflow-hidden">
               <div class="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div class="aspect-square bg-cream rounded-sm flex items-center justify-center text-gold/30 mb-5 overflow-hidden relative">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="0.8" stroke="currentColor" class="w-20 h-20 group-hover:scale-110 transition-transform duration-700">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.841m1.866-1.866a14.988 14.988 0 0 1-2.58 5.841" />
                 </svg>
                 <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold via-transparent to-transparent"></div>
               </div>
               
               <div class="pb-1">
                 <h4 class="font-romantic text-xl text-slate-700 italic leading-tight truncate">{{ album.name }}</h4>
                 <div class="flex items-center gap-2 mt-2">
                    <span class="text-[9px] uppercase tracking-widest text-slate-400">Creado por</span>
                    <span class="text-xs font-semibold text-gold-dark truncate">{{ album.author }}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Overlay de Procesamiento -->
      <div *ngIf="uploading" class="fixed inset-0 z-[160] flex flex-col items-center justify-center bg-cream/95 backdrop-blur-md">
        <div class="relative w-24 h-24 mb-6">
          <div class="absolute inset-0 border-4 border-gold/20 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center text-gold">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-8 h-8 animate-pulse">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.557 0 3.046.727 4 2.015Q12.454 3 14.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.11-4.73 9.261a25.173 25.173 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
        </div>
        <p class="text-2xl font-romantic text-gold-dark mb-2 italic px-6 text-center">{{ currentMessage }}</p>
        <p class="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-light">Guardando un pedacito de nuestra historia</p>
      </div>
    </div>
  `,
  styles: [`
    .animate-scale-in {
      animation: scaleIn 0.3s ease-out;
    }
    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class PhotoUploadComponent implements OnInit {
  private fb = inject(FormBuilder);
  private photoService = inject(PhotoService);

  @ViewChild('carouselContainer') carouselContainer!: ElementRef;

  uploadForm!: FormGroup;
  destinationType: 'existing' | 'new' = 'existing';
  selectedFiles: File[] = [];
  uploading = false;
  showModal = false;
  currentMessage = 'Capturando la magia...';
  albums$!: Observable<Album[]>;

  // Custom Dropdown State
  isDropdownOpen = false;
  selectedAlbumName = '';

  private messages = [
    'Guardando un beso...',
    'Eternizando una sonrisa...',
    'Atesorando un momento...',
    'Pinceladas de amor...',
    'Casi listo, David y Maria...'
  ];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isDropdownOpen) {
      const dropdownElement = document.getElementById('customAlbumDropdown');
      if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
        this.isDropdownOpen = false;
      }
    }
  }

  ngOnInit() {
    this.initForm();
    this.albums$ = this.photoService.getAlbums();
  }

  scrollCarousel(direction: 'left' | 'right') {
    if (!this.carouselContainer) return;
    const container = this.carouselContainer.nativeElement;
    const scrollAmount = 300;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  private initForm() {
    this.uploadForm = this.fb.group({
      albumId: [''],
      newAlbumName: [''],
      authorName: ['']
    });

    this.updateValidators();
  }

  setDestinationType(type: 'existing' | 'new') {
    this.destinationType = type;
    this.updateValidators();
  }

  private updateValidators() {
    const albumIdControl = this.uploadForm.get('albumId');
    const newAlbumNameControl = this.uploadForm.get('newAlbumName');
    const authorNameControl = this.uploadForm.get('authorName');

    if (this.destinationType === 'existing') {
      albumIdControl?.setValidators([Validators.required]);
      newAlbumNameControl?.clearValidators();
      authorNameControl?.clearValidators();
    } else {
      albumIdControl?.clearValidators();
      newAlbumNameControl?.setValidators([Validators.required, Validators.minLength(2)]);
      authorNameControl?.setValidators([Validators.required]);
    }

    albumIdControl?.updateValueAndValidity();
    newAlbumNameControl?.updateValueAndValidity();
    authorNameControl?.updateValueAndValidity();
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.handleFiles(Array.from(files as FileList));
    }
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(Array.from(files as FileList));
    }
  }

  private handleFiles(files: File[]) {
    this.selectedFiles = files;
    this.showModal = true;
  }

  closeModal() {
    if (this.uploading) return;
    this.showModal = false;
    this.selectedFiles = [];
    this.selectedAlbumName = '';
    this.uploadForm.reset({ albumId: '', newAlbumName: '', authorName: '' });
  }

  // Dropdown Logic
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectAlbumFromList(album: Album) {
    this.uploadForm.patchValue({ albumId: album.id });
    this.selectedAlbumName = album.name;
    this.isDropdownOpen = false;
  }

  get isFormReady(): boolean {
    return this.uploadForm.valid && this.selectedFiles.length > 0;
  }

  async onSubmit() {
    if (!this.uploadForm.valid || this.selectedFiles.length === 0 || this.uploading) return;

    this.uploading = true;
    this.rotateMessages();

    try {
      let albumId = this.uploadForm.get('albumId')?.value;

      if (this.destinationType === 'new') {
        const newAlbum: Omit<Album, 'id'> = {
          name: this.uploadForm.get('newAlbumName')?.value,
          author: this.uploadForm.get('authorName')?.value,
          createdAt: new Date()
        };
        albumId = await this.photoService.createAlbum(newAlbum);
      }

      const uploadPromises = this.selectedFiles.map(file =>
        this.photoService.uploadPhoto(file, albumId)
      );

      await Promise.all(uploadPromises);

      this.showModal = false;
      this.selectedFiles = [];
      this.selectedAlbumName = '';
      this.uploadForm.reset({ albumId: '', newAlbumName: '', authorName: '' });
      this.destinationType = 'existing';
      this.updateValidators();

    } catch (error) {
      console.error('Error in upload process', error);
    } finally {
      this.uploading = false;
    }
  }

  onAlbumClick(albumId: string) {
    this.photoService.selectAlbum(albumId);
  }

  private rotateMessages() {
    let i = 0;
    const interval = setInterval(() => {
      if (!this.uploading) {
        clearInterval(interval);
        return;
      }
      this.currentMessage = this.messages[i % this.messages.length];
      i++;
    }, 2000);
  }
}
