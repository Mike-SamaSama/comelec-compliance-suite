
"use server";

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { FIREBASE_CONFIG } from './config';

// This is a server-only file.

// This structure allows us to lazy-initialize the admin app.
let adminApp: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

// The service account key is securely stored as an environment variable.
// We must parse it from a stringified JSON.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

function getAdminApp(): { app: App; auth: Auth; db: Firestore } {
  if (adminApp && adminAuth && adminDb) {
    return { app: adminApp, auth: adminAuth, db: adminDb };
  }
  
  const existingApp = getApps().find((app) => app.name === 'admin');
  
  if (existingApp) {
    adminApp = existingApp;
  } else if (serviceAccount) {
    // Initialize with the service account if it's available.
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: FIREBASE_CONFIG.projectId,
    }, 'admin');
  } else {
    // Fallback for environments where Application Default Credentials are used.
    // This is the correct way for managed Google Cloud environments.
    adminApp = initializeApp({
      projectId: FIREBASE_CONFIG.projectId,
    }, 'admin');
  }

  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);

  return { app: adminApp, auth: adminAuth, db: adminDb };
}


/**
 * Checks if a user is a Tenant Administrator for a specific organization.
 * This function uses the admin SDK and should only be used in secure server environments.
 * @param userId The UID of the user to check.
 * @param organizationId The ID of the organization to check against.
 * @returns A promise that resolves to true if the user is an admin, false otherwise.
 */
export async function getIsTenantAdmin(userId: string, organizationId:string): Promise<boolean> {
  try {
    const { db } = getAdminApp();
    const userDocRef = db.collection('organizations').doc(organizationId).collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.log(`User ${userId} not found in org ${organizationId}`);
      return false; // User is not a member of the organization.
    }

    // Check if the isAdmin flag is explicitly true.
    const isAdmin = userDoc.data()?.isAdmin === true;
    return isAdmin;
  } catch (error) {
    console.error("Error checking tenant admin status:", error);
    return false; // Fail securely.
  }
}

// Export the lazy-loading function instead of the initialized instances
export { getAdminApp };
