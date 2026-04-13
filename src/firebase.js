import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Replace with your own Firebase project config (provided in README)
const firebaseConfig = {
  apiKey: 'AIzaSyAnyKqvQ2XLLQS0yo2_U3wmEqatp8X4Wnc',
  authDomain: 'tamil-new-72497.firebaseapp.com',
  projectId: 'tamil-new-72497',
  storageBucket: 'tamil-new-72497.firebasestorage.app',
  messagingSenderId: '624539221653',
  appId: '1:624539221653:web:d7104933123bcf40d9259c',
  measurementId: 'G-WDKBKHM4XF'
};

// Avoid re‑initialization during Vite HMR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {}); // ignore if already set

// Reuse Firestore instance if it already exists (prevents "already called" error)
const existingDb = globalThis._firestoreDb;
const db =
  existingDb ||
  initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    experimentalForceLongPolling: true
  });
globalThis._firestoreDb = db;
const functions = getFunctions(app);

export { app, auth, db, functions };
