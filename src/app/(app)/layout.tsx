
"use client";

import { useAuth } from "@/hooks/use-auth";
import AppShell from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    // The AuthProvider shows a global loading skeleton, so we can wait for the
    // user state to be resolved before rendering the application shell.
    // Returning null here prevents a flash of unauthenticated content and avoids
    // race conditions with redirects.
    return null;
  }

  // Once loading is complete, if there is a user, render the AppShell.
  // If there's no user, the AuthProvider's effect will have already
  // triggered a redirect if necessary, or public pages would be handled differently.
  // For this protected layout, we only render if there is a user.
  if (!user) {
    // It's possible to be in this state briefly before a redirect.
    // Returning null prevents rendering the shell for an unauthenticated user.
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
