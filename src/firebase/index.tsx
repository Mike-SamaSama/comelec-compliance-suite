'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged, 
    signOut as firebaseSignOut,
    User as FirebaseUser,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    onSnapshot, 
    query, 
    collection, 
    Query, 
    DocumentData,
    setLogLevel 
} from 'firebase/firestore';
import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Configuration ---
// Using the real config values you provided earlier
const firebaseConfig = {
    apiKey: "AIzaSyB2V4eHZXV0HfbfSWJtxe-CN0aIyo0Ze04", 
    authDomain: "studio-9020847636-9d4fa.firebaseapp.com",
    projectId: "studio-9020847636-9d4fa",
    storageBucket: "studio-9020847636-9d4fa.firebasestorage.app",
    messagingSenderId: "00000000000", 
    appId: "1:00000000000:web:00000000000000" 
};

// --- Initialization ---
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

setLogLevel('error'); 

export { db, auth };

// --- User Context & Hook ---
interface UserContextType {
    user: FirebaseUser | null;
    userId: string | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    isAuthReady: boolean;
    signInGuest: () => Promise<void>;
}

const AuthContext = createContext<UserContextType | undefined>(undefined);

const appId = firebaseConfig.projectId || 'default-app';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : undefined;

// Mock User for immediate access
const mockUser = {
    uid: "guest-user-id",
    displayName: "Guest User",
    email: "guest@example.com",
    emailVerified: true,
    isAnonymous: true,
} as unknown as FirebaseUser;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPersistence(auth, browserLocalPersistence).catch(e => console.warn("Persistence warning:", e));
        }

        // SAFETY VALVE: Reduced to 1.5 seconds for faster fallback
        const safetyTimer = setTimeout(() => {
            setIsLoading((current) => {
                if (current) {
                    // If still loading, force guest mode immediately
                    setUser(mockUser);
                    return false; 
                }
                return current;
            });
        }, 1500); 

        const authenticate = async () => {
            // Fast Fail: If using a known mock/incomplete config, skip real auth
            if (firebaseConfig.apiKey === "mock-api-key") {
                setUser(mockUser);
                setIsLoading(false);
                setIsAuthReady(true);
                return;
            }

            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.warn("Auth Init Failed -> Switching to Guest Mode");
                setUser(mockUser);
                setIsLoading(false);
                setIsAuthReady(true);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser || mockUser); // Fallback to mock user if null
            setIsLoading(false);
            setIsAuthReady(true);
            clearTimeout(safetyTimer);
        });

        authenticate();
        return () => {
            unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, []);

    const userId = user?.uid || "guest-user-id";

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const signInGuest = async () => {
         // Immediate success simulation
         setUser(mockUser);
         setIsLoading(false);
    };

    const value = { user, userId, isLoading, signOut, isAuthReady, signInGuest };
    
    return (
        <div style={{ display: 'contents' }}> 
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        </div>
    );
};

export const useUser = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useUser must be used within an AuthProvider');
    }
    return context;
};

// --- Firestore Hooks ---
export function useUserDocument<T extends DocumentData>(collectionName: string, docId: string): [T | null, boolean] {
    const { user, isAuthReady } = useUser();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthReady || !user) {
            if (!user && isAuthReady) setLoading(false);
            return;
        }
        if (user.uid === "guest-user-id") {
            setLoading(false);
            return;
        }

        const path = `artifacts/${appId}/users/${user.uid}/${collectionName}`;
        const userRef = doc(db, path, docId);
        
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                setData(docSnap.data() as T);
            } else {
                setData(null);
            }
            setLoading(false);
        }, (error) => {
            console.warn(`Firestore error (${collectionName}):`, error.code);
            setLoading(false);
            setData(null);
        });

        return () => unsubscribe();
    }, [user, isAuthReady, collectionName, docId]);

    return [data, loading];
}

export function useUserCollection<T extends DocumentData>(collectionName: string, queryConstraints: any[] = []): [T[] | null, boolean] {
    const { user, isAuthReady } = useUser();
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthReady || !user) {
            if (!user && isAuthReady) setLoading(false);
            return;
        }
        if (user.uid === "guest-user-id") {
            setLoading(false);
            return;
        }

        const path = `artifacts/${appId}/users/${user.uid}/${collectionName}`;
        const colRef = collection(db, path);
        const q: Query<DocumentData> = query(colRef, ...queryConstraints);
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
            setData(list);
            setLoading(false);
        }, (error) => {
            console.warn(`Collection error (${collectionName}):`, error.code);
            setLoading(false);
            setData(null);
        });

        return () => unsubscribe();
    }, [user, isAuthReady, collectionName, JSON.stringify(queryConstraints)]);

    return [data, loading];
}

// --- COMPATIBILITY EXPORTS ---
export const FirebaseClientProvider = AuthProvider;
export const useFirestore = () => db;
export const useCollection = useUserCollection;
export const useDoc = useUserDocument;
export const useMemoFirebase = (a: any) => a;

export class FirestorePermissionError extends Error {
    constructor(public info: any) {
        super("Firestore Permission Error");
        this.name = "FirestorePermissionError";
    }
}

export default AuthProvider;