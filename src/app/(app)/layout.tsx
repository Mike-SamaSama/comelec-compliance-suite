
"use client";

import { useAuth } from "@/hooks/use-auth";
import AppShell from "@/components/layout/app-shell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // This effect is the primary guard for all authenticated routes.
  // It waits until the auth state is fully resolved (loading is false).
  // If, after loading, there is still no user, it redirects to the login page.
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // The AuthProvider shows a global loading skeleton.
  // While loading is true, we render nothing here to avoid flashing content
  // and to let the AuthProvider's loading UI be the single source of truth.
  if (loading) {
    return null;
  }

  // If loading is complete but there is no user, it means the useEffect above
  // will be triggered to redirect. Returning null here prevents the app shell
  // from briefly flashing on the screen for unauthenticated users.
  if (!user) {
    return null;
  }

  // If loading is complete and a user exists, render the protected app shell.
  return <AppShell>{children}</AppShell>;
}
