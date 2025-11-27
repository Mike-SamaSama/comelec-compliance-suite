
import { type NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, uid, displayName, organizationName, email } = body;

    // Verify the ID token to ensure the request is from an authenticated user
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (decodedToken.uid !== uid) {
        return new NextResponse(JSON.stringify({ error: "ID token does not match user UID." }), { status: 403 });
    }
    
    // Pre-check: Does an organization with this name already exist?
    const orgsRef = adminDb.collection("organizations");
    const orgQuery = orgsRef.where("name", "==", organizationName);
    const orgSnapshot = await orgQuery.get();
    if (!orgSnapshot.empty) {
      return new NextResponse(JSON.stringify({ 
          error: `An organization named "${organizationName}" already exists.`,
          errors: { organizationName: [`An organization named "${organizationName}" already exists.`] },
      }), { status: 409 }); // 409 Conflict
    }
    
    // Create all Firestore documents in an atomic batch write
    const batch = adminDb.batch();
    const orgRef = adminDb.collection("organizations").doc();
    const orgId = orgRef.id;

    const orgData = {
      name: organizationName,
      ownerId: uid,
      createdAt: new Date(),
    };
    batch.set(orgRef, orgData);

    const userInOrgRef = adminDb.doc(`organizations/${orgId}/users/${uid}`);
    const userInOrgData = {
      displayName: displayName,
      email: email,
      photoURL: null,
      isAdmin: true, // First user is the admin
      createdAt: new Date(),
    };
    batch.set(userInOrgRef, userInOrgData);
    
    const userOrgMappingRef = adminDb.doc(`user_org_mappings/${uid}`);
    const userOrgMappingData = { organizationId: orgId };
    batch.set(userOrgMappingRef, userOrgMappingData);

    const consentRef = adminDb.doc(`consents/${uid}`);
    const consentData = {
      userId: uid,
      termsOfService: true,
      privacyPolicy: true,
      timestamp: new Date(),
    };
    batch.set(consentRef, consentData);
    
    await batch.commit();

    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      path: '/',
    };
    
    const response = new NextResponse(JSON.stringify({ status: 'success', organizationId: orgId }), {
      status: 200,
    });
    response.cookies.set(options);
    return response;

  } catch (error: any) {
    console.error("Error in signup API route: ", error);
     if (error.code && error.code.includes('auth/')) {
        return new NextResponse(
            JSON.stringify({ error: "Firebase authentication failed on the server. Please check server logs." }),
            { status: 500 }
        );
    }
    return new NextResponse(JSON.stringify({ error: error.message || "An unexpected error occurred." }), { status: 500 });
  }
}
