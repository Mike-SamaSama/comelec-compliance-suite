
"use client";

import { useAuth } from "@/hooks/use-auth";
import AppShell from "@/components/layout/app-shell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This is now safe. It only runs after the initial auth check is complete.
    // If loading is done and there's no user, it's a definitive unauthenticated state.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // While the initial auth state is loading, AuthProvider shows a global skeleton.
  // We return null here to prevent any flash of unauthenticated content.
  if (loading) {
    return null;
  }

  // If auth is resolved but the user is null, the effect will trigger the redirect.
  // We return null to prevent rendering children until the redirect happens.
  if (!user || !profile) {
    return null;
  }
  
  // If we reach here, user is authenticated and profile is available.
  return <AppShell>{children}</AppShell>;
}
