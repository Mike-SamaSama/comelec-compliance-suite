
"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, ShieldAlert } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface OrgUser {
    id: string;
    displayName: string;
    email: string;
    isAdmin: boolean;
    createdAt: Date;
}

export default function UsersPage() {
  const { isTenantAdmin, profile } = useAuth();
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    if (!profile?.organizationId) return;

    const usersQuery = query(collection(db, "organizations", profile.organizationId, "users"));
    
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName,
          email: data.email,
          isAdmin: data.isAdmin,
          createdAt: data.createdAt?.toDate(),
        } as OrgUser;
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.organizationId]);


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
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                            </TableRow>
                        ))
                    ) : users.map(user => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.displayName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                {user.isAdmin ? <Badge variant="secondary">Admin</Badge> : <Badge variant="outline">Member</Badge>}
                            </TableCell>
                            <TableCell>{user.createdAt?.toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                               <Button variant="ghost" size="icon">...</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             {(!loading && users.length === 0) && (
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
