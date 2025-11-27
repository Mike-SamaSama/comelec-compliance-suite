
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppShell from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This check runs only after the initial loading is complete.
    if (!loading && !user) {
      // If loading is finished and there's no user, then redirect.
      router.replace("/login");
    }
  }, [user, loading, router]);
  
  // While loading, or if the user is null but we are still in the process of
  // authenticating, we can show a skeleton or nothing.
  // The AuthProvider already shows a global skeleton, so returning null is fine.
  if (loading || !user) {
    return null;
  }

  // If the user is authenticated, but the profile hasn't loaded yet,
  // we can also opt to show a loading state. For now, we'll let the AppShell
  // render with potentially partial data, which it should handle gracefully.
  return <AppShell>{children}</AppShell>;
}
