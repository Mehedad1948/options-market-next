import { getSession, logoutUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Toaster } from 'sonner'; 
import StreamListener from './stream-listener';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await getSession();

    // Middleware should catch this, but double safety checks never hurt
    if (!session || !session.userId) redirect('/login');

    // Fetch fresh user data using the ID from the session token
    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        select: {
            id: true,
            notifyWeb: true, // We specifically need this setting
            // Select other fields if you use them in a sidebar/header here
        }
    });

    // Handle case where session exists but user was deleted from DB
    if (!user) redirect('/login');

    async function handleLogout() {
        'use server';
        await logoutUser();
        redirect('/login');
    }

    return (
        <section>
            {/* 1. The Real-Time Listener: Handles data stream & notifications */}
            <StreamListener settings={{ notifyWeb: user.notifyWeb }} />

            {/* 2. The Toast Provider: Renders the actual popup bubbles */}
            <Toaster position="top-center" richColors closeButton />

            {/* 3. Main Content */}
            {children}
        </section>
    );
}
