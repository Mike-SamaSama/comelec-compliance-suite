
import { NextResponse, type NextRequest } from 'next/server';

// This file is processed by the edge runtime, so we cannot use Node.js modules.
// We only check for the presence of the session cookie and handle redirects.
// The actual verification of the cookie happens on API routes or server components.

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  
  // Define paths that do not require authentication
  const publicPaths = ['/login', '/signup', '/privacy-policy', '/terms-of-service', '/'];

  const isPublicPath =
    publicPaths.some((path) => request.nextUrl.pathname === path) ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/api/auth/'); // Public auth API routes

  // If it's a public path, let the request through.
  if (isPublicPath) {
    // Special case: If a logged-in user tries to visit login/signup, redirect them to the dashboard.
    if (sessionCookie && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // If it's a protected path and there's no session cookie, redirect to login.
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If a session cookie exists, let the request proceed. 
  // The actual verification of the session will be handled by the page or layout components
  // or on the API routes that are called.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
