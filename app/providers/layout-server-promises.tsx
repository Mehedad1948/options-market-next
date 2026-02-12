import { ReactNode } from 'react';
import { UserProvider } from './user-context';
import { getSession } from '@/lib/auth';
import { getUser } from '@/lib/services/getUser';

export default async function LayoutServerPromises({
  children,
}: {
  children: ReactNode;
}) {
  const userPromise = getUser();
  return <UserProvider userPromise={userPromise}>{children}</UserProvider>;
}
