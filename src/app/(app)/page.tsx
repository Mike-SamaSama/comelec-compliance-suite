'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2, User, FileText, BotMessageSquare, Package } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PhaseTracker from '@/components/dashboard/phase-tracker';
import { useUser } from '@/firebase';
import { useSubmissionStatus } from '@/hooks/use-submission-status';

const quickLinks = [
  {
    href: '/ai-drafting',
    label: 'AI Smart Drafter',
    description: 'Generate document drafts.',
    icon: FileText,
  },
  {
    href: '/q-and-a',
    label: 'AI Legal Q&A',
    description: 'Ask legal questions.',
    icon: BotMessageSquare,
  },
  {
    href: '/packaging',
    label: 'Package Assembler',
    description: 'Prepare for submission.',
    icon: Package,
  },
];

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useUser();
  const { checklistItems, isLoading: isChecklistLoading } = useSubmissionStatus();
  const [forceShow, setForceShow] = useState(false);

  // Automatic fail-safe: Force show after 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthLoading || isChecklistLoading) {
        console.warn("Loading slow. Auto-forcing display.");
        setForceShow(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isAuthLoading, isChecklistLoading]);

  // Determine if we should show the loading screen
  const shouldShowLoading = (isAuthLoading || isChecklistLoading) && !forceShow;

  if (shouldShowLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <div className="text-center space-y-2">
            <p className="text-sm text-gray-500 animate-pulse">
                {isAuthLoading ? "Verifying identity..." : "Loading workspace data..."}
            </p>
            {/* ✅ MANUAL OVERRIDE BUTTON */}
            <button 
                onClick={() => setForceShow(true)} 
                className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
            >
                Stuck? Click here to skip loading.
            </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 pt-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.displayName || user?.email || 'User'}. Here is your project overview.
            </p>
          </div>
          <Link href="/profile" passHref>
            <Button>
              <User className="mr-2 h-4 w-4" /> Profile
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Submission Progress</CardTitle>
              <CardDescription>
                Track your progress through the party-list registration phases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhaseTracker checklistItems={checklistItems} />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {quickLinks.map((link) => (
                  <Link href={link.href} key={link.href} passHref>
                    <div className="flex items-start gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50 cursor-pointer">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <link.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{link.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}