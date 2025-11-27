"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, ShieldAlert } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export default function UsersPage() {
  const { isTenantAdmin } = useAuth();

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
                    <TableRow>
                        <TableCell className="font-medium">Juan Dela Cruz</TableCell>
                        <TableCell>juan@example.com</TableCell>
                        <TableCell><Badge variant="secondary">Admin</Badge></TableCell>
                        <TableCell>2024-01-10</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon">...</Button>
                        </TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-medium">Maria Clara</TableCell>
                        <TableCell>maria@example.com</TableCell>
                        <TableCell><Badge variant="outline">Member</Badge></TableCell>
                        <TableCell>2024-03-22</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon">...</Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
