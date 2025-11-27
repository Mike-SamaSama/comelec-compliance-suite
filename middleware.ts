
import { NextRequest, NextResponse } from 'next/server';
import { User, getAuth, signInWithCustomToken } from 'firebase/auth';
import { app } from './src/lib/firebase/client';
import { adminAuth } from './src/lib/firebase/server';

// This function is crucial for passing the user's identity to Server Actions.
async function addAuthHeader(request: NextRequest, user: User) {
  const token = await user.getIdToken();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Authorization', `Bearer ${token}`);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// NOTE: This middleware is called for every request.
// It is used to refresh the user's custom token to ensure that
// the user's identity is available in Server Actions.
export async function middleware(request: NextRequest) {
  // First, check for a session cookie.
  const session = request.cookies.get('session')?.value;
  if (!session) {
    return NextResponse.next();
  }

  try {
    // Validate the session cookie.
    const decodedIdToken = await adminAuth.verifySessionCookie(session, true);
    // The user is authenticated. Create a custom token.
    const customToken = await adminAuth.createCustomToken(decodedIdToken.uid);
    // Use the custom token to sign in on the client-side.
    const userCredential = await signInWithCustomToken(
      getAuth(app),
      customToken
    );
    // Add the user's ID token to the request headers.
    return addAuthHeader(request, userCredential.user);
  } catch (error) {
    console.error('Error in middleware:', error);
    // If the session is invalid, redirect to the login page.
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Clear the session cookie.
    response.cookies.delete('session');
return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
