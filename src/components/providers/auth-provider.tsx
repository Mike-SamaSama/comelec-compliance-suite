
"use client";

import { createContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import type { AuthContextType, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function getUserProfile(uid: string): Promise<UserProfile | null> {
    // First, check if the user is a Platform Admin, as this is a global role.
    const platformAdminRef = doc(db, 'platform_admins', uid);
    const platformAdminSnap = await getDoc(platformAdminRef);
    if (platformAdminSnap.exists()) {
        const adminData = platformAdminSnap.data();
        return {
            uid,
            email: adminData?.email || null,
            displayName: adminData?.displayName || 'Platform Admin',
            photoURL: adminData?.photoURL || null,
            organizationId: null,
            organizationName: 'Platform',
            role: 'platformAdmin',
            isAdmin: true, // Platform admins are implicitly admins
        };
    }

    // If not a platform admin, look for their organization mapping.
    const userOrgMappingRef = doc(db, 'user_org_mappings', uid);
    const userOrgMappingSnap = await getDoc(userOrgMappingRef);
    const organizationId = userOrgMappingSnap.data()?.organizationId;

    if (!organizationId) {
        console.warn(`No organization mapping found for user ${uid}`);
        return null; // This user doesn't belong to any organization.
    }

    // Now fetch the user's profile within their specific organization and the organization's details.
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
  const [loading, setLoading] = useState(true); // Start with loading true

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          const userProfile = await getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setProfile(userProfile);
          } else {
            // If profile doesn't exist, the user is in an invalid state.
            // Sign them out to prevent being stuck.
            await auth.signOut();
            setProfile(null);
            setUser(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
          console.error("Error during auth state change:", error);
          // Sign out on any error during the process
          await auth.signOut();
          setProfile(null);
          setUser(null);
      } finally {
        // Set loading to false after the entire auth state check is complete.
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Render a full-page loading skeleton while the initial auth state is being determined.
  // This is crucial to prevent race conditions.
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
