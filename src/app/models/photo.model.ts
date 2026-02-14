export interface Photo {
    id?: string;
    url: string;
    name: string;
    albumId: string;
    createdAt: any; // Firebase Timestamp or Date
}
