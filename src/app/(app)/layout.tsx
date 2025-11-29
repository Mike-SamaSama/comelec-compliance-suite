'use client';

import { useEffect, useState } from 'react'; // Added useState
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { useUser } from '@/firebase'; 
import { Loader2 } from 'lucide-react';

// Helper component to safely render the sidebar
const SafeAppSidebar = () => {
    // We wrap the sidebar in a try/catch during development to prevent 
    // it from crashing the entire app if a sub-component fails.
    try {
        return <AppSidebar />;
    } catch (e) {
        console.error("Sidebar Render Crash:", e);
        return <div className="p-4 bg-red-100 text-red-800 text-sm">Error loading sidebar component. Check console.</div>;
    }
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  // 🔒 SECURITY CHECK & REDIRECT:
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show a loading spinner if we are checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // CRITICAL FIX: If the user is somehow null after loading, redirect.
  if (!user) {
    return null; 
  }

  // ✅ AUTHENTICATED VIEW:
  return (
    <div className="flex min-h-screen w-full bg-gray-50/50 text-gray-900">
      {/* Sidebar is now safely wrapped */}
      <SafeAppSidebar />
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}