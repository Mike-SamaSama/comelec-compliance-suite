
"use client";

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, DocumentData, QuerySnapshot, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

interface UseCollectionReturn<T> {
  data: (T & { id: string })[] | null;
  loading: boolean;
  error: FirestoreError | null;
}

/**
 * A stable, best-practice hook for fetching a Firestore collection in real-time.
 * It uses a path string to create a stable query, preventing re-renders and infinite loops.
 * @param path The path to the collection (e.g., 'users' or 'organizations/abc/documents'). Must not contain an odd number of segments.
 * @returns An object with the collection data, loading state, and error.
 */
export function useCollection<T extends DocumentData>(
  path: string | null
): UseCollectionReturn<T> {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    // If the path is null or undefined, we can't fetch anything.
    // Set loading to false and return early. This happens on initial render
    // before the user's profile (and organizationId) is loaded.
    if (!path) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    const collectionQuery = query(collection(db, path));

    const unsubscribe = onSnapshot(
      collectionQuery,
      (snapshot: QuerySnapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as T),
        }));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error(`Error fetching collection at path: ${path}`, err);
        setError(err);
        setLoading(false);
        setData(null);
      }
    );

    // Cleanup subscription on unmount or if the path changes.
    return () => unsubscribe();
  }, [path]); // The effect re-runs only when the path string itself changes.

  return { data, loading, error };
}
