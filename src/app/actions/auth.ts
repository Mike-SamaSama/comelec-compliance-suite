
"use server";

import { z } from "zod";
import { cookies } from 'next/headers';
import { adminAuth, adminDb, getIsTenantAdmin } from "@/lib/firebase/server";
import { redirect } from "next/navigation";


const InviteUserSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
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
      createdAt: new Date(),
      isAdmin: false, // Invited users are members by default
      photoURL: null,
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
