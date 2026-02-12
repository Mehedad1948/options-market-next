import { userDashboardSelect } from '@/types/user';
import { cache } from 'react';
import { getSession, verifySession } from '../auth';
import { prisma } from '../prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cacheLife, cacheTag } from 'next/cache';

export const getUserCache = cache(async (userId: string) => {
  'use cache';
  cacheLife('minutes');
  cacheTag(`user-${userId}`);
  if (!userId) {
    return null;
  }
  console.log('✅✅ I ran to fetch this user', userId);

  const user = await prisma.user.findUnique({
    where: { id: userId as string },
    select: userDashboardSelect,
  });

  if (!user) {
    redirect('/api/auth/clear-session');
  }

  return user;
});

export async function getUser() {
  const session = await getSession();
  console.log('⭕⭕⭕ I Called hte User Fetch', session?.userId);

  return session ? getUserCache(session.userId) : null;
}
