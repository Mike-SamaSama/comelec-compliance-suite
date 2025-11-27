"use client";

import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Gavel, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import SidebarNav from "./sidebar-nav";
import { UserNav } from "./user-nav";
import { Separator } from "../ui/separator";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-8 h-8 text-primary" />
            <div className="flex flex-col">
              <h2 className="font-semibold text-lg font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                COMELEC Suite
              </h2>
               <p className="text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                {profile?.organizationName}
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <Separator className="mb-2" />
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                {/* We can add breadcrumbs or page titles here */}
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
