
"use server";

import { z } from "zod";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { app, db } from "@/lib/firebase/client"; // Use client for auth on server
import { redirect } from "next/navigation";

// This needs to be a separate instance for server actions
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

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // We also update the auth user's profile
    await updateProfile(user, { displayName: displayName });

    const batch = writeBatch(db);

    // 1. Create the new organization
    const orgRef = doc(db, "organizations", crypto.randomUUID());
    const orgId = orgRef.id;

    batch.set(orgRef, {
      name: organizationName,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });
    
    // 2. Create the user's profile within the organization subcollection
    const userInOrgRef = doc(db, "organizations", orgId, "users", user.uid);
    batch.set(userInOrgRef, {
      displayName: displayName,
      email: user.email,
      photoURL: user.photoURL,
      isAdmin: true, // First user is the admin
      createdAt: serverTimestamp(),
    });
    
    // 3. Create a mapping in a root collection for easy organization lookup on login
    const userOrgMappingRef = doc(db, 'user_org_mappings', user.uid);
    batch.set(userOrgMappingRef, {
        organizationId: orgId,
    });

    // 4. Log consent
    const consentRef = doc(db, "consents", user.uid);
    batch.set(consentRef, {
      userId: user.uid,
      termsOfService: true,
      privacyPolicy: true,
      timestamp: serverTimestamp(),
    });

    await batch.commit();

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
    
    return { 
      type: "error", 
      message: errorMessage,
      errors: errors,
      fields,
    };
  }
  
  // A redirect in a server action MUST be returned, not just called.
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
