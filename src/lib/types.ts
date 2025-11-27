import type { User as FirebaseUser } from 'firebase/auth';

export type UserRole = 'platformAdmin' | 'tenantAdmin' | 'tenantMember';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  organizationId: string | null;
  organizationName: string | null;
  role: UserRole;
  isAdmin: boolean;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isPlatformAdmin: boolean;
  isTenantAdmin: boolean;
}
