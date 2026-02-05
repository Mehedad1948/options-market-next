'use client';

import { DashboardUser } from '@/types/user';
import { createContext, use, ReactNode } from 'react';



// The Context will hold the Promise itself
const UserContext = createContext<Promise<DashboardUser | null> | null>(null);

interface UserProviderProps {
  children: ReactNode;
  // We explicitly type this as a Promise
  userPromise: Promise<DashboardUser | null> | null;
}

export function UserProvider({ children, userPromise }: UserProviderProps) {
  return (
    <UserContext.Provider value={userPromise}>
      {children}
    </UserContext.Provider>
  );
}

// Custom Hook to consume the user data
export function useUser() {
  const userPromise = use(UserContext);

  if (userPromise === null) {
    throw new Error('useUser must be used within a UserProvider');
  }

  // The 'use' hook unwraps the promise. 
  // If the promise is pending, this will SUSPEND the component.
  return use(userPromise);
}
