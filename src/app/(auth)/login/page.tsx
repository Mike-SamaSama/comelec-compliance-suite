
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { signInWithEmail, type SignInState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing In..." : <> <ArrowRight className="mr-2 h-4 w-4" /> Sign In </>}
    </Button>
  );
}

const initialState: SignInState = {
  type: null,
  message: ""
};

export default function LoginPage() {
  const [state, formAction] = useActionState(signInWithEmail, initialState);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-headline">Welcome Back</h1>
        <p className="text-muted-foreground">Enter your credentials to access your account.</p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.type === "error" && state.message && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
          {state?.errors?.password && <p className="text-sm font-medium text-destructive">{state.errors.password[0]}</p>}
        </div>
        <SubmitButton />
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
