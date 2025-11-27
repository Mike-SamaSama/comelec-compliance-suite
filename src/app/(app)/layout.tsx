
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
    // This effect now only handles redirecting away from login if a user is already logged in,
    // which is not its primary responsibility but can be a safeguard.
    // The main protection for routes is handled by the logic below.
    if (!loading && !user && pathname !== '/login') {
       router.push('/login');
    }
  }, [user, loading, router, pathname]);
  
  // The AuthProvider shows a global loading skeleton. 
  // We wait for loading to be false before rendering anything.
  if (loading) {
    return null;
  }

  // If loading is complete but there is no user, it means they need to log in.
  // The useEffect above will handle the redirect. Returning null here prevents
  // the app shell from flashing for unauthenticated users.
  if (!user) {
    return null;
  }

  // If loading is complete and we have a user, render the application shell.
  return <AppShell>{children}</AppShell>;
}
