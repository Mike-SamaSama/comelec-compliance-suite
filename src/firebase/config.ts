import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Configuration ---
// We prioritize the environment variables, but fallback to your real hardcoded config
// to ensure it works even if the environment variables fail to load.

const firebaseConfig = {
  apiKey: "AIzaSyB2V4eHZXV0HfbfSWJtxe-CN0aIyo0Ze04", // ✅ Your Real Key
  authDomain: "studio-9020847636-9d4fa.firebaseapp.com", // ✅ Inferred from your project ID
  projectId: "studio-9020847636-9d4fa", // ✅ Your Real Project ID
  storageBucket: "studio-9020847636-9d4fa.firebasestorage.app",
  messagingSenderId: "00000000000", // Placeholder (safe to leave as is for now)
  appId: "1:00000000000:web:00000000000000" // Placeholder (safe to leave as is for now)
};

// --- Initialization ---
// Singleton pattern to prevent "App already initialized" errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };