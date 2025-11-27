
"use client";

import { EventEmitter } from "events";
import type { FirestorePermissionError } from "@/lib/firebase/errors";

// This is a client-side module.

type AppEvents = {
  "permission-error": (error: FirestorePermissionError) => void;
};

// We can't type EventEmitter with generics, so we use a helper.
declare interface TypedEventEmitter {
  on<E extends keyof AppEvents>(event: E, listener: AppEvents[E]): this;
  emit<E extends keyof AppEvents>(
    event: E,
    ...args: Parameters<AppEvents[E]>
  ): boolean;
}

class TypedEventEmitter extends EventEmitter {}

export const errorEmitter = new TypedEventEmitter();
