
"use server";

import { z } from "zod";
import { cookies } from 'next/headers';
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, serverTimestamp, collection, getDocs, query, where, limit, addDoc } from "firebase/firestore";
import { app } from "@/lib/firebase/client"; 
import { adminAuth, adminDb, getIsTenantAdmin } from "@/lib/firebase/server";
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
  
  // Pre-check: Does an organization with this name already exist?
  try {
    const orgsRef = collection(adminDb, "organizations");
    const orgQuery = query(orgsRef, where("name", "==", organizationName), limit(1));
    const orgSnapshot = await getDocs(orgQuery);
    if (!orgSnapshot.empty) {
      return { 
          type: "error", 
          message: `An organization named "${organizationName}" already exists.`,
          errors: { organizationName: [`An organization named "${organizationName}" already exists.`] },
          fields,
      };
    }
  } catch (error: any) {
    console.error("Error checking for existing organization:", error);
    return { type: "error", message: "A server error occurred. Please try again later.", fields };
  }

  let userRecord;
  try {
     // Use Admin SDK to create user.
    userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });
  } catch (error: any) {
     let errorMessage = "An unexpected error occurred during signup.";
     const errors: SignUpState['errors'] = {};
     if (error.code === "auth/email-already-exists") {
        errors.email = ["This email address is already in use by another account."];
        errorMessage = "This email address is already in use. Please login instead."
     } else {
        errorMessage = error.message || errorMessage;
        errors._form = [errorMessage];
     }
     return { type: "error", message: errorMessage, errors, fields };
  }

  try {
    // Use a batch write to ensure atomicity for document creation
    const batch = adminDb.batch();
    
    const orgRef = doc(collection(adminDb, "organizations"));
    const orgId = orgRef.id;

    // 1. Create the organization
    batch.set(orgRef, {
      name: organizationName,
      ownerId: userRecord.uid,
      createdAt: serverTimestamp(),
    });

    // 2. Create the user's profile within the organization
    const userInOrgRef = doc(adminDb, "organizations", orgId, "users", userRecord.uid);
    batch.set(userInOrgRef, {
      displayName: displayName,
      email: email,
      photoURL: userRecord.photoURL || null,
      isAdmin: true, // First user is the admin
      createdAt: serverTimestamp(),
    });
    
    // 3. Create the user-to-organization mapping
    const userOrgMappingRef = doc(adminDb, 'user_org_mappings', userRecord.uid);
    batch.set(userOrgMappingRef, {
        organizationId: orgId,
    });

    // 4. Log consent
    const consentRef = doc(adminDb, "consents", userRecord.uid);
    batch.set(consentRef, {
      userId: userRecord.uid,
      termsOfService: true,
      privacyPolicy: true,
      timestamp: serverTimestamp(),
    });
    
    // Commit the batch
    await batch.commit();

  } catch (error: any) {
    // If the batch fails, we must delete the user we just created to allow them to retry.
    await adminAuth.deleteUser(userRecord.uid);
    
    return { 
      type: "error", 
      message: error.message || "An unexpected error occurred while setting up your organization.",
      errors: { _form: [error.message] },
      fields,
    };
  }
  
  // After server-side creation, create a session cookie.
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await adminAuth.createSessionCookie(await getAuth(app).currentUser!.getIdToken(), { expiresIn });
  cookies().set("session", sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true });


  // This part is tricky. The server action creates the user, but the client doesn't know about it yet.
  // We will sign them in on the client to get an ID token, then create the session cookie.
  await signInWithEmailAndPassword(auth, email, password);
  const idToken = await auth.currentUser!.getIdToken();
  const sessionCookie2 = await adminAuth.createSessionCookie(idToken, { expiresIn });
  cookies().set("session", sessionCookie2, { maxAge: expiresIn, httpOnly: true, secure: true });

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
    const validatedFields = SignInSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            type: "error",
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Invalid email or password.",
        };
    }

    const { email, password } = validatedFields.data;

    let userCredential;
    try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        let errorMessage = "Invalid login credentials. Please try again.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = "Invalid email or password. Please try again."
        } else {
          errorMessage = error.message || "An unexpected error occurred. Please try again.";
        }

        return { type: "error", message: errorMessage, errors: {_form: [errorMessage]} };
    }
    
    // Create session cookie
    const idToken = await userCredential.user.getIdToken();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    cookies().set("session", sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true });


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
  const validatedFields = InviteUserSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      type: "error",
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
    };
  }

  const { displayName, email, organizationId } = validatedFields.data;
  
  // --- Authorization ---
  let callingUserId: string;
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      throw new Error("Authentication required. Please sign in.");
    }
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    callingUserId = decodedToken.uid;
  } catch(e) {
     console.error("Auth error in inviteUserToOrganization", e);
     return { type: "error", message: "Authentication required to perform this action. Please refresh and try again." };
  }


  const isCallerAdmin = await getIsTenantAdmin(callingUserId, organizationId);
  if (!isCallerAdmin) {
    return { type: "error", message: "Access Denied: You do not have permission to invite users to this organization." };
  }
  
  // --- Logic ---
  try {
    const usersInOrgRef = collection(adminDb, "organizations", organizationId, "users");
    const userSearchQuery = query(
      usersInOrgRef,
      where("email", "==", email),
      limit(1)
    );
    const existingUserSnap = await getDocs(userSearchQuery);

    if (!existingUserSnap.empty) {
      return {
        type: "error",
        message: "A user with this email already exists in this organization.",
        errors: { email: ["A user with this email already exists in this organization."] },
      };
    }
    
    // We are not creating an authenticated user here, just a profile document.
    // The user will need to sign up themselves with this email to get access.
    await addDoc(usersInOrgRef, {
      displayName: displayName,
      email: email,
      photoURL: null,
      isAdmin: false, // Invited users are members by default
      createdAt: serverTimestamp(),
    });

  } catch (error: any) {
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
