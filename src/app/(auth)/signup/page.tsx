
'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { auth } from '@/lib/firebase/client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { createOrganizationForNewUser, CreateOrgState } from '@/app/actions/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, UserPlus, Loader2 } from 'lucide-react';


const SignUpSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  organizationName: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and privacy policy." }),
  }),
});

type FormState = {
  message: string;
  errors?: {
    displayName?: string[];
    organizationName?: string[];
    email?: string[];
    password?: string[];
    consent?: string[];
    _form?: string[];
  };
  permissionErrorContext?: any;
};

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<FormState>({ message: '' });

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const data = Object.fromEntries(formData);
      const parsed = SignUpSchema.safeParse({
        ...data,
        consent: data.consent === 'on',
      });

      if (!parsed.success) {
        setFormState({
          message: "Please correct the errors below.",
          errors: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      
      const { email, password, displayName, organizationName } = parsed.data;

      try {
        // Step 1: Create user on the client
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const idToken = await user.getIdToken();

        // Step 2: Call server action to create DB records
        const orgFormData = new FormData();
        orgFormData.append('uid', user.uid);
        orgFormData.append('idToken', idToken);
        orgFormData.append('displayName', displayName);
        orgFormData.append('organizationName', organizationName);
        orgFormData.append('email', email);

        const orgState:CreateOrgState = await createOrganizationForNewUser({ type: null, message: '' }, orgFormData);

        if (orgState.type === 'error') {
            if (orgState.permissionErrorContext) {
                 if (process.env.NODE_ENV === 'development') {
                    const permissionError = new FirestorePermissionError(orgState.permissionErrorContext);
                    errorEmitter.emit('permission-error', permissionError);
                 }
            }
          // If org creation fails, we should ideally delete the user.
          setFormState({ 
            message: orgState.message,
            errors: (orgState as any).errors,
          });
          // Clean up created user if org creation fails
          await user.delete();

        } else {
          // Success! Redirect to dashboard.
          router.push('/dashboard');
        }

      } catch (error: any) {
        let message = "An unexpected error occurred.";
        const errors: FormState['errors'] = {};
        if (error.code === 'auth/email-already-in-use') {
            message = "This email is already in use.";
            errors.email = [message];
        }
        setFormState({ message, errors });
      }
    });
  };

  const emailInUse = formState?.errors?.email?.[0].includes('already in use');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-headline">Create an Account</h1>
        <p className="text-muted-foreground">
          Register your organization to get started.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {formState?.message && !emailInUse && !formState.permissionErrorContext && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Signup Failed</AlertTitle>
            <AlertDescription>{formState.message}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input id="organizationName" name="organizationName" placeholder="Your Political Party" required />
          {formState?.errors?.organizationName && <p className="text-sm font-medium text-destructive pt-1">{formState.errors.organizationName[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Your Full Name</Label>
          <Input id="displayName" name="displayName" placeholder="Juan Dela Cruz" required />
          {formState?.errors?.displayName && <p className="text-sm font-medium text-destructive pt-1">{formState.errors.displayName[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          {emailInUse ? (
            <p className="text-sm font-medium text-destructive pt-1">
              This email address is already in use. Please{' '}
              <Link href="/login" className="font-bold underline">
                login
              </Link>{' '}
              instead.
            </p>
          ) : (
            formState?.errors?.email && <p className="text-sm font-medium text-destructive pt-1">{formState.errors.email[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
          {formState?.errors?.password && <p className="text-sm font-medium text-destructive pt-1">{formState.errors.password[0]}</p>}
        </div>
        <div className="flex items-start space-x-2 pt-2">
          <Checkbox id="consent" name="consent" />
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I agree to the terms and privacy policy.
            </label>
            <p className="text-sm text-muted-foreground">
              You agree to our <Link href="/terms-of-service" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy-policy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
          </div>
        </div>
        {formState?.errors?.consent && <p className="text-sm font-medium text-destructive">{formState.errors.consent[0]}</p>}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
          {isPending ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
          Login
        </Link>
      </p>
    </div>
  );
}
