/**
 * Firebase Client Initialization
 * Initializes Firebase Authentication and Cloud Firestore.
 * Gracefully detects whether Firebase environment variables are provided.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCOf5lRR3FkEhkc7O97ox3gu_5LWQ3KeeA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'netlab-cn.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'netlab-cn',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'netlab-cn.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '825657135527',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:825657135527:web:f15fb9971c0af7142d2682'
};

// Check if valid Firebase configuration is present
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
);

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log('[Firebase] Successfully initialized Firebase Auth & Firestore for project:', firebaseConfig.projectId);
  } catch (err) {
    console.warn('[Firebase] Initialization error, falling back to local simulation mode:', err.message);
  }
} else {
  console.log('[Firebase] Running in Local / Demo Mode (Set VITE_FIREBASE_* in .env to connect to your live Firebase project).');
}

export {
  app,
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
};
