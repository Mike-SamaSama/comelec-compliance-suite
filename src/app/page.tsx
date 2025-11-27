import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Gavel, Bot, FileText, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-card border-b">
        <Link href="#" className="flex items-center justify-center gap-2" prefetch={false}>
          <Gavel className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold font-headline">COMELEC Compliance Suite</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Login
          </Link>
          <Button asChild>
            <Link href="/signup" prefetch={false}>Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    Simplify Your COMELEC Compliance
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our SaaS platform provides the tools your political party or organization needs to streamline compliance with COMELEC regulations, all while ensuring data privacy and security.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/signup" prefetch={false}>
                      Register Your Organization
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <Gavel className="w-48 h-48 lg:w-72 lg:h-72 text-primary/10" strokeWidth={0.5} />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">A Suite of Powerful Tools</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From secure document handling to AI-powered legal assistance, our platform is designed to make compliance effortless.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <div className="grid gap-1 text-center p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold font-headline">Secure Document Management</h3>
                <p className="text-sm text-muted-foreground">Upload, manage, and track all your compliance documents in a secure, isolated environment for your organization.</p>
              </div>
              <div className="grid gap-1 text-center p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold font-headline">AI Legal Assistant</h3>
                <p className="text-sm text-muted-foreground">Get instant answers to your legal questions about COMELEC rules with our integrated AI-powered chat assistant.</p>
              </div>
              <div className="grid gap-1 text-center p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold font-headline">Team & Tenant Management</h3>
                <p className="text-sm text-muted-foreground">Easily invite and manage members of your organization, with clear roles and permissions for Tenant Admins.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 COMELEC Compliance Suite. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/terms-of-service" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="/privacy-policy" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
