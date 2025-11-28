'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense } from 'react';
import { 
  Calendar, 
  FileText, 
  ArrowRight, 
  Users, 
  Database, 
  Activity, 
  ShieldAlert 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Dynamic import for the heavy template manager component we just created
const DraftingTemplatesManager = dynamic(
  () => import('@/components/admin/drafting-templates-manager'),
  { 
    loading: () => <div className="h-64 w-full animate-pulse rounded-md bg-gray-100" />,
    ssr: false 
  }
);

export default function AdminPage() {
  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Console</h1>
        <p className="text-muted-foreground">
          System configuration, content management, and user oversight.
        </p>
      </div>

      {/* System Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">Total Active Users</h3>
            <Users className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">+2 since last week</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">AI Queries Today</h3>
            <Activity className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">142</div>
          <p className="text-xs text-muted-foreground">98% success rate</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">System Status</h3>
            <ShieldAlert className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">Healthy</div>
          <p className="text-xs text-muted-foreground">All systems operational</p>
        </div>
      </div>

      {/* Main Management Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        
        {/* Card 1: Compliance Calendar Manager */}
        <div className="rounded-xl border bg-white p-6 shadow-sm hover:border-blue-300 transition-colors">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Compliance Calendar</h2>
              <p className="text-sm text-muted-foreground">Manage deadlines & hearings</p>
            </div>
          </div>
          <p className="mb-6 text-sm text-gray-600">
            Add new COMELEC hearing dates, update filing deadlines, and trigger compliance alerts for users.
          </p>
          <Link href="/admin/calendar">
            <Button className="w-full gap-2">
              Manage Deadlines <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Card 2: AI Drafter Configuration */}
        <div className="rounded-xl border bg-white p-6 shadow-sm hover:border-blue-300 transition-colors">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Drafter Config</h2>
              <p className="text-sm text-muted-foreground">Templates & Variables</p>
            </div>
          </div>
           <p className="mb-6 text-sm text-gray-600">
            Edit the master templates for legal documents and configure dynamic variables for the AI.
          </p>
          <Button variant="outline" className="w-full" disabled>
            (Configured below)
          </Button>
        </div>

        {/* Card 3: Knowledge Base Manager */}
        <div className="rounded-xl border bg-white p-6 shadow-sm hover:border-blue-300 transition-colors">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Knowledge Base</h2>
              <p className="text-sm text-muted-foreground">Q&A Source Documents</p>
            </div>
          </div>
          <p className="mb-6 text-sm text-gray-600">
            Upload PDFs, resolutions, and legal guidelines used by the AI Legal Assistant to answer questions.
          </p>
          <Link href="/admin/knowledge-base">
            <Button variant="outline" className="w-full">
              Manage Documents
            </Button>
          </Link>
        </div>

        {/* Card 4: User Access Control */}
        <div className="rounded-xl border bg-white p-6 shadow-sm hover:border-blue-300 transition-colors">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">User Access</h2>
              <p className="text-sm text-muted-foreground">Roles & Permissions</p>
            </div>
          </div>
          <p className="mb-6 text-sm text-gray-600">
            View active users, approve new registrations, and manage admin privileges for the suite.
          </p>
          <Link href="/admin/users">
            <Button variant="outline" className="w-full">
              View Users
            </Button>
          </Link>
        </div>

      </div>

      {/* Drafting Manager Section (Full Width) */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Drafting Templates Editor</h2>
              <p className="text-sm text-gray-500">Configure the legal documents the AI can generate.</p>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600">View Logs</Button>
          </div>
        </div>
        
        <Suspense fallback={<div>Loading editor...</div>}>
          <DraftingTemplatesManager />
        </Suspense>
      </div>

    </div>
  );
}