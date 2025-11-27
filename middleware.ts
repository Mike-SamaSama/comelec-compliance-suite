import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './src/lib/firebase/server';

async function addAuthHeader(request: NextRequest, token: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Authorization', `Bearer ${token}`);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) {
    return NextResponse.next();
  }

  try {
    // This is the ONLY thing middleware should do: verify the session cookie.
    // It should NOT be signing in users or using client-side SDKs.
    const decodedIdToken = await adminAuth.verifySessionCookie(session, true);
    
    // The session is valid. The Authorization header is now set on all requests.
    // Server Actions can now read this header to get the user's identity.
    return await addAuthHeader(request, await adminAuth.createCustomToken(decodedIdToken.uid));

  } catch (error) {
    console.error('Error in middleware:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  // This matcher ensures the middleware runs on all paths except for static assets
  // and the Next.js internal paths.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
