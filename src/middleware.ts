import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// We currently handle authentication security in src/app/(app)/layout.tsx
// This middleware is a placeholder to ensure Next.js builds correctly.

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};