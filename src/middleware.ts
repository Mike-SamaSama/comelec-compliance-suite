
import { NextRequest, NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase/server';

// This line is CRITICAL. It tells Next.js to run this middleware in a Node.js environment,
// which is required for the Firebase Admin SDK.
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  // Define paths that are part of the authentication flow and should be accessible without a session.
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // Define public paths that don't require authentication.
  const publicPaths = ['/', '/terms-of-service', '/privacy-policy'];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  // 1. If there's no session cookie...
  if (!session) {
    // And the user is trying to access a protected page (not a public or auth page),
    // redirect them to the login page.
    if (!isPublicPath && !isAuthPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Otherwise, allow them to proceed (to landing, login, signup, etc.).
    return NextResponse.next();
  }

  // 2. If there IS a session cookie, try to verify it.
  try {
    const { auth: adminAuth } = getAdminApp();
    // Verify the session cookie. `checkRevoked` is true for security.
    await adminAuth.verifySessionCookie(session, true);
    
    // If the user is authenticated and tries to access an authentication page,
    // redirect them to the dashboard.
    if (isAuthPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

  } catch (error) {
    // Session cookie is invalid (expired, revoked, etc.).
    // We need to clear it and redirect to login.
    console.error('Invalid session cookie. Redirecting to login.', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }

  // 3. If the session is valid, continue to the requested path.
  return NextResponse.next();
}

export const config = {
  // This matcher ensures the middleware runs on all paths except for static assets,
  // API routes, and Next.js internal paths.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
