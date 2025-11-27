
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

const SignUpSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  organizationName: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  email: emailSchema,
  password: passwordSchema,
  consent: z.literal('on', {
    errorMap: () => ({ message: "You must agree to the terms and privacy policy." }),
  }),
});

export type SignUpState = {
  type: "error" | "success" | null;
  message: string;
  errors?: {
    displayName?: string[];
    organizationName?: string[];
    email?: string[];
    password?: string[];
    consent?: string[];
    _form?: string[];
  };
  fields?: {
    displayName: string;
    organizationName: string;
    email: string;
    consent: string;
  };
};


export async function signUpWithOrganization(prevState: SignUpState, formData: FormData): Promise<SignUpState> {
  const { auth: adminAuth, db: adminDb } = getAdminApp();

  const validatedFields = SignUpSchema.safeParse(Object.fromEntries(formData.entries()));
  
  const fields = {
    displayName: formData.get('displayName') as string,
    organizationName: formData.get('organizationName') as string,
    email: formData.get('email') as string,
    consent: formData.get('consent') as string,
  };


  if (!validatedFields.success) {
    return {
      type: "error",
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
      fields,
    };
  }

  const { email, password, displayName, organizationName } = validatedFields.data;
  
  try {
    // Pre-check: Does an organization with this name already exist? This must be done first.
    const orgsRef = adminDb.collection("organizations");
    const orgQuery = orgsRef.where("name", "==", organizationName);
    const orgSnapshot = await orgQuery.get();
    if (!orgSnapshot.empty) {
      return { 
          type: "error", 
          message: `An organization named "${organizationName}" already exists.`,
          errors: { organizationName: [`An organization named "${organizationName}" already exists.`] },
          fields,
      };
    }

    // Step 1: Create the user with the Admin SDK
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });

    // Step 2: Create all Firestore documents in an atomic batch write
    const batch = adminDb.batch();
    
    const orgRef = adminDb.collection("organizations").doc();
    const orgId = orgRef.id;

    // 2a. Create the organization
    batch.set(orgRef, {
      name: organizationName,
      ownerId: userRecord.uid,
      createdAt: new Date(),
    });

    // 2b. Create the user's profile within the organization
    const userInOrgRef = adminDb.doc(`organizations/${orgId}/users/${userRecord.uid}`);
    batch.set(userInOrgRef, {
      displayName: displayName,
      email: email,
      photoURL: userRecord.photoURL || null,
      isAdmin: true, // First user is the admin
      createdAt: new Date(),
    });
    
    // 2c. Create the user-to-organization mapping
    const userOrgMappingRef = adminDb.doc(`user_org_mappings/${userRecord.uid}`);
    batch.set(userOrgMappingRef, {
        organizationId: orgId,
    });

    // 2d. Log consent
    const consentRef = adminDb.doc(`consents/${userRecord.uid}`);
    batch.set(consentRef, {
      userId: userRecord.uid,
      termsOfService: true,
      privacyPolicy: true,
      timestamp: new Date(),
    });
    
    // Commit the batch
    await batch.commit();

    // Step 3: Create a session cookie for the new user and log them in.
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(userRecord.uid, { expiresIn });
    cookies().set("session", sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true, path: '/' });


  } catch (error: any) {
    let errorMessage = "An unexpected error occurred during signup.";
    const errors: SignUpState['errors'] = {};

    if (error.code === 'auth/email-already-exists') {
      errorMessage = "This email address is already in use. Please login instead.";
      errors.email = [errorMessage];
    } else {
      console.error("Error in signUpWithOrganization: ", error);
      errorMessage = error.message || errorMessage;
      errors._form = [errorMessage];
    }
    return { type: 'error', message: errorMessage, errors, fields };
  }
  
  return redirect('/dashboard');
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
        // This must be done on the client to verify password, so we use the client SDK here.
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Get the ID token from the authenticated user.
        const idToken = await userCredential.user.getIdToken();
        
        // Create the session cookie using the Admin SDK.
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
        
        // Set the cookie in the response.
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

    // Redirect to the dashboard on successful login.
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
