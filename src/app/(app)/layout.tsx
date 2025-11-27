
"use client";

import { useAuth } from "@/hooks/use-auth";
import AppShell from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  // The AuthProvider shows a global loading skeleton, so we can wait for the
  // user state to be resolved before rendering the application shell.
  // Returning null here prevents a flash of unauthenticated content and avoids
  // race conditions with redirects.
  if (loading || !user) {
    return null;
  }

  // Once loading is complete and a user is present, render the AppShell.
  return <AppShell>{children}</AppShell>;
}
