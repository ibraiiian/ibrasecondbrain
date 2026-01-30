// Firestore utilities for Assets collection
// Visual Asset Organizer - stores image references

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
import { deleteAssetFile } from './storage';

// Types based on PRD schema
export interface Asset {
    id: string;
    userId: string;
    imageUrl: string;
    storagePath: string;
    description: string;
    createdAt: Timestamp;
}

export interface CreateAssetInput {
    userId: string;
    imageUrl: string;
    storagePath: string;
    description?: string;
}

const COLLECTION_NAME = 'assets';

// Create a new asset document
export async function createAsset(input: CreateAssetInput): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...input,
        description: input.description || '',
        createdAt: serverTimestamp(),
    });

    return docRef.id;
}

// Update asset description
export async function updateAsset(id: string, description: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { description });
}

// Delete asset (Firestore doc + Storage file)
export async function deleteAsset(id: string, storagePath: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    // Delete from Storage first
    try {
        await deleteAssetFile(storagePath);
    } catch (err) {
        console.error('Failed to delete storage file:', err);
    }

    // Delete Firestore document
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
}

// Subscribe to assets in realtime
export function subscribeToAssets(
    userId: string,
    callback: (assets: Asset[]) => void
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
        const assets = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Asset[];
        callback(assets);
    });
}
