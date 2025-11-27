import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// This is a server-only file.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

// Ensure there is a defined service account
if (!serviceAccount) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
}


const adminApp =
  getApps().find((app) => app.name === 'admin') ||
  initializeApp(
    {
      credential: cert(serviceAccount),
    },
    'admin'
  );


export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

/**
 * Checks if a user is a Tenant Administrator for a specific organization.
 * This function uses the admin SDK and should only be used in secure server environments.
 * @param userId The UID of the user to check.
 * @param organizationId The ID of the organization to check against.
 * @returns A promise that resolves to true if the user is an admin, false otherwise.
 */
export async function getIsTenantAdmin(userId: string, organizationId: string): Promise<boolean> {
  try {
    const userDocRef = adminDb.collection('organizations').doc(organizationId).collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return false; // User is not a member of the organization.
    }

    // Check if the isAdmin flag is explicitly true.
    return userDoc.data()?.isAdmin === true;
  } catch (error) {
    console.error("Error checking tenant admin status:", error);
    return false; // Fail securely.
  }
}
