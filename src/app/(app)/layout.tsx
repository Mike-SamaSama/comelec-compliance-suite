
"use client";

import { useAuth } from "@/hooks/use-auth";
import AppShell from "@/components/layout/app-shell";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);
  
  if (loading) {
    // The AuthProvider shows a global loading skeleton, so we can wait for the
    // user state to be resolved before rendering the application shell.
    return null;
  }

  // Once loading is complete, if there is a user, render the AppShell.
  if (!user) {
    // It's possible to be in this state briefly before a redirect.
    // Returning null prevents rendering the shell for an unauthenticated user.
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
