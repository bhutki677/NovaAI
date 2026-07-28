import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Login page removed — no auth required for /chat.
// Admin routes still need admin role (checked inside the admin page itself).
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
