'use server'

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const secretKey = process.env.JWT_SECRET || 'your-secret-key-change-this';
const key = new TextEncoder().encode(secretKey);

export async function loginUser(userId: string, telegramId: string) {
  // Create the session data
  const payload = {
    userId,
    telegramId,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  }; // 1 week

  // Sign the token
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);

  // Set the HTTP-only cookie
  (await cookies()).set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await verifySession(session);
}

// THIS FUNCTION IS CRITICAL FOR MIDDLEWARE
export async function verifySession(token: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function logoutAction() {
  // 1. Delete the session cookie
  (await cookies()).delete('session');

  // 2. Redirect to login page
  redirect('/login');
}
