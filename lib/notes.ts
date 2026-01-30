// Firestore utilities for Notes collection
// Handles CRUD operations for notes and passwords

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    onSnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

// Types based on PRD schema
export type NoteType = 'NOTE' | 'PASSWORD';
export type NoteCategory = 'Academic' | 'Work' | 'Personal';

export interface Note {
    id: string;
    userId: string;
    title: string;
    content: string;
    type: NoteType;
    category: NoteCategory;
    tags: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
    // Additional fields for passwords
    username?: string;
    url?: string;
}

export interface CreateNoteInput {
    userId: string;
    title: string;
    content: string;
    type: NoteType;
    category: NoteCategory;
    tags?: string[];
    username?: string;
    url?: string;
}

export interface UpdateNoteInput {
    title?: string;
    content?: string;
    category?: NoteCategory;
    tags?: string[];
    username?: string;
    url?: string;
}

const COLLECTION_NAME = 'notes';

// Create a new note
export async function createNote(input: CreateNoteInput): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...input,
        tags: input.tags || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return docRef.id;
}

// Update an existing note
export async function updateNote(id: string, input: UpdateNoteInput): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
        ...input,
        updatedAt: serverTimestamp(),
    });
}

// Delete a note
export async function deleteNote(id: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
}

// Get all notes for a user
export async function getNotes(userId: string, typeFilter?: NoteType): Promise<Note[]> {
    if (!db) throw new Error('Firestore not initialized');

    let q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
    );

    if (typeFilter) {
        q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            where('type', '==', typeFilter),
            orderBy('updatedAt', 'desc')
        );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Note[];
}

// Subscribe to notes in realtime
export function subscribeToNotes(
    userId: string,
    callback: (notes: Note[]) => void,
    typeFilter?: NoteType
): Unsubscribe {
    if (!db) {
        console.warn('Firestore not initialized');
        return () => { };
    }

    let q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
    );

    if (typeFilter) {
        q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            where('type', '==', typeFilter),
            orderBy('updatedAt', 'desc')
        );
    }

    return onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Note[];
        callback(notes);
    });
}
