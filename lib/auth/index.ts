/* eslint-disable @typescript-eslint/no-explicit-any */
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// 1. Define Secret Key
const SECRET_KEY = process.env.JWT_SECRET || "your-super-secret-random-key-change-me";
const key = new TextEncoder().encode(SECRET_KEY);

// 2. Define Session Payload Interface
interface SessionPayload {
  userId: string;
  telegramId: string;
  expiresAt: Date;
}

// --- Encryption / Decryption ---

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token valid for 7 days
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

// --- Auth Actions ---

/**
 * Creates a JWT session and sets it in an HTTP-Only cookie.
 * Used in API routes (e.g., verify-otp).
 */
export async function loginUser(userId: string, telegramId: string) {
  // 1. Create Session Data
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days
  const session = await encrypt({ userId, telegramId, expiresAt: expires });

  // 2. Set Cookie
  // Note: In Next.js 15, cookies() is async. We await it to be safe across versions.
  const cookieStore = await cookies(); 
  
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Clears the session cookie.
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0) });
}

/**
 * Retrieves user data from the cookie.
 * Used in Server Components and Middleware.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}
