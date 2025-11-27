
"use client";

import { useAuth } from "@/hooks/use-auth";
import AppShell from "@/components/layout/app-shell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    // The AuthProvider shows a global loading skeleton, so we can wait for the
    // user state to be resolved before rendering the application shell.
    // Returning null here prevents a flash of unauthenticated content and avoids
    // race conditions with redirects.
    return null;
  }

  // Once loading is complete and a user is present, render the AppShell.
  return <AppShell>{children}</AppShell>;
}
