'use server';

import { SessionPayload } from '@/types/user';
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
  console.log('❤️❤️❤️', session);

  if (!session) return null;
  return await verifySession(session);
}

// THIS FUNCTION IS CRITICAL FOR MIDDLEWARE

export async function verifySession(
  token: string | undefined = '',
): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  try {
    // Use the generic parameter <SessionPayload> to type the payload
    const { payload } = await jwtVerify<SessionPayload>(token, key, {
      algorithms: ['HS256'],
    });

    // Now, 'payload' is correctly typed as SessionPayload
    return payload;
  } catch (error) {
    // This could be due to an expired token or an invalid signature
    console.error('Failed to verify session:', error);
    return null;
  }
}

export async function logoutAction() {
  // 1. Delete the session cookie
  (await cookies()).delete('session');

  // 2. Redirect to login page
  redirect('/login');
}
