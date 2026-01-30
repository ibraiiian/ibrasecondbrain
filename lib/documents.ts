// Firestore utilities for Documents collection
// Document Manager - stores document metadata and references

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    onSnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { deleteDocumentFile } from './storage';

// Document categories
export const DOCUMENT_CATEGORIES = ['Kuliah', 'Pekerjaan', 'Pribadi', 'Lainnya'] as const;
export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number];

// Document interface based on PRD schema
export interface Document {
    id: string;
    userId: string;
    name: string;
    description: string;
    category: DocumentCategory;
    fileUrl: string;
    storagePath: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CreateDocumentInput {
    userId: string;
    name: string;
    description?: string;
    category: DocumentCategory;
    fileUrl: string;
    storagePath: string;
    fileName: string;
    fileSize: number;
    fileType: string;
}

export interface UpdateDocumentInput {
    name?: string;
    description?: string;
    category?: DocumentCategory;
}

const COLLECTION_NAME = 'documents';

// Create a new document
export async function createDocument(input: CreateDocumentInput): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...input,
        description: input.description || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return docRef.id;
}

// Update document metadata
export async function updateDocument(id: string, updates: UpdateDocumentInput): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

// Delete document (Firestore doc + Storage file)
export async function deleteDocument(id: string, storagePath: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    // Delete from Storage first
    try {
        await deleteDocumentFile(storagePath);
    } catch (err) {
        console.error('Failed to delete storage file:', err);
    }

    // Delete Firestore document
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
}

// Subscribe to documents in realtime
export function subscribeToDocuments(
    userId: string,
    callback: (documents: Document[]) => void
): Unsubscribe {
    if (!db) {
        console.warn('Firestore not initialized');
        return () => { };
    }

    const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Document[];
        callback(documents);
    });
}

// Subscribe to documents filtered by category
export function subscribeToDocumentsByCategory(
    userId: string,
    category: DocumentCategory,
    callback: (documents: Document[]) => void
): Unsubscribe {
    if (!db) {
        console.warn('Firestore not initialized');
        return () => { };
    }

    const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Document[];
        callback(documents);
    });
}

// Helper to get file icon type based on file extension
export function getFileIconType(fileType: string): 'pdf' | 'word' | 'powerpoint' | 'excel' | 'text' | 'other' {
    const type = fileType.toLowerCase();

    if (type.includes('pdf')) return 'pdf';
    if (type.includes('word') || type.includes('doc')) return 'word';
    if (type.includes('powerpoint') || type.includes('ppt') || type.includes('presentation')) return 'powerpoint';
    if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return 'excel';
    if (type.includes('text') || type.includes('txt')) return 'text';

    return 'other';
}

// Helper to format file size
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
