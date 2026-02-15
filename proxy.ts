import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth';

// 1. Define allowed origins
const ALLOWED_ORIGINS = [
  'https://opyar.ir',
  'http://localhost:3000', // Useful for local development
  'chrome-extension://fpchhgnhlobeadpjggcmmeigkaicfmdn' // <--- 🔴 REPLACE THIS WITH YOUR ACTUAL ID
];

export default async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const path = request.nextUrl.pathname;

  // ----------------------------------------------------------------
  // 🟢 PART 1: CORS HANDLING
  // ----------------------------------------------------------------
  
  // Prepare headers
  const headers = new Headers();
  
  // If the origin is in our allowed list, set CORS headers
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  // Handle Preflight Requests (OPTIONS)
  // Browsers send this first to check if they are allowed to connect.
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }

  // ----------------------------------------------------------------
  // 🟢 PART 2: AUTHENTICATION LOGIC
  // ----------------------------------------------------------------

  const isProtectedRoute = path.startsWith('/dashboard');
  const cookie = request.cookies.get('session')?.value;
  const session = await verifySession(cookie);

  // Initialize the response variable
  let response = NextResponse.next();

  // Logic: Redirect to Login if accessing protected route without session
  if (isProtectedRoute && !session) {
    response = NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Logic: Redirect to Dashboard if accessing login while already logged in
  else if (path === '/login' && session) {
    response = NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ----------------------------------------------------------------
  // 🟢 PART 3: APPLY CORS HEADERS TO FINAL RESPONSE
  // ----------------------------------------------------------------
  
  // We must copy the CORS headers we prepared in Part 1 to the final response
  headers.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

// ----------------------------------------------------------------
// 🟢 PART 4: MATCHER CONFIGURATION
// ----------------------------------------------------------------

export const config = {
  matcher: [
    // ⚠️ IMPORTANT: You previously excluded 'api'. 
    // If your extension calls '/api/...', you MUST allow the middleware to run on it.
    // I removed 'api' from the exclusion list below:
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
