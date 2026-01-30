// Firebase Storage utilities
// Handles file uploads for Visual Asset Organizer

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
    url: string;
    storagePath: string;
}

// Upload file to Firebase Storage
export async function uploadAsset(
    userId: string,
    file: File
): Promise<UploadResult> {
    if (!storage) throw new Error('Firebase Storage not initialized');

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `users/${userId}/assets/${timestamp}_${safeName}`;

    const storageRef = ref(storage, storagePath);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get download URL
    const url = await getDownloadURL(storageRef);

    return { url, storagePath };
}

// Delete file from Firebase Storage
export async function deleteAssetFile(storagePath: string): Promise<void> {
    if (!storage) throw new Error('Firebase Storage not initialized');

    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
}

// Upload document to Firebase Storage (PDF, DOCX, PPTX, etc.)
export async function uploadDocument(
    userId: string,
    file: File
): Promise<UploadResult> {
    if (!storage) throw new Error('Firebase Storage not initialized');

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `users/${userId}/documents/${timestamp}_${safeName}`;

    const storageRef = ref(storage, storagePath);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get download URL
    const url = await getDownloadURL(storageRef);

    return { url, storagePath };
}

// Delete document file from Firebase Storage
export async function deleteDocumentFile(storagePath: string): Promise<void> {
    if (!storage) throw new Error('Firebase Storage not initialized');

    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
}
