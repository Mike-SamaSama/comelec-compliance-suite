import { useState, useEffect } from 'react';

export function useSubmissionStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [checklistItems, setChecklistItems] = useState([
    { id: '1', label: 'Initial Assessment', status: 'completed' },
    { id: '2', label: 'Document Collection', status: 'in-progress' },
    { id: '3', label: 'Drafting', status: 'pending' },
    { id: '4', label: 'Review', status: 'pending' },
    { id: '5', label: 'Submission', status: 'pending' },
  ]);

  useEffect(() => {
    // Simulate fetching data (replace with real Firestore query later)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return { checklistItems, isLoading };
}