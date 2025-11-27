import 'dotenv/config';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './src/lib/firebase/server';

// This file MUST be in the root of the project.
// This line is CRITICAL. It tells Next.js to run this middleware in a Node.js environment,
// which is required for the Firebase Admin SDK.
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  // 1. If there's no session cookie and the user is trying to access a protected page,
  //    redirect them to the login page.
  if (!session && request.nextUrl.pathname.startsWith('/app')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If there is a session cookie, try to verify it.
  if (session) {
    try {
      // Verify the session cookie. `checkRevoked` is false for performance.
      await adminAuth.verifySessionCookie(session, false);
      
      // If the user is authenticated and tries to access login/signup, redirect to dashboard.
      if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

    } catch (error) {
      // Session cookie is invalid. Clear it and redirect to login.
      // This handles expired cookies, revoked sessions, etc.
      console.error('Error in middleware (session invalid):', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // 3. If none of the above, continue to the requested path.
  return NextResponse.next();
}

export const config = {
  // This matcher ensures the middleware runs on all paths except for static assets,
  // api routes, and the Next.js internal paths.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
