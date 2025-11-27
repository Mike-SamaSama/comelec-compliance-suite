
"use client";

import { useState, useTransition } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { z } from "zod";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { createSessionCookie } from "@/app/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

type FormState = {
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<FormState>({ message: '' });

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
        const data = Object.fromEntries(formData);
        const parsed = LoginSchema.safeParse(data);

        if (!parsed.success) {
            setFormState({
                message: "Please correct the errors below.",
                errors: parsed.error.flatten().fieldErrors,
            });
            return;
        }

        const { email, password } = parsed.data;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            const sessionFormData = new FormData();
            sessionFormData.append('idToken', idToken);
            const result = await createSessionCookie(sessionFormData);

            if (result.status === 'success') {
                router.push('/dashboard');
            } else {
                 setFormState({ message: result.error || "Failed to create a session. Please try again." });
            }

        } catch (error: any) {
            let message = "Invalid login credentials. Please try again.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
              message = "Invalid email or password. Please try again."
            } else {
              message = error.message || "An unexpected error occurred. Please try again.";
            }
            setFormState({ message, errors: {_form: [message]} });
        }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-headline">Welcome Back</h1>
        <p className="text-muted-foreground">Enter your credentials to access your account.</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {formState?.message && formState?.errors?._form && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>{formState.message}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          {formState?.errors?.email && <p className="text-sm font-medium text-destructive pt-1">{formState.errors.email[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
          {formState?.errors?.password && <p className="text-sm font-medium text-destructive pt-1">{formState.errors.password[0]}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
          {isPending ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
