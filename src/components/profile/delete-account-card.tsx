'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useUser, 
  auth, 
  db    
} from '@/firebase';
import { deleteUser } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';

// Simple toast mock if you don't have a toast provider yet
const useToast = () => ({
  toast: (props: any) => console.log("Toast:", props)
});

export function DeleteAccountCard() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmDelete = window.confirm(
      "Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove your data from our servers."
    );

    if (!confirmDelete) return;

    setIsLoading(true);

    try {
      // 1. Delete the Authentication Account
      await deleteUser(user);

      toast({
        title: "Account deleted",
        description: "Your account has been successfully removed.",
        variant: "destructive",
      });

      // 2. Redirect to Login
      router.push('/login');

    } catch (error: any) {
      console.error("Delete Account Error:", error);
      
      if (error.code === 'auth/requires-recent-login') {
        alert("Security: Please log out and log back in to delete your account.");
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> Danger Zone
        </CardTitle>
        <CardDescription className="text-red-700">
          Permanently delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-red-600/80">
        Once you delete your account, there is no going back. Please be certain.
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive" 
          onClick={handleDeleteAccount} 
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Delete Account
        </Button>
      </CardFooter>
    </Card>
  );
}