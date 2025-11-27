import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'firebase-auth-token'; // Replace with your actual auth cookie name

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = request.cookies.has(AUTH_COOKIE_NAME);

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAppPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/ai-assistant') ||
    pathname.startsWith('/ai-drafting') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/settings');
  const isPlatformPage = pathname.startsWith('/platform');

  // If user is logged in
  if (hasAuthCookie) {
    // and tries to access login/signup, redirect to dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } 
  // If user is not logged in
  else {
    // and tries to access a protected app or platform page, redirect to login
    if (isAppPage || isPlatformPage) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - root page (/)
     * - static pages
     */
    '/((?!api|_next/static|_next/image|favicon.ico|privacy-policy|terms-of-service|$).*)',
  ],
};
