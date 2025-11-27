
"use server";

import { z } from "zod";
import { headers } from 'next/headers';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, writeBatch, serverTimestamp, collection, getDocs, query, where, limit, runTransaction } from "firebase/firestore";
import { app, db } from "@/lib/firebase/client"; // db is needed for transactions initiated on server
import { adminAuth, adminDb, getIsTenantAdmin } from "@/lib/firebase/server";
import { redirect } from "next/navigation";

// This needs to be a separate instance for server actions that use client auth
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
  
  let userCredential;
  try {
    // Step 1: Create the Firebase Auth user first. If this fails, we stop.
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
     let errorMessage = "An unexpected error occurred during signup.";
     const errors: SignUpState['errors'] = {};
     if (error.code === "auth/email-already-in-use") {
        errors.email = ["This email address is already in use by another account."];
        errorMessage = "This email address is already in use. Please login instead."
     } else {
        errorMessage = error.message || errorMessage;
        errors._form = [errorMessage];
     }
     return { type: "error", message: errorMessage, errors, fields };
  }

  const user = userCredential.user;
  await updateProfile(user, { displayName: displayName });

  try {
    // Step 2: Use a transaction to create the organization and user profile
    await runTransaction(adminDb, async (transaction) => {
      const orgsRef = collection(adminDb, "organizations");
      const orgQuery = query(orgsRef, where("name", "==", organizationName));
      const orgQuerySnapshot = await transaction.get(orgQuery);

      if (!orgQuerySnapshot.empty) {
        throw new Error(`An organization named "${organizationName}" already exists.`);
      }

      const orgRef = doc(collection(adminDb, "organizations"));
      const orgId = orgRef.id;

      transaction.set(orgRef, {
        name: organizationName,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      const userInOrgRef = doc(adminDb, "organizations", orgId, "users", user.uid);
      transaction.set(userInOrgRef, {
        displayName: displayName,
        email: user.email,
        photoURL: user.photoURL,
        isAdmin: true, // First user is the admin
        createdAt: serverTimestamp(),
      });
      
      const userOrgMappingRef = doc(adminDb, 'user_org_mappings', user.uid);
      transaction.set(userOrgMappingRef, {
          organizationId: orgId,
      });

      const consentRef = doc(adminDb, "consents", user.uid);
      transaction.set(consentRef, {
        userId: user.uid,
        termsOfService: true,
        privacyPolicy: true,
        timestamp: serverTimestamp(),
      });
    });

  } catch (error: any) {
    // If the transaction fails, we should ideally delete the auth user
    // to allow them to try again. This is a "rollback".
    await adminAuth.deleteUser(user.uid);
    
    return { 
      type: "error", 
      message: error.message || "An unexpected error occurred while setting up your organization.",
      errors: { _form: [error.message] },
      fields,
    };
  }
  
  // If we get here, both auth user and DB records were created successfully.
  // We need to sign the user in to create a session cookie.
  await signInWithEmailAndPassword(auth, email, password);

  // Redirect to dashboard after successful login and data creation
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

    try {
        await signInWithEmailAndPassword(auth, email, password);
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

async function getUserIdFromHeader(): Promise<string | null> {
    const authHeader = headers().get('Authorization');
    if (authHeader) {
      const token = authHeader.split('Bearer ')[1];
      if (token) {
        try {
          const decodedToken = await adminAuth.verifyIdToken(token);
          return decodedToken.uid;
        } catch (error) {
          console.error("Error verifying ID token:", error);
          return null;
        }
      }
    }
    return null;
}

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
  const callingUserId = await getUserIdFromHeader();

  if (!callingUserId) {
    return { type: "error", message: "Authentication required to perform this action." };
  }

  const isCallerAdmin = await getIsTenantAdmin(callingUserId, organizationId);
  if (!isCallerAdmin) {
    return { type: "error", message: "Access Denied: You do not have permission to invite users to this organization." };
  }
  
  try {
    const userSearchQuery = query(
      collection(adminDb, "organizations", organizationId, "users"),
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

    const batch = adminDb.batch();
    const newUserRef = doc(collection(adminDb, "organizations", organizationId, "users"));
    
    batch.set(newUserRef, {
      displayName: displayName,
      email: email,
      photoURL: null,
      isAdmin: false, 
      createdAt: serverTimestamp(),
    });

    await batch.commit();

  } catch (error: any) {
    return {
      type: "error",
      message: error.message || "An unexpected error occurred while inviting the user.",
    };
  }

  return { type: "success", message: `${displayName} has been invited.` };
}
