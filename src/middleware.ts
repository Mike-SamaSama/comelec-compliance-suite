
import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);

  // Define paths that do not require authentication
  const publicPaths = ['/login', '/signup', '/privacy-policy', '/terms-of-service', '/'];

  const isPublicPath =
    publicPaths.some((path) => request.nextUrl.pathname === path) ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/api/'); // Exclude API routes from auth checks here

  if (isPublicPath) {
    // If user is authenticated and tries to go to login/signup, redirect to dashboard
    if (sessionCookie) {
      try {
        await adminAuth.verifySessionCookie(sessionCookie, true);
        if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        // Invalid cookie, let them proceed to public path but clear the cookie
        const response = NextResponse.next();
        response.cookies.delete('session');
        return response;
      }
    }
    return NextResponse.next();
  }

  // If there's no session cookie and it's a protected path, redirect to login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a session cookie, verify it
  try {
    await adminAuth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
  } catch (error) {
    // Session cookie is invalid. Redirect to login and clear the bad cookie.
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }

  // Allow the request to proceed
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * We are NOT excluding /api/ here because we want the middleware to run
     * for most API routes, except for specific public ones handled above.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
