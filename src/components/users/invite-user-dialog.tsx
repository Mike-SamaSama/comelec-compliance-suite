
"use client";

import { useState, useActionState, useEffect, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { PlusCircle, UserPlus, Loader2, AlertCircle } from "lucide-react";
import { inviteUserToOrganization, type InviteUserState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
      {pending ? "Sending Invitation..." : "Send Invitation"}
    </Button>
  );
}

const initialState: InviteUserState = {
  type: null,
  message: "",
};

export function InviteUserDialog({ organizationId }: { organizationId: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  // use a key to reset the form state when dialog is re-opened
  const [formKey, setFormKey] = useState(() => Math.random().toString());
  const [state, formAction] = useActionState(inviteUserToOrganization, initialState);

  useEffect(() => {
    if (state.type === 'success') {
      toast({
        title: "Invitation Sent",
        description: state.message,
      });
      setOpen(false); // Close the dialog on success
    }
  }, [state, toast]);
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // When dialog closes, generate a new key to reset the form state for the next open
      setFormKey(Math.random().toString());
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
         <form action={formAction} key={formKey}>
            <DialogHeader>
            <DialogTitle>Invite a New Team Member</DialogTitle>
            <DialogDescription>
                Enter the details of the person you want to invite. They will be added as a Member.
            </DialogDescription>
            </DialogHeader>
        
            <div className="grid gap-4 py-4">
                {state?.type === "error" && state.message && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Invitation Failed</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
                )}
                <input type="hidden" name="organizationId" value={organizationId} />
                <div className="space-y-2">
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input id="displayName" name="displayName" />
                    {state?.errors?.displayName && <p className="text-sm font-medium text-destructive pt-1">{state.errors.displayName[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" />
                    {state?.errors?.email && <p className="text-sm font-medium text-destructive pt-1">{state.errors.email[0]}</p>}
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
