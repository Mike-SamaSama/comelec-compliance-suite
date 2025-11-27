import { type NextRequest, NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase/server';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    const { auth } = getAdminApp();
    await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    return new NextResponse(JSON.stringify({ status: 'OK' }), {
      status: 200,
    });
  } catch (error) {
    console.error('API session verification error:', error);
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }
}
