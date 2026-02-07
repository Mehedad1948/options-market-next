// app/api/auth/clear-session/route.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // 1. Delete the cookie (This works here because it's a Route Handler)
  (await cookies()).delete('session'); // Make sure this matches your actual cookie name

  redirect('/login');
}
