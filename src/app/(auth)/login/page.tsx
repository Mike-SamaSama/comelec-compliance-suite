'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// ✅ FIX 1: Import directly from Firebase to avoid "Module not found" errors
import { useUser } from '@/firebase'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, ShieldCheck, LogIn } from 'lucide-react';

export default function LoginPage() {
  // ✅ FIX 2: Use the direct firebase hook
  const { user, isLoading, signInGuest } = useUser(); 
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 1. Auto-Redirect
  useEffect(() => {
    if (!isLoading && user) {
      setIsRedirecting(true);
      // ✅ FIX 3: Force a hard reload to ensure Dashboard loads cleanly
      window.location.href = '/'; 
    }
  }, [user, isLoading, router]);

  const handleEnter = async () => {
    setIsRedirecting(true);
    if (!user) {
        // If not logged in, try to sign in as guest first
        if (signInGuest) {
            await signInGuest();
        }
    }
    // Force navigation to dashboard
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-blue-100 p-3">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to the COMELEC Compliance Suite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
             <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 text-center border border-green-200">
               <p className="font-medium">Authentication Successful</p>
               <p className="text-xs mt-1">Redirecting you to the dashboard...</p>
             </div>
          ) : (
            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700 text-center border border-blue-200">
              <p>Session Ready. Click below to enter.</p>
            </div>
          )}
          
          <Button 
            className="w-full h-11 text-base" 
            onClick={handleEnter} 
            disabled={isLoading || isRedirecting}
          >
            {isRedirecting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entering...</>
            ) : (
              <><LogIn className="mr-2 h-4 w-4" /> Enter Dashboard</>
            )}
          </Button>
        </CardContent>
        <CardFooter className="justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an organization?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}