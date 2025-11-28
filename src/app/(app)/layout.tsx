'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
// ✅ FIX: Import from the central firebase file (same as Dashboard)
// This ensures the Layout sees the "Guest User" and doesn't hide the screen.
import { useUser } from '@/firebase'; 
import { Loader2 } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // ✅ FIX: Use the robust useUser hook
  const { user, isLoading } = useUser();
  const router = useRouter();

  // 🔒 SECURITY CHECK:
  // If the user is not logged in, kick them out to the Login page.
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show a loading spinner while we check if they are allowed in
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

  // If not logged in, don't render anything (the useEffect above will redirect)
  if (!user) return null;

  // ✅ AUTHENTICATED VIEW:
  return (
    <div className="flex min-h-screen w-full bg-gray-50/50 text-gray-900">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}