
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useCollection } from "@/hooks/use-collection";
import type { OrgUser } from "@/lib/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, ShieldAlert } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(name: string | null | undefined) {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
      return (parts[0][0] + (parts[parts.length - 1][0])).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}


export default function UsersPage() {
  const { profile, isTenantAdmin } = useAuth();
  
  // Construct a stable path string. The hook will only re-run when this path changes.
  const usersPath = profile ? `organizations/${profile.organizationId}/users` : null;
  const { data: users, loading } = useCollection<OrgUser>(usersPath);

  if (!isTenantAdmin) {
    return (
       <Card className="max-w-lg mx-auto mt-10">
        <CardHeader className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="mt-4">Access Denied</CardTitle>
          <CardDescription>You do not have permission to view this page. Please contact your organization administrator.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
         <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">User Management</h1>
            <p className="text-lg text-muted-foreground">
              Invite and manage members of your organization.
            </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Invite User
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>A list of all users in your organization.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                            </TableRow>
                        ))
                    ) : users?.map(user => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={user.photoURL || undefined} />
                                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                </Avatar>
                                <span>{user.displayName}</span>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                {user.isAdmin ? <Badge variant="secondary">Admin</Badge> : <Badge variant="outline">Member</Badge>}
                            </TableCell>
                            <TableCell>{user.createdAt?.toDate().toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                               <Button variant="ghost" size="icon">...</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             {(!loading && (!users || users.length === 0)) && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg mt-4">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No Users Found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                    Invite your first team member to get started.
                    </p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
