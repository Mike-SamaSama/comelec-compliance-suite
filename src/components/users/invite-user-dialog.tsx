
"use client";

import { useState, useActionState, useEffect } from "react";
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
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite a New Team Member</DialogTitle>
          <DialogDescription>
            Enter the details of the person you want to invite. They will be added as a Member.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            {state?.type === "error" && state.message && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Invitation Failed</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            <input type="hidden" name="organizationId" value={organizationId} />
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="displayName" className="text-right">
                Full Name
              </Label>
              <div className="col-span-3">
                <Input id="displayName" name="displayName" className="w-full" />
                {state?.errors?.displayName && <p className="text-sm font-medium text-destructive pt-1">{state.errors.displayName[0]}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3">
                <Input id="email" name="email" type="email" className="w-full" />
                {state?.errors?.email && <p className="text-sm font-medium text-destructive pt-1">{state.errors.email[0]}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    