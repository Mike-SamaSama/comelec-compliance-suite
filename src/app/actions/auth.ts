
"use server";

import { z } from "zod";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, writeBatch, serverTimestamp } from "firebase/firestore";
import { app, db } from "@/lib/firebase/client"; // Use client for auth on server

const auth = getAuth(app);

const emailSchema = z.string().email({ message: "Invalid email address." });
const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters long." });

const SignUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  organizationName: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  email: emailSchema,
  password: passwordSchema,
  consent: z.literal("on", {
    errorMap: () => ({ message: "You must agree to the terms and privacy policy." }),
  }),
});

export type SignUpState = {
  type: "error" | "success" | null;
  message: string;
  errors?: {
    name?: string[];
    organizationName?: string[];
    email?: string[];
    password?: string[];
    consent?: string[];
  };
  fields?: {
    name?: string;
    organizationName?: string;
    email?: string;
    consent?: string;
  };
};


export async function signUpWithOrganization(prevState: SignUpState, formData: FormData): Promise<SignUpState> {
  const validatedFields = SignUpSchema.safeParse(Object.fromEntries(formData.entries()));
  
  const fields = {
    name: formData.get('name') as string,
    organizationName: formData.get('organizationName') as string,
    email: formData.get('email') as string,
    consent: formData.get('consent') as string,
  };


  if (!validatedFields.success) {
    return {
      type: "error",
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
      fields: fields,
    };
  }

  const { email, password, name, organizationName } = validatedFields.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const batch = writeBatch(db);

    // 1. Create the new organization
    const orgRef = doc(db, "organizations", user.uid); // Using user.uid as org id for simplicity
    batch.set(orgRef, {
      name: organizationName,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });
    
    // 2. Create the user's profile within the organization subcollection
    const userInOrgRef = doc(db, "organizations", user.uid, "users", user.uid);
    batch.set(userInOrgRef, {
      displayName: name,
      email: user.email,
      photoURL: user.photoURL,
      isAdmin: true, // First user is the admin
      createdAt: serverTimestamp(),
    });
    
    // 3. Create a mapping in a root collection for easy organization lookup on login
    const userOrgMappingRef = doc(db, 'user_org_mappings', user.uid);
    batch.set(userOrgMappingRef, {
        organizationId: user.uid, // The new org ID
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

    return { type: "success", message: "Account created successfully! Redirecting..." };
  } catch (error: any) {
    let errorMessage = "An unexpected error occurred during signup.";
    const fieldErrors: SignUpState['errors'] = {};

    if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email address is already in use by another account.";
        fieldErrors.email = [errorMessage];
    }
    
    return { 
      type: "error", 
      message: errorMessage,
      errors: fieldErrors,
      fields: fields,
    };
  }
}


const SignInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required." }),
});

export async function signInWithEmail(prevState: any, formData: FormData) {
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
        return { type: "success", message: "Signed in successfully. Redirecting..." };
    } catch (error: any) {
        return { type: "error", message: "Invalid login credentials. Please try again." };
    }
}
