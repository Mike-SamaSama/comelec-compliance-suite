
import { type NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return new NextResponse(JSON.stringify({ error: 'ID token is required' }), { status: 400 });
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
    // Create the session cookie. This will also verify the ID token.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    // Set cookie policy for session cookie.
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      path: '/',
    };

    const response = new NextResponse(JSON.stringify({ status: 'success' }), {
      status: 200,
    });

    response.cookies.set(options);

    return response;

  } catch (error: any) {
    console.error('Error creating session cookie:', error);
    // Handle the specific server authentication error gracefully
     if (error.message.includes('fetch a valid Google OAuth2 access token')) {
        return new NextResponse(
            JSON.stringify({ error: "Server authentication error. Could not create user session. Please contact support." }),
            { status: 500 }
        );
    }
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create session.' }),
      { status: 401 }
    );
  }
}
