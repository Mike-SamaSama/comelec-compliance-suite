
"use client";

import { createContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import type { AuthContextType, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const platformAdminRef = doc(db, 'platform_admins', uid);
    const platformAdminSnap = await getDoc(platformAdminRef);
    if (platformAdminSnap.exists()) {
        return {
            uid,
            email: platformAdminSnap.data()?.email || null,
            displayName: platformAdminSnap.data()?.displayName || 'Platform Admin',
            photoURL: platformAdminSnap.data()?.photoURL || null,
            organizationId: null,
            organizationName: 'Platform',
            role: 'platformAdmin',
            isAdmin: true,
        };
    }

    const userOrgMappingRef = doc(db, 'user_org_mappings', uid);
    const userOrgMappingSnap = await getDoc(userOrgMappingRef);
    const organizationId = userOrgMappingSnap.data()?.organizationId;

    if (!organizationId) {
        console.warn(`No organization mapping found for user ${uid}`);
        return null;
    }

    const [tenantUserSnap, orgSnap] = await Promise.all([
        getDoc(doc(db, 'organizations', organizationId, 'users', uid)),
        getDoc(doc(db, 'organizations', organizationId))
    ]);

    if (!tenantUserSnap.exists()) {
        console.warn(`User document not found in tenant ${organizationId} for user ${uid}`);
        return null;
    }

    const userData = tenantUserSnap.data();
    const isAdmin = userData.isAdmin || false;

    return {
        uid,
        email: userData.email || null,
        displayName: userData.displayName || 'Tenant User',
        photoURL: userData.photoURL || null,
        organizationId,
        organizationName: orgSnap.data()?.name || 'My Organization',
        role: isAdmin ? 'tenantAdmin' : 'tenantMember',
        isAdmin,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
     return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
     )
  }

  const value = {
    user,
    profile,
    loading,
    isPlatformAdmin: profile?.role === 'platformAdmin',
    isTenantAdmin: profile?.role === 'tenantAdmin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
