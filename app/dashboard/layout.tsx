import { getUser } from '@/lib/services/getUser';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import StreamListener from './stream-listener';

export default async function Layout({ children }: { children: React.ReactNode }) {

    const user = getUser()

    if (!user) redirect('/login');

  

    return (
        <section>
            {/* 1. The Real-Time Listener: Handles data stream & notifications */}
            <Suspense>

            <StreamListener  />
            </Suspense>

            {/* 2. The Toast Provider: Renders the actual popup bubbles */}
      

            {/* 3. Main Content */}
            <Suspense>
                {children}
            </Suspense>
        </section>
    );
}
