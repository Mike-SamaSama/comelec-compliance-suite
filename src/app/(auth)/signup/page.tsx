
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpWithOrganization, type SignUpState } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, UserPlus } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating Account...' : <><UserPlus className="mr-2 h-4 w-4" /> Create Account</>}
    </Button>
  );
}

const initialState: SignUpState = {
  type: null,
  message: '',
};

export default function SignupPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(signUpWithOrganization, initialState);

  useEffect(() => {
    if (state.type === 'success') {
      router.push('/dashboard');
    }
  }, [state, router]);
  
  const emailInUse = state?.errors?.email?.[0].includes('already in use');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-headline">Create an Account</h1>
        <p className="text-muted-foreground">
          Register your organization to get started.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.type === 'error' && state.message && !emailInUse && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Signup Failed</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input id="organizationName" name="organizationName" placeholder="Your Political Party" required defaultValue={state?.fields?.organizationName} />
          {state?.errors?.organizationName && <p className="text-sm font-medium text-destructive">{state.errors.organizationName[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Your Full Name</Label>
          <Input id="displayName" name="displayName" placeholder="Juan Dela Cruz" required defaultValue={state?.fields?.displayName} />
          {state?.errors?.displayName && <p className="text-sm font-medium text-destructive">{state.errors.displayName[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required defaultValue={state?.fields?.email} />
          {emailInUse ? (
            <p className="text-sm font-medium text-destructive">
              This email address is already in use. Please{' '}
              <Link href="/login" className="font-bold underline">
                login
              </Link>{' '}
              instead.
            </p>
          ) : (
            state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
          {state?.errors?.password && <p className="text-sm font-medium text-destructive">{state.errors.password[0]}</p>}
        </div>
        <div className="flex items-start space-x-2 pt-2">
          <Checkbox id="consent" name="consent" defaultChecked={!!state?.fields?.consent} />
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I agree to the terms and privacy policy.
            </label>
            <p className="text-sm text-muted-foreground">
              You agree to our <Link href="/terms-of-service" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy-policy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
          </div>
        </div>
        {state?.errors?.consent && <p className="text-sm font-medium text-destructive">{state.errors.consent[0]}</p>}

        <SubmitButton />
      </form>
      <p className="px-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
          Login
        </Link>
      </p>
    </div>
  );
}
