import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is currently causing a login loop.
// The app layout provides sufficient auth protection.
// This file can be removed or left empty.

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
    matcher: [],
};
