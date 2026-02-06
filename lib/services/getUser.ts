import { cache } from 'react';
import { prisma } from '../prisma';
import { getSession } from '../auth';
import { userDashboardSelect } from '@/types/user';
import { cacheTag } from 'next/cache';

export const getUser = cache(async () => {
  const session = await getSession();
  if (!session) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: userDashboardSelect,
  });

  return user;
});
