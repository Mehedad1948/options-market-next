import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth';

export default async function middleware(request: NextRequest) {
  // 1. Check if the user is trying to access a protected route
  // We want to protect anything starting with /dashboard
  const path = request.nextUrl.pathname;
  const isProtectedRoute = path.startsWith('/dashboard');

  // 2. Get the session cookie
  const cookie = request.cookies.get('session')?.value;

  // 3. Verify the session
  // We use verifySession from lib/auth (must use 'jose' library compatible with Edge)
  const session = await verifySession(cookie);

  // 4. Logic:
  // If trying to access dashboard AND not logged in -> Redirect to Login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Optional: If already logged in and trying to access /login -> Redirect to Dashboard
  if (path === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Config matches all routes except static files, images, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
