import Link from "next/link";
import { Gavel } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-foreground">
                <Gavel className="w-8 h-8 text-primary" />
                <span className="text-2xl font-semibold font-headline">COMELEC Compliance Suite</span>
            </Link>
        </div>
        <div className="bg-card p-8 rounded-lg shadow-sm border">
            {children}
        </div>
      </div>
    </div>
  );
}
