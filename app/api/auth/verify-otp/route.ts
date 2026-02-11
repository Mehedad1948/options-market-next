import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { identifier, code } = await request.json();

    const otpRecord = await prisma.otp.findFirst({
      where: {
        identifier,
        code,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!otpRecord || !otpRecord.userId) {
      return NextResponse.json({ error: 'کد وارد شده اشتباه یا منقضی شده است' }, { status: 400 });
    }

    // Clean up
    await prisma.otp.deleteMany({ where: { identifier } });

    // Session Creation
    // Note: If user login via SMS but has no telegramId, ensure loginUser handles null telegramId gracefully
    await loginUser(otpRecord.userId, otpRecord?.user?.telegramId || 'sms-user'); 

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Verify Error:', error);
    return NextResponse.json({ error: 'خطای سیستمی' }, { status: 500 });
  }
}