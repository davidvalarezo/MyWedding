import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../../core/services/photo.service';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <div 
        (click)="fileInput.click()"
        (dragover)="$event.preventDefault()"
        (drop)="onFileDropped($event)"
        class="border-2 border-dashed border-gold/40 rounded-3xl p-10 text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all duration-300 group"
      >
        <input 
          #fileInput 
          type="file" 
          (change)="onFileSelected($event)" 
          accept="image/*" 
          class="hidden"
          multiple
        >
        
        <div class="flex flex-col items-center gap-4">
          <div class="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
          
          <div>
            <p class="text-xl font-romantic text-slate-700">Subir Recuerdos</p>
            <p class="text-sm text-slate-400 mt-1">Arrastra tus fotos aquí o haz clic para seleccionarlas</p>
          </div>
          
          <button class="btn-gold mt-2">
            Seleccionar Fotos
          </button>
        </div>
      </div>
      
      <div *ngIf="uploading" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream/95 backdrop-blur-md animate-fade-in">
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
  styles: []
})
export class PhotoUploadComponent {
  uploading = false;
  currentMessage = 'Capturando la magia...';
  private messages = [
    'Guardando un beso...',
    'Eternizando una sonrisa...',
    'Atesorando un momento...',
    'Pinceladas de amor...',
    'Casi listo, David y Maria...'
  ];

  constructor(private photoService: PhotoService) { }

  onFileSelected(event: any) {
    const files = event.target.files;
    this.handleFiles(files);
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  private async handleFiles(files: FileList) {
    this.uploading = true;
    this.rotateMessages();
    const uploadPromises = Array.from(files).map(file => this.photoService.uploadPhoto(file));

    try {
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading photos', error);
    } finally {
      this.uploading = false;
    }
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
