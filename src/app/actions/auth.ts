
"use server";

import { z } from "zod";
import { cookies } from 'next/headers';
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { app } from "@/lib/firebase/client"; 
import { getAdminApp, getIsTenantAdmin } from "@/lib/firebase/server";
import { redirect } from "next/navigation";


const auth = getAuth(app);

const emailSchema = z.string().email({ message: "Invalid email address." });
const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters long." });

// This action is now only responsible for creating the DB records, not the user.
const CreateOrgSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  organizationName: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  email: emailSchema,
  uid: z.string(),
  idToken: z.string(),
});

export type CreateOrgState = {
  type: "error" | "success" | null;
  message: string;
  errors?: {
    organizationName?: string[];
    _form?: string[];
  };
  // Add a field to carry the permission error details to the client
  permissionErrorContext?: any;
};

export async function createOrganizationForNewUser(prevState: CreateOrgState, formData: FormData): Promise<CreateOrgState> {
  const { auth: adminAuth, db: adminDb } = getAdminApp();
  const validatedFields = CreateOrgSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
      return {
          type: "error",
          message: "Invalid data submitted.",
      };
  }
  
  const { displayName, organizationName, email, uid, idToken } = validatedFields.data;

  try {
    // Verify the ID token to ensure the request is from an authenticated user
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Pre-check: Does an organization with this name already exist?
    const orgsRef = adminDb.collection("organizations");
    const orgQuery = orgsRef.where("name", "==", organizationName);
    const orgSnapshot = await orgQuery.get();
    if (!orgSnapshot.empty) {
      return { 
          type: "error", 
          message: `An organization named "${organizationName}" already exists.`,
          errors: { organizationName: [`An organization named "${organizationName}" already exists.`] },
      };
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
    cookies().set("session", sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true, path: '/' });

  } catch (error: any) {
    console.error("Error in createOrganizationForNewUser: ", error);
    
    // Catch the Firestore permission error
    if (error.code === 7 || (error.code === 'permission-denied' && error.details?.includes('permission-denied'))) {
        
        // This is where we create the rich, contextual error info.
        const context = {
            path: `BATCH WRITE to: /organizations, /organizations/${'orgId'}/users, /user_org_mappings, /consents`,
            operation: 'write',
            requestResourceData: "See multiple resources created during signup.",
        };

        // Instead of re-throwing, we return it in the form state
        // to be handled by the client.
        return { 
            type: 'error', 
            message: "A Firestore security rule denied the request.",
            permissionErrorContext: context,
        };
    }
    
    return { type: 'error', message: error.message || "An unexpected error occurred." };
  }
  
  // This will be handled by client-side redirect now
  return { type: 'success', message: 'Account created successfully!' };
}


const SignInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required." }),
});

export type SignInState = {
  type: "error" | "success" | null;
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  }
}

export async function signInWithEmail(prevState: SignInState, formData: FormData): Promise<SignInState> {
    const { auth: adminAuth } = getAdminApp();
    const validatedFields = SignInSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            type: "error",
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Invalid email or password.",
        };
    }

    const { email, password } = validatedFields.data;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
        cookies().set("session", sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true, path: '/' });

    } catch (error: any) {
        let errorMessage = "Invalid login credentials. Please try again.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = "Invalid email or password. Please try again."
        } else {
          errorMessage = error.message || "An unexpected error occurred. Please try again.";
        }

        return { type: "error", message: errorMessage, errors: {_form: [errorMessage]} };
    }

    return redirect('/dashboard');
}


const InviteUserSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: emailSchema,
  organizationId: z.string().min(1, { message: "Organization ID is required." }),
});

export type InviteUserState = {
  type: "error" | "success" | null;
  message: string;
  errors?: {
    displayName?: string[];
    email?: string[];
    organizationId?: string[];
    _form?: string[];
  };
};


export async function inviteUserToOrganization(prevState: InviteUserState, formData: FormData): Promise<InviteUserState> {
  const { auth: adminAuth, db: adminDb } = getAdminApp();
  const validatedFields = InviteUserSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      type: "error",
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
    };
  }

  const { displayName, email, organizationId } = validatedFields.data;
  
  let callingUserId: string;
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      throw new Error("Authentication required.");
    }
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    callingUserId = decodedToken.uid;
  } catch(e) {
     console.error("Auth error in inviteUserToOrganization", e);
     return { type: "error", message: "Authentication required to perform this action." };
  }


  const isCallerAdmin = await getIsTenantAdmin(callingUserId, organizationId);
  if (!isCallerAdmin) {
    return { type: "error", message: "Access Denied: You do not have permission to invite users." };
  }
  
  try {
    const usersInOrgRef = adminDb.collection("organizations").doc(organizationId).collection("users");
    const userSearchQuery = usersInOrgRef.where("email", "==", email);
    const existingUserSnap = await userSearchQuery.get();

    if (!existingUserSnap.empty) {
      return {
        type: "error",
        message: "A user with this email already exists in this organization.",
        errors: { email: ["A user with this email already exists in this organization."] },
      };
    }
    
    // We are not creating an authenticated user here, just a profile document.
    await usersInOrgRef.add({
      displayName: displayName,
      email: email,
      photoURL: null,
      isAdmin: false, // Invited users are members by default
      createdAt: new Date(),
    });

  } catch (error: any) {
    console.error("Error inviting user:", error);
    return {
      type: "error",
      message: error.message || "An unexpected error occurred while inviting the user.",
    };
  }

  return { type: "success", message: `${displayName} has been invited.` };
}


export async function signOut() {
  cookies().delete('session');
  redirect('/login');
}
