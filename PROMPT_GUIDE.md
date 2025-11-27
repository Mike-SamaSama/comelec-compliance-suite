
# Prompt Guide for Robust Next.js + Firebase Authentication

To avoid authentication loops, race conditions, and blank screen issues when building a Next.js App Router application with Firebase, use the following prompt structure and principles.

### The Prompt

"Set up a new Next.js 15 App Router application with Firebase Authentication (Email/Password).

The authentication flow must follow these critical architectural patterns to prevent redirect loops and race conditions:

1.  **Centralized Auth Provider (`<AuthProvider>`):**
    *   Create a single, client-side `AuthProvider` that wraps the root layout (`src/app/layout.tsx`).
    *   This provider will use Firebase's `onAuthStateChanged` to listen for authentication state.
    *   It must manage a `loading` state. This state should be `true` initially and set to `false` *only after* the first `onAuthStateChanged` callback has finished, confirming whether a user is logged in or not.
    *   While `loading` is `true`, the `AuthProvider` must render a full-page loading UI (e.g., a centered spinner or skeleton screen) to prevent any part of the app from rendering prematurely.

2.  **Server Actions for Authentication:**
    *   Use Next.js Server Actions for both sign-in and sign-up logic.
    *   Upon successful authentication in a server action, use the `redirect()` function from `next/navigation` to navigate the user to a protected route like `/dashboard`. **Do not rely on client-side navigation for this.**

3.  **Protected Layout (`/app/(app)/layout.tsx`):**
    *   This layout will protect all routes within the `(app)` group.
    *   It must use a hook like `useAuth` to access the `user` and `loading` state from the `AuthProvider`.
    *   **Crucially, this layout must NOT contain any `useEffect` hooks for redirection.** Its job is to render content, not to control navigation flow.
    *   Its logic should be simple: if `loading` is `false` and there is no `user`, it should redirect back to `/login`. This handles the case where a non-authenticated user tries to access a protected page directly.

### Why This Works

*   **Single Source of Truth:** The `AuthProvider` is the one and only place that manages authentication state.
*   **Eliminates Race Conditions:** By showing a global loading state, the app waits for Firebase to initialize on the client before trying to render any protected content. This prevents the "user is null for a split second" problem.
*   **Clear Separation of Concerns:**
    *   **Server Actions** handle the *act* of logging in and *initiating* the redirect.
    *   The **`AuthProvider`** handles the *state* of being logged in or out.
    *   The **Protected Layout** handles the *rendering* of protected content. It does not perform its own redirects based on transient state.
