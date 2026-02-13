// app/actions/auth.ts
'use server';

import { prisma } from '@/lib/prisma';
import { loginUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { updateTag } from 'next/cache';

// Define the return type for type safety
type ActionResponse = {
  success?: boolean;
  error?: string;
};

export async function verifyOtpAction(
  identifier: string,
  code: string,
): Promise<ActionResponse> {
  try {
    const otpRecord = await prisma.otp.findFirst({
      where: {
        identifier,
        code,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    console.log('🎄🎄', code, otpRecord, identifier);

    if (!otpRecord || !otpRecord.userId) {
      return { error: 'کد وارد شده اشتباه یا منقضی شده است' };
    }

    // Clean up used OTP
    await prisma.otp.deleteMany({ where: { identifier } });

    // Session Creation
    // This runs on the server, so cookies set by loginUser() are attached to the response automatically
    await loginUser(
      otpRecord.userId,
      otpRecord?.user?.telegramId || 'sms-user',
    );

    // Revalidate data
    updateTag(`user-${otpRecord.userId}`);

    // We return success here.
    // You COULD call redirect() here, but it's often cleaner to let the client handle the redirect
    // after a successful return to avoid "NEXT_REDIRECT" error complexities inside try/catch blocks.
    return { success: true };
  } catch (error) {
    console.error('Verify Action Error:', error);
    return { error: 'خطای سیستمی' };
  }
}
