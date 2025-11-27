

import type { User as FirebaseUser, IdTokenResult } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export type UserRole = 'platformAdmin' | 'tenantAdmin' | 'tenantMember';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  organizationId: string | null;
  organizationName: string | null;
  role: UserRole;
  isTenantAdmin: boolean;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: Timestamp;
  ownerId: string;
}

export interface OrgUser {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAdmin: boolean;
  createdAt?: Timestamp;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isPlatformAdmin: boolean;
  isTenantAdmin: boolean;
}
