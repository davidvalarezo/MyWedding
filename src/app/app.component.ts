import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header.component';
import { PhotoUploadComponent } from './features/upload/photo-upload.component';
import { PhotoGalleryComponent } from './features/gallery/photo-gallery.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    PhotoUploadComponent,
    PhotoGalleryComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'My Wedding Album';
}
