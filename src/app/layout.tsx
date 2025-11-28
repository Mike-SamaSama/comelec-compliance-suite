import type { Metadata } from 'next';
import { Poppins, PT_Sans } from 'next/font/google';
// ✅ FIX: Import the AuthProvider from your central firebase file
import AuthProvider from '@/firebase'; 
import './globals.css';
import { cn } from '@/lib/utils';

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-headline',
  display: 'swap',
});

const fontPTSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'COMELEC Compliance Suite',
  description: 'Streamline and simplify compliance for political parties and organizations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-body antialiased min-h-screen bg-background', fontPoppins.variable, fontPTSans.variable)}>
        {/* This Provider now matches the one used in your Login Page */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}