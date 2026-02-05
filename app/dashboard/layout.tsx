import { getSession, logoutUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Toaster } from 'sonner';
import StreamListener from './stream-listener';
import { Suspense } from 'react';
import { getUser } from '@/lib/services/getUser';

export default async function Layout({ children }: { children: React.ReactNode }) {

    const user = getUser()

    if (!user) redirect('/login');

    async function handleLogout() {
        'use server';
        await logoutUser();
        redirect('/login');
    }

    return (
        <section>
            {/* 1. The Real-Time Listener: Handles data stream & notifications */}
            <Suspense>

            <StreamListener  />
            </Suspense>

            {/* 2. The Toast Provider: Renders the actual popup bubbles */}
            <Toaster position="top-center" richColors closeButton />

            {/* 3. Main Content */}
            <Suspense>
                {children}
            </Suspense>
        </section>
    );
}
