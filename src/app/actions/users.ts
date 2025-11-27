
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getAdminApp, getIsTenantAdmin } from '@/lib/firebase/server';

// --- Helper to verify admin privileges ---
async function verifyTenantAdmin(organizationId: string): Promise<string> {
  const { auth: adminAuth } = getAdminApp();
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    throw new Error('Authentication required.');
  }
  const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  const callingUserId = decodedToken.uid;

  const isCallerAdmin = await getIsTenantAdmin(callingUserId, organizationId);
  if (!isCallerAdmin) {
    throw new Error('Access Denied: You do not have permission to perform this action.');
  }
  return callingUserId;
}

// --- Update User Role Action ---

const UpdateRoleSchema = z.object({
  organizationId: z.string(),
  targetUserId: z.string(),
  isAdmin: z.enum(['true', 'false']), // Form data values are strings
});

export async function updateUserRole(formData: FormData): Promise<{ type: 'success' | 'error', message: string }> {
  try {
    const validatedFields = UpdateRoleSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      console.error("Validation failed", validatedFields.error.flatten().fieldErrors);
      throw new Error('Invalid input for updating user role.');
    }
    
    const { organizationId, targetUserId } = validatedFields.data;
    const isAdmin = validatedFields.data.isAdmin === 'true'; // Convert string to boolean
    
    const callingUserId = await verifyTenantAdmin(organizationId);

    // Prevent user from changing their own role
    if (callingUserId === targetUserId) {
      throw new Error("You cannot change your own role.");
    }

    const { db: adminDb } = getAdminApp();
    const userRef = adminDb.doc(`organizations/${organizationId}/users/${targetUserId}`);

    await userRef.update({ isAdmin });

    revalidatePath('/users');
    return { type: 'success', message: 'User role updated successfully.' };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return { type: 'error', message: error.message || 'Failed to update user role.' };
  }
}


// --- Remove User Action ---

const RemoveUserSchema = z.object({
  organizationId: z.string(),
  targetUserId: z.string(),
});

export async function removeUserFromOrg(prevState: any, formData: FormData): Promise<{ type: 'success' | 'error' | null, message: string }> {
    try {
    const validatedFields = RemoveUserSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      throw new Error('Invalid input for removing user.');
    }
    const { organizationId, targetUserId } = validatedFields.data;
    
    const callingUserId = await verifyTenantAdmin(organizationId);

    // Prevent user from removing themselves
    if (callingUserId === targetUserId) {
        throw new Error("You cannot remove yourself from the organization.");
    }
    
    const { db: adminDb } = getAdminApp();
    const userRef = adminDb.doc(`organizations/${organizationId}/users/${targetUserId}`);

    await userRef.delete();
    
    revalidatePath('/users');
    return { type: 'success', message: 'User removed successfully.' };
  } catch (error: any) {
    console.error('Error removing user:', error);
    return { type: 'error', message: error.message || 'Failed to remove user.' };
  }
}
