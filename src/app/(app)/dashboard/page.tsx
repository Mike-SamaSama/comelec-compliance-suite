
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FileText, Users, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { profile } = useAuth();

  const getRoleName = (role?: string) => {
    switch(role) {
      case 'platformAdmin': return 'Platform Administrator';
      case 'tenantAdmin': return 'Tenant Administrator';
      case 'tenantMember': return 'Tenant Member';
      default: return 'User';
    }
  }

  if (profile?.role === 'platformAdmin') {
    return (
        <div className="flex flex-col space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Platform Admin Dashboard</h1>
                <p className="text-lg text-muted-foreground">
                    Welcome, {profile?.displayName || 'Admin'}. You have global oversight.
                </p>
            </div>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-muted-foreground">
                    Total organizations on the platform
                  </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-6 w-6" />
                    Global Management
                  </CardTitle>
                  <CardDescription>
                    Manage global settings for all tenants from the navigation menu.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Use the sidebar to manage the Master Checklist, Document Templates, and global Deadlines.
                  </p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex flex-col space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Welcome, {profile?.displayName || 'User'}!</h1>
        <p className="text-lg text-muted-foreground">
          Here's your compliance overview for <span className="font-semibold text-foreground">{profile?.organizationName}</span>. You are a <span className="font-semibold text-foreground">{getRoleName(profile?.role)}</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <div className="text-green-500">%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85% Complete</div>
            <p className="text-xs text-muted-foreground">
              12 of 14 requirements met
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Uploaded</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/documents" className="hover:underline">View all documents</Link>
            </p>
          </CardContent>
        </Card>
        {profile?.role === 'tenantAdmin' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
               <p className="text-xs text-muted-foreground">
                <Link href="/users" className="hover:underline">Manage your team</Link>
              </p>
            </CardContent>
          </Card>
        )}
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Legal Assistant
          </CardTitle>
          <CardDescription>
            Have questions about COMELEC rules? Ask our AI assistant.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-muted-foreground max-w-prose">
            This powerful tool is trained on COMELEC rules and regulations to provide you with quick and helpful guidance.
          </p>
           <Button asChild>
            <Link href="/ai-assistant">Ask a Question</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
