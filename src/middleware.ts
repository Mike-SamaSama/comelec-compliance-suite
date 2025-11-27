
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is intentionally left empty.
// The app layout provides sufficient authentication protection and handles redirects.
// Keeping this file prevents potential build errors in some Next.js versions
// if the file is completely removed.

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
    matcher: [],
};
