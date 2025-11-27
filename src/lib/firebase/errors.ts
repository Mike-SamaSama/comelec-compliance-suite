
"use server";

// This is a server-only module.

export type SecurityRuleContext = {
  path: string;
  operation: "get" | "list" | "create" | "update" | "delete" | "write";
  requestResourceData?: any;
};

/**
 * A custom error class to provide detailed context about Firestore Security Rule failures.
 * This is intended for server-side use in development to surface rich errors to the client.
 */
export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;
  public cause?: any;

  constructor(context: SecurityRuleContext, cause?: any) {
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules: \n${JSON.stringify(context, null, 2)}`;
    super(message);
    this.name = "FirestorePermissionError";
    this.context = context;
    this.cause = cause;

    // This is necessary for V8 environments (like Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}
