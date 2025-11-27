import { NextResponse, type NextRequest } from 'next/server';

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

  // If there's no session cookie
  if (!sessionCookie) {
    // If the path is protected, redirect to login
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Otherwise, allow access to public paths
    return NextResponse.next();
  }

  // If there is a session cookie, verify it by calling our new API route
  const response = await fetch(new URL('/api/auth/session', request.url), {
    headers: {
      Cookie: `session=${sessionCookie}`,
    },
  });

  // If the session is not valid, redirect to login
  if (response.status !== 200) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }
  
  // If user is authenticated and tries to go to login/signup, redirect to dashboard
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
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
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
