"use client";

import { useActionState, useFormStatus } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AlertCircle, LogIn } from "lucide-react";
import { signInWithEmail } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing In..." : <> <LogIn className="mr-2 h-4 w-4" /> Sign In </>}
    </Button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useActionState(signInWithEmail, null);

  useEffect(() => {
    if (state?.type === "success") {
      toast({
        title: "Login Successful",
        description: state.message,
      });
      // The middleware will handle redirection after cookie is set.
      // A small delay might be needed for cookie to be set on client.
      setTimeout(() => router.push("/dashboard"), 500);
    }
  }, [state, router, toast]);

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

      <p className="px-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
