"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Bot,
  ListChecks,
  FileJson,
  CalendarClock,
  Globe,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const tenantNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/ai-assistant", icon: Bot, label: "AI Assistant" },
  { href: "/ai-drafting", icon: FileJson, label: "AI Drafting" },
];

const tenantAdminNavItems = [
  { href: "/users", icon: Users, label: "User Management" },
  { href: "/settings", icon: Settings, label: "Organization Settings" },
];

const platformAdminNavItems = [
  { href: "/platform/dashboard", icon: Globe, label: "All Tenants" },
  { href: "/platform/checklist", icon: ListChecks, label: "Master Checklist" },
  { href: "/platform/templates", icon: FileJson, label: "Doc Templates" },
  { href: "/platform/deadlines", icon: CalendarClock, label: "Deadlines" },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const navItems =
    profile?.role === "platformAdmin"
      ? platformAdminNavItems
      : [
          ...tenantNavItems,
          ...(profile?.role === "tenantAdmin" ? tenantAdminNavItems : []),
        ];

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
