import { getSession, logoutUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await getSession();

    // Middleware should catch this, but double safety checks never hurt
    if (!session) redirect('/login');

    // Fetch fresh user data using the ID from the session token
    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
    });

    async function handleLogout() {
        'use server';
        await logoutUser();
        redirect('/login');
    }

    return (
        <section>
            {children}
        </section>
    );
}