'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Gavel, 
  LayoutDashboard, 
  FileText, 
  BotMessageSquare, 
  Shield, 
  User, 
  Calendar, 
  FolderKanban,
  Users,
  LogOut,
  LogIn
} from 'lucide-react';
// FIX: We must rely on standard Tailwind classes if cn is failing.
// We remove the cn import to prevent a crash, assuming utility classes are available.
// import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase'; 

// Helper function placeholder for cn (if you have styling issues, you need to create src/lib/utils.ts)
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { href: '/calendar', label: 'Calendar', icon: Calendar, adminOnly: false },
  { href: '/documents', label: 'Documents', icon: FolderKanban, adminOnly: false },
  { href: '/ai-drafting', label: 'AI Drafter', icon: FileText, adminOnly: false },
  { href: '/q-and-a', label: 'AI Legal Q&A', icon: BotMessageSquare, adminOnly: false },
  
  // --- ADMIN LINKS ---
  { href: '/admin', label: 'Admin Console', icon: Shield, adminOnly: true },
  { href: '/admin/users', label: 'Management', icon: Users, adminOnly: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useUser();

  // For testing, we allow guest users to see admin links.
  // In a real app, this would be an admin check: const isAdmin = user?.role === 'admin';
  const isAdmin = true; 

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-900 text-white flex-shrink-0">
      {/* Sidebar Header */}
      <div className="flex h-16 items-center border-b border-gray-800 px-6">
        <Gavel className="mr-2 h-6 w-6 text-blue-500" />
        <span className="text-lg font-bold">COMELEC Suite</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-gray-800 p-4">
        {user ? (
          <div className="space-y-4">
            <Link href="/profile" className="flex items-center text-sm font-medium text-gray-300 hover:text-white">
              <User className="mr-3 h-5 w-5" />
              My Profile
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start px-0 text-gray-400 hover:text-white hover:bg-transparent"
              onClick={() => signOut()}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
              <LogIn className="mr-3 h-5 w-5" />
              Login
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}