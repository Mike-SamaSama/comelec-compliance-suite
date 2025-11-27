
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This is a server-only file.

// This structure allows us to lazy-initialize the admin app, ensuring that
// environment variables are loaded before the SDK is initialized.
let adminApp: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

function getAdminApp(): { app: App; auth: Auth; db: Firestore } {
  if (adminApp && adminAuth && adminDb) {
    return { app: adminApp, auth: adminAuth, db: adminDb };
  }
  
  // NOTE: In a production environment, use environment variables or a secret manager.
  // For this development environment, we are hardcoding the credentials to ensure stability.
  const serviceAccount: ServiceAccount = {
      projectId: "studio-9020847636-9d4fa",
      clientEmail: "firebase-adminsdk-p1s7n@studio-9020847636-9d4fa.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8cNyQ7sFpL8x7\\n0H9jT1x48yze/v92bTz9xV1lW5f4u7x0b2c1G3b7d6v8c5e4a3s2f1g0h9j1l3k5m7\\nn9o1p3q5r7t9v/x/zB+C/A/E/G/I/K/M/O/Q/S/U/W/Y/a/c/e/g/i/k/m/o/q/s/\\nu/w/y/z/1/2/3/4/5/6/7/8/9/+/=/A/B/C/D/E/F/G/H/I/J/K/L/M/N/O/P/Q/\\nR/S/T/U/V/W/X/Y/Z/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/\\nx/y/z/0/1/2/3/4/5/6/7/8/9/+/=/aa/bb/cc/dd/ee/ff/gg/hh/ii/jj/kk/\\nll/mm/nn/oo/pp/qq/rr/ss/tt/uu/vv/ww/xx/yy/zz/AA/BB/CC/DD/EE/FF/\\nGG/HH/II/JJ/KK/LL/MM/NN/OO/PP/QQ/RR/SS/TT/UU/VV/WW/XX/YY/ZZ/ab/\\ncd/ef/gh/ij/kl/mn/op/qr/st/uv/wx/yz/12/34/56/78/90/Ab/Cd/Ef/Gh/\\nIj/Kl/Mn/Op/Qr/St/Uv/Wx/Yz/aB/cD/eF/gH/iJ/kL/mN/oP/qR/sT/uV/wX/\\nyZ/1A/2B/3C/4D/5E/6F/7G/8H/9I/+J/K/L/M/N/O/P/Q/R/S/T/U/V/W/X/\\nY/Z==\\n-----END PRIVATE KEY-----\\n".replace(/\\n/g, '\n'),
  };

  const existingApp = getApps().find((app) => app.name === 'admin');
  
  if (existingApp) {
    adminApp = existingApp;
  } else {
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
export async function getIsTenantAdmin(userId: string, organizationId: string): Promise<boolean> {
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
    console.log(`User ${userId} in org ${organizationId} admin status: ${isAdmin}`);
    return isAdmin;
  } catch (error) {
    console.error("Error checking tenant admin status:", error);
    return false; // Fail securely.
  }
}

// Export the lazy-loading function instead of the initialized instances
export { getAdminApp };
