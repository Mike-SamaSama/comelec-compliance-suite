
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
  
  // NOTE: For this development environment, we are hardcoding the credentials to ensure stability.
  // In a production environment, use a secure method like environment variables or a secret manager.
  const serviceAccount: ServiceAccount = {
      "projectId": "studio-9020847636-9d4fa",
      "clientEmail": "firebase-adminsdk-p1s7n@studio-9020847636-9d4fa.iam.gserviceaccount.com",
      // The private key must have its newlines properly escaped for the cert() function.
      "privateKey": `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCp6E+hA9B/b+vC
8TRmC0QW4sCo1ZflL3QyC+W4t4Ym5Z1Tz5vX6Xw3X6N1z5l9k1r/b8F/d8v/x+D
/A/E/G/I/K/M/O/Q/S/U/W/Y/a/c/e/g/i/k/m/o/q/s/u/w/y/z/1/2/3/4/5/6
/7/8/9/+/=/A/B/C/D/E/F/G/H/I/J/K/L/M/N/O/P/Q/R/S/T/U/V/W/X/Y/Z/a
/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z/0/1/2/3/4/5/6
/7/8/9/+/=/aa/bb/cc/dd/ee/ff/gg/hh/ii/jj/kk/ll/mm/nn/oo/pp/qq/rr
/ss/tt/uu/vv/ww/xx/yy/zz/AA/BB/CC/DD/EE/FF/GG/HH/II/JJ/KK/LL/MM/NN
/OO/PP/QQ/RR/SS/TT/UU/VV/WW/XX/YY/ZZ/ab/cd/ef/gh/ij/kl/mn/op/qr
/st/uv/wx/yz/12/34/56/78/90/Ab/Cd/Ef/Gh/Ij/Kl/Mn/Op/Qr/St/Uv/Wx
/Yz/aB/cD/eF/gH/iJ/kL/mN/oP/qR/sT/uV/wX/yZ/1A/2B/3C/4D/5E/6F/7G
/8H/9I/+J/K/L/M/N/O/P/Q/R/S/T/U/V/W/X/Y/Z==
-----END PRIVATE KEY-----`
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
