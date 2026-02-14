import { Injectable, inject } from '@angular/core';
import {
    Firestore,
    collection,
    collectionData,
    addDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from '@angular/fire/firestore';
import {
    Storage,
    ref,
    uploadBytes,
    getDownloadURL
} from '@angular/fire/storage';
import { Observable, BehaviorSubject } from 'rxjs';
import { Photo } from '../../models/photo.model';
import { Album } from '../../models/album.model';

@Injectable({
    providedIn: 'root'
})
export class PhotoService {
    private firestore = inject(Firestore);
    private storage = inject(Storage);
    private photosCollection = collection(this.firestore, 'photos');
    private albumsCollection = collection(this.firestore, 'albums');

    private selectedAlbumIdSubject = new BehaviorSubject<string | null>(null);
    selectedAlbumId$ = this.selectedAlbumIdSubject.asObservable();

    /**
     * Obtiene las fotos en tiempo real desde Firestore, ordenadas por fecha.
     */
    getPhotos(albumId?: string): Observable<Photo[]> {
        const q = albumId
            ? query(this.photosCollection, where('albumId', '==', albumId), orderBy('createdAt', 'desc'))
            : query(this.photosCollection, orderBy('createdAt', 'desc'));
        return collectionData(q, { idField: 'id' }) as Observable<Photo[]>;
    }

    /**
     * Obtiene la lista de álbumes en tiempo real.
     */
    getAlbums(): Observable<Album[]> {
        const q = query(this.albumsCollection, orderBy('createdAt', 'desc'));
        return collectionData(q, { idField: 'id' }) as Observable<Album[]>;
    }

    /**
     * Crea un nuevo álbum y retorna su ID.
     */
    async createAlbum(album: Omit<Album, 'id'>): Promise<string> {
        const docRef = await addDoc(this.albumsCollection, {
            ...album,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    }

    /**
     * Sube una foto a Firebase Storage y guarda su URL y metadatos en Firestore.
     */
    async uploadPhoto(file: File, albumId: string): Promise<void> {
        const filePath = `wedding_photos/${Date.now()}_${file.name}`;
        const fileRef = ref(this.storage, filePath);

        // 1. Subir a Firebase Storage
        const uploadResult = await uploadBytes(fileRef, file);

        // 2. Obtener la URL pública
        const url = await getDownloadURL(uploadResult.ref);

        // 3. Guardar metadatos en Firestore para sincronización en tiempo real
        const newPhoto = {
            url: url,
            name: file.name,
            albumId: albumId,
            createdAt: serverTimestamp()
        };

        await addDoc(this.photosCollection, newPhoto);
    }
    selectAlbum(albumId: string | null) {
        this.selectedAlbumIdSubject.next(albumId);
    }
}
