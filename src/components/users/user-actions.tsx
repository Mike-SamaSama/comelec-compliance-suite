
"use client";

import { useState, useActionState, useEffect, useTransition } from "react";
import { MoreHorizontal, Shield, User, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { OrgUser } from "@/lib/types";
import { updateUserRole, removeUserFromOrg } from "@/app/actions/users";
import { useToast } from "@/hooks/use-toast";

interface UserActionsProps {
  targetUser: OrgUser;
  organizationId: string;
  isCurrentUser: boolean;
}

const initialRemoveState = {
  type: null,
  message: "",
};


export function UserActions({ targetUser, organizationId, isCurrentUser }: UserActionsProps) {
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [removeState, removeAction] = useActionState(removeUserFromOrg, initialRemoveState);

  useEffect(() => {
    if (removeState.type) {
      toast({
        title: removeState.type === 'success' ? "Success" : "Error",
        description: removeState.message,
        variant: removeState.type === 'error' ? "destructive" : "default",
      });
      if (removeState.type === 'success') {
        setIsAlertOpen(false);
        setIsMenuOpen(false);
      }
    }
  }, [removeState, toast]);


  const handleUpdateRole = (isAdmin: boolean) => {
    startTransition(async () => {
        const formData = new FormData();
        formData.append("organizationId", organizationId);
        formData.append("targetUserId", targetUser.id);
        formData.append("isAdmin", String(isAdmin));
        
        const result = await updateUserRole(formData);
        
        toast({
            title: result.type === 'success' ? "Success" : "Error",
            description: result.message,
            variant: result.type === 'error' ? "destructive" : "default",
        });

        if (result.type === 'success') {
          setIsMenuOpen(false);
        }
    });
  };
  
  if (isCurrentUser) {
    return null; // Don't show menu for the current user
  }

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Open menu</span>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {targetUser.isAdmin ? (
            <DropdownMenuItem disabled={isPending} onClick={() => handleUpdateRole(false)}>
              <User className="mr-2 h-4 w-4" />
              <span>Make Member</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled={isPending} onClick={() => handleUpdateRole(true)}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Make Admin</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" disabled={isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Remove User</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <form action={removeAction}>
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="targetUserId" value={targetUser.id} />
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action will permanently remove <span className="font-bold">{targetUser.displayName}</span> from the organization. They will lose all access. This cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="submit" variant="destructive">
                Yes, remove user
            </Button>
            </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
