
"use client";

import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot, FirestoreError } from 'firebase/firestore';

interface UseCollectionReturn<T> {
  data: (T & { id: string })[] | null;
  loading: boolean;
  error: FirestoreError | null;
}

export function useCollection<T extends DocumentData>(
  query: Query<T> | null
): UseCollectionReturn<T> {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      setData([]);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error("Error fetching collection:", err);
        setError(err);
        setLoading(false);
        setData(null);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [query]); // Re-run effect if query changes

  return { data, loading, error };
}
