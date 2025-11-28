'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
// Import standard Firestore functions
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
// Import initialized instances
import { auth, db } from '@/firebase'; 

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    orgName: '',
    fullName: '',
    email: '',
    password: '',
    agreeTerms: false
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!formData.orgName || !formData.fullName || !formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }
    if (!formData.agreeTerms) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create Authentication User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Update Profile Display Name
      await updateProfile(user, { displayName: formData.fullName });

      // 3. Generate a secure ID for the Organization (Tenant)
      // Format: org_timestamp_random
      const orgId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      // 4. Create Organization Document
      // Path: /organizations/{orgId}
      await setDoc(doc(db, 'organizations', orgId), {
        name: formData.orgName,
        ownerId: user.uid,
        createdAt: serverTimestamp(), // Server-side timestamp
        status: 'active'
      });

      // 5. Create User Profile INSIDE the Organization
      // Path: /organizations/{orgId}/users/{userId}
      // This links the user to the tenant and sets them as Admin.
      await setDoc(doc(db, `organizations/${orgId}/users`, user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: formData.fullName,
        role: 'admin', // Tenant Admin Privilege
        joinedAt: serverTimestamp()
      });

      // 6. (Optional) Create a root-level mapping for easier lookup later
      // Path: /users/{userId}
      await setDoc(doc(db, 'users', user.uid), {
        currentOrgId: orgId,
        email: user.email
      });

      // 7. Redirect to Dashboard
      router.push('/');

    } catch (err: any) {
      console.error("Registration failed:", err);
      let msg = "Failed to create account. Please try again.";
      if (err.code === 'auth/email-already-in-use') msg = "This email is already registered.";
      if (err.code === 'auth/weak-password') msg = "Password is too weak.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-purple-100 p-3">
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Register Organization</CardTitle>
          <CardDescription>
            Create a new workspace for your Party-List group.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="org-name">Organization / Party Name</Label>
              <Input 
                id="org-name" 
                placeholder="e.g. Green Earth Party" 
                value={formData.orgName}
                onChange={(e) => setFormData({...formData, orgName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full-name">Your Full Name</Label>
              <Input 
                id="full-name" 
                placeholder="e.g. Juan Dela Cruz" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="terms" 
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => setFormData({...formData, agreeTerms: checked as boolean})}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <Button type="submit" className="w-full h-11 mt-2 bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Workspace...</> : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}