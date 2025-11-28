'use client';

import { AppSidebar } from '@/components/app-sidebar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // 🔓 DEV MODE: Security check disabled.
  // We are bypassing the authentication check so you can access the tools
  // (Chatbot & Drafter) immediately without getting stuck on the login screen.

  return (
    <div className="flex min-h-screen w-full bg-gray-50/50 text-gray-900">
      {/* The Sidebar lives here */}
      <AppSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}