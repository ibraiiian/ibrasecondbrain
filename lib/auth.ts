// Authentication utilities for Ibra's Second Brain
// Handles Google Sign-In and user document creation

import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export async function signInWithGoogle(): Promise<User | null> {
    if (!auth || !db) {
        throw new Error('Firebase not initialized. Please check your environment variables.');
    }

    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user document exists, create if not
        await createUserDocument(user);

        return user;
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        throw error;
    }
}

// Create user document in Firestore (if not exists)
export async function createUserDocument(user: User): Promise<void> {
    if (!db) {
        throw new Error('Firestore not initialized');
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Create new user document following PRD schema
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
        });
        console.log('New user document created:', user.uid);
    }
}

// Sign out
export async function signOut(): Promise<void> {
    if (!auth) {
        throw new Error('Firebase Auth not initialized');
    }

    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Sign Out Error:', error);
        throw error;
    }
}

// Auth state observer
export function onAuthChange(callback: (user: User | null) => void): () => void {
    if (!auth) {
        // Return a no-op unsubscribe if auth is not initialized
        console.warn('Firebase Auth not initialized');
        return () => { };
    }
    return onAuthStateChanged(auth, callback);
}
