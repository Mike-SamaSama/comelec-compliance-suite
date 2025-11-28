'use client';

import { useState, useEffect } from 'react';
import { useUser, db, doc, setDoc } from '@/firebase'; // Using direct exports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, Shield, Save, Loader2 } from 'lucide-react';
import { DeleteAccountCard } from '@/components/profile/delete-account-card';

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    partyName: '',
    role: 'Member'
  });

  // Load user data when auth is ready
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        partyName: 'Green Earth Party', // Example default, usually fetched from DB
        role: 'Member'
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      // Save to Firestore under /users/{uid}
      await setDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName,
        partyName: formData.partyName,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6">
        
        {/* Personal Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={user?.email || ''} disabled className="bg-gray-50" />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input 
                value={formData.displayName} 
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                placeholder="Enter your full name" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Organization Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Organization Details
            </CardTitle>
            <CardDescription>Your party-list affiliation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Party Name</Label>
                <Input 
                  value={formData.partyName} 
                  onChange={(e) => setFormData({...formData, partyName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm text-muted-foreground">
                  <Shield className="mr-2 h-4 w-4" />
                  {formData.role}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>

        {/* Delete Account Section */}
        <div className="pt-8 border-t">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
          <DeleteAccountCard />
        </div>

      </div>
    </div>
  );
}