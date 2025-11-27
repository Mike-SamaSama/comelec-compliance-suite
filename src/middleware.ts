
import { NextResponse, type NextRequest } from 'next/server';

// This file is intentionally simple and contains no server-side imports.
// It runs in the Edge Runtime and is not suitable for server-side logic like verifying tokens.

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  
  const publicPaths = ['/login', '/signup', '/privacy-policy', '/terms-of-service', '/'];

  const isPublicPath =
    publicPaths.some((path) => request.nextUrl.pathname === path) ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/api/'); // Allow all api routes through middleware

  if (isPublicPath) {
    // If user has a session and tries to go to login/signup, redirect to dashboard
    if (sessionCookie && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // For protected paths, if there's no session cookie, redirect to login
  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If there is a session cookie, let the request proceed.
  // The actual verification of the token will happen in the AuthProvider on the client
  // and/or in protected API routes on the server.
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
