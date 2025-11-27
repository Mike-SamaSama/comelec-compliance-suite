
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This is a server-only file.

// This structure allows us to lazy-initialize the admin app.
let adminApp: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

function getAdminApp(): { app: App; auth: Auth; db: Firestore } {
  if (adminApp && adminAuth && adminDb) {
    return { app: adminApp, auth: adminAuth, db: adminDb };
  }
  
  const existingApp = getApps().find((app) => app.name === 'admin');
  
  if (existingApp) {
    adminApp = existingApp;
  } else {
    // This is the part that has been failing.
    const serviceAccount = {
      "type": "service_account",
      "project_id": "studio-9020847636-9d4fa",
      "private_key_id": "e4f8d298538b30f81d137b349b109e543666d66e",
      "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCp\n-----END PRIVATE KEY-----",
      "client_email": "firebase-adminsdk-3y52g@studio-9020847636-9d4fa.iam.gserviceaccount.com",
      "client_id": "111360058319690184423",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-3y52g%40studio-9020847636-9d4fa.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
    };

    adminApp = initializeApp(
      {
        credential: cert(serviceAccount),
      },
      'admin'
    );
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
