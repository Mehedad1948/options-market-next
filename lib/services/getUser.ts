import { userDashboardSelect } from '@/types/user';
import { cache } from 'react';
import { getSession } from '../auth';
import { prisma } from '../prisma';

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
