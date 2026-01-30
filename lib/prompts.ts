// Firestore utilities for Prompts collection
// AI Prompt Library - stores prompt recipes

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

// Types based on PRD schema
export type PromptTag = 'Coding' | 'Image Gen' | 'Writing' | 'Chat' | 'Other';
export type AIModel = 'Gemini' | 'GPT-4' | 'Midjourney' | 'Claude' | 'DALL-E' | 'Other';

export interface Prompt {
    id: string;
    userId: string;
    title: string;
    promptBody: string;
    aiModel: AIModel;
    parameters: string;
    tags: PromptTag[];
    createdAt: Timestamp;
}

export interface CreatePromptInput {
    userId: string;
    title: string;
    promptBody: string;
    aiModel: AIModel;
    parameters?: string;
    tags?: PromptTag[];
}

export interface UpdatePromptInput {
    title?: string;
    promptBody?: string;
    aiModel?: AIModel;
    parameters?: string;
    tags?: PromptTag[];
}

const COLLECTION_NAME = 'prompts';

// Create a new prompt
export async function createPrompt(input: CreatePromptInput): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...input,
        parameters: input.parameters || '',
        tags: input.tags || [],
        createdAt: serverTimestamp(),
    });

    return docRef.id;
}

// Update an existing prompt
export async function updatePrompt(id: string, input: UpdatePromptInput): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
        ...input,
    });
}

// Delete a prompt
export async function deletePrompt(id: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
}

// Subscribe to prompts in realtime
export function subscribeToPrompts(
    userId: string,
    callback: (prompts: Prompt[]) => void
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
        const prompts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Prompt[];
        callback(prompts);
    });
}
