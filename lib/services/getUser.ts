import { userDashboardSelect } from '@/types/user';
import { cache } from 'react';
import { getSession } from '../auth';
import { prisma } from '../prisma';
import { redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';

// --------------------------------------------------------------------------
// LAYER 1: The Database Fetcher
// This code ONLY runs if the Data Cache is missing or stale (Time-To-Live expired).
// --------------------------------------------------------------------------
async function fetchUserFromDb(userId: string) {
  // RED LOG: Indicates a slow/expensive DB operation
  console.log(`\x1b[31m🔥 [LAYER 1: DB] Cache MISS. Hitting Prisma for user: ${userId}\x1b[0m`);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userDashboardSelect,
  });



  return user;
}

// --------------------------------------------------------------------------
// LAYER 2: The Data Cache (Next.js unstable_cache)
// This layer persists data across DIFFERENT requests (stored in FS or Redis).
// --------------------------------------------------------------------------
async function getUserDataCache(userId: string) {
  // YELLOW LOG: Indicates we are asking Next.js for cached data
  console.log(`\x1b[33m📦 [LAYER 2: DATA CACHE] Initializing unstable_cache for: ${userId}\x1b[0m`);

  // We use the wrapper pattern here to safely inject 'userId' into tags
  const cachedFn = unstable_cache(
    async () => fetchUserFromDb(userId),
    [`user-dashboard-data-${userId}`], // 1. Unique Key Parts
    {
      tags: [`user-${userId}`],        // 2. Dynamic Tags (for manual revalidation)
      revalidate: 300                  // 3. Auto revalidate every 5 minutes
    }
  );

  return cachedFn();
}

// --------------------------------------------------------------------------
// LAYER 3: Request Memoization (React cache)
// This layer deduplicates calls within a SINGLE user request.
// --------------------------------------------------------------------------
export const getUser = cache(async () => {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  // CYAN LOG: This runs every time you call getUser() in your components.
  // If you see 3 of these logs but only 1 YELLOW/RED log, Memoization is working.
  console.log(`\x1b[36m⚡ [LAYER 3: MEMO] getUser() called for: ${session.userId}\x1b[0m`);

  return getUserDataCache(session.userId);
});
