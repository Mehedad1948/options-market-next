// app/profile/page.tsx
import React from 'react';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileForm from './profile-form';

// Prevent multiple prisma instances in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function ProfilePage() {
  // 1. Authenticate
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get("session")?.value);

  if (!session?.userId) {
    redirect('/login');
  }

  // 2. Fetch User Data AND Payments
  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: {
      firstName: true,
      lastName: true,
      phoneNumber: true,
      telegramId: true,
      role: true,
      subscriptionExpiresAt: true,
      notifyTelegram: true,
      notifyWeb: true,
      // Assuming your relation is named 'payments' in schema.prisma
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 20 // Limit to last 10 payments
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  // 3. Serialize Data
  const serializedUser = {
    ...user,
    telegramId: user.telegramId ? user.telegramId.toString() : null,
    // We map payments to ensure simple types are passed to client
    payments: user.payments.map(p => ({
      ...p,
      amount: Number(p.amount), // Ensure number
      createdAt: p.createdAt.toISOString(), // Convert Date to String
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      
      {/* Header Background */}
      <div className="bg-slate-900 text-white pt-20 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px]" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <h1 className="text-3xl font-bold mb-2">حساب کاربری</h1>
          <p className="text-slate-400">مدیریت اطلاعات شخصی و تراکنش‌ها</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-4xl px-4 -mt-10 relative z-20">
        <ProfileForm user={serializedUser} />
      </div>

    </div>
  );
}
