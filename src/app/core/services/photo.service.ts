import { Injectable, inject } from '@angular/core';
import {
    Firestore,
    collection,
    collectionData,
    addDoc,
    query,
    orderBy,
    serverTimestamp
} from '@angular/fire/firestore';
import {
    Storage,
    ref,
    uploadBytes,
    getDownloadURL
} from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { Photo } from '../../models/photo.model';

@Injectable({
    providedIn: 'root'
})
export class PhotoService {
    private firestore = inject(Firestore);
    private storage = inject(Storage);
    private photosCollection = collection(this.firestore, 'photos');

    /**
     * Obtiene las fotos en tiempo real desde Firestore, ordenadas por fecha.
     */
    getPhotos(): Observable<Photo[]> {
        const q = query(this.photosCollection, orderBy('createdAt', 'desc'));
        return collectionData(q, { idField: 'id' }) as Observable<Photo[]>;
    }

    /**
     * Sube una foto a Firebase Storage y guarda su URL y metadatos en Firestore.
     */
    async uploadPhoto(file: File): Promise<void> {
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
            createdAt: serverTimestamp()
        };

        await addDoc(this.photosCollection, newPhoto);
    }
}
