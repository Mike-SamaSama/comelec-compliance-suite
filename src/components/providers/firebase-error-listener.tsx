
"use client";

import { useEffect } from "react";
import { errorEmitter } from "@/lib/firebase/error-emitter";
import type { FirestorePermissionError } from "@/lib/firebase/errors";

/**
 * A client-side component that listens for Firestore permission errors
 * and throws them to be caught by the Next.js development error overlay.
 * This component does nothing in production.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const handleError = (error: FirestorePermissionError) => {
      // Throw the error so Next.js can catch it and display the overlay.
      // This provides a rich, interactive debugging experience.
      throw error;
    };

    errorEmitter.on("permission-error", handleError);

    return () => {
      errorEmitter.removeListener("permission-error", handleError);
    };
  }, []);

  // This component renders nothing in the DOM.
  return null;
}
