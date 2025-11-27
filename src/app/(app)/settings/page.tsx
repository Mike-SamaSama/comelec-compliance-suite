
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert } from "lucide-react";


export default function SettingsPage() {
    const { profile, isTenantAdmin } = useAuth();
    
    if (!profile) {
        return null;
    }
    
    if (!isTenantAdmin) {
    return (
       <Card className="max-w-lg mx-auto mt-10">
        <CardHeader className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="mt-4">Access Denied</CardTitle>
          <CardDescription>You do not have permission to edit organization settings. Please contact your organization administrator.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Organization Settings</h1>
        <p className="text-lg text-muted-foreground">
          Manage your organization's profile and details.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>This information is shared with all members of your organization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input id="orgName" defaultValue={profile.organizationName || ""} />
            </div>
             <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
            <div>
                <p className="font-medium">Delete Organization</p>
                <p className="text-sm text-muted-foreground">This will permanently delete your organization and all its data.</p>
            </div>
            <Button variant="destructive">Delete</Button>
        </CardContent>
      </Card>
    </div>
  );
}
