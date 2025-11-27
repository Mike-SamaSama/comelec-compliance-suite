"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FileText, Users } from "lucide-react";

export default function DashboardPage() {
  const { profile } = useAuth();

  const getRoleName = (role: string | undefined) => {
    switch(role) {
      case 'platformAdmin': return 'Platform Administrator';
      case 'tenantAdmin': return 'Tenant Administrator';
      case 'tenantMember': return 'Tenant Member';
      default: return 'User';
    }
  }

  return (
    <div className="flex flex-col space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Welcome, {profile?.displayName || 'User'}!</h1>
        <p className="text-lg text-muted-foreground">
          Here's your compliance overview for {profile?.organizationName}. You are logged in as a {getRoleName(profile?.role)}.
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
              Total documents in your repository
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
                Active users in your organization
              </p>
            </CardContent>
          </Card>
        )}
         {profile?.role === 'platformAdmin' && (
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
        <CardContent>
          <p className="text-muted-foreground">
            Navigate to the AI Assistant page to start a conversation. This powerful tool is trained on COMELEC rules and regulations to provide you with quick and helpful guidance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
