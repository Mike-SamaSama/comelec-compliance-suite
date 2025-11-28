
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

const apps = getApps();
const adminApp =
  !apps.length
    ? initializeApp(
        serviceAccount
          ? { credential: cert(serviceAccount) }
          : undefined
      )
    : getApp();


const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);


async function getIsTenantAdmin(userId: string, organizationId: string): Promise<boolean> {
  if (!userId || !organizationId) {
    return false;
  }
  
  try {
    const userDocRef = adminDb.doc(`organizations/${organizationId}/users/${userId}`);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      return false;
    }
    
    return userDocSnap.data()?.isAdmin === true;
  } catch (error) {
    console.error("Error checking tenant admin status:", error);
    return false;
  }
}

export { adminApp, adminAuth, adminDb, getIsTenantAdmin };
