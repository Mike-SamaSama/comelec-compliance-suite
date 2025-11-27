
"use client";

import { MoreHorizontal, Shield, User, Trash2 } from "lucide-react";
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
import { useState } from "react";

interface UserActionsProps {
  targetUser: OrgUser;
  organizationId: string;
  isCurrentUser: boolean;
}

export function UserActions({ targetUser, organizationId, isCurrentUser }: UserActionsProps) {
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleAction = async (action: (formData: FormData) => Promise<{ type: string; message: string }>, formData: FormData) => {
    const result = await action(formData);
    if (result.type === 'success') {
      toast({
        title: "Success",
        description: result.message,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
    setIsAlertOpen(false);
  };

  const handleUpdateRole = (isAdmin: boolean) => {
    const formData = new FormData();
    formData.append("organizationId", organizationId);
    formData.append("targetUserId", targetUser.id);
    formData.append("isAdmin", String(isAdmin));
    handleAction(updateUserRole, formData);
  };
  
  const handleRemoveUser = () => {
    const formData = new FormData();
    formData.append("organizationId", organizationId);
    formData.append("targetUserId", targetUser.id);
    handleAction(removeUserFromOrg, formData);
  }

  if (isCurrentUser) {
    return null; // Don't show menu for the current user
  }

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {targetUser.isAdmin ? (
            <DropdownMenuItem onClick={() => handleUpdateRole(false)}>
              <User className="mr-2 h-4 w-4" />
              <span>Make Member</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleUpdateRole(true)}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Make Admin</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Remove User</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently remove <span className="font-bold">{targetUser.displayName}</span> from the organization. They will lose all access. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRemoveUser} className="bg-destructive hover:bg-destructive/90">
            Yes, remove user
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
