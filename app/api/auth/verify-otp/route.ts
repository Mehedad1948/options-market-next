import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { identifier, code } = await request.json();

    // 1. Find Valid OTP
    const otpRecord = await prisma.otp.findFirst({
      where: {
        identifier,
        code,
        expiresAt: { gt: new Date() }, // Must not be expired
      },
      include: { user: true },
    });

    if (!otpRecord || !otpRecord.userId || !otpRecord?.user?.telegramId) {
      return NextResponse.json({ error: 'کد وارد شده اشتباه یا منقضی شده است' }, { status: 400 });
    }

    // 2. Clean up used OTPs
    await prisma.otp.deleteMany({
      where: { identifier },
    });


    // 3. Create Session (Cookie)
    await loginUser(otpRecord.userId, otpRecord.user.telegramId!);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Verify Error:', error);
    return NextResponse.json({ error: 'خطای سیستمی' }, { status: 500 });
  }
}
