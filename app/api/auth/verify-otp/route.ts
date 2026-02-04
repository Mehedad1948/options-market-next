import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { loginUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { identifier, code } = await req.json();

    // 1. Find the OTP
    // We look for a valid OTP matching the phone (identifier) that hasn't expired
    const validOtp = await prisma.otp.findFirst({
      where: {
        identifier: identifier,
        code: code,
        expiresAt: { gt: new Date() }, // Not expired
      },
      include: { user: true } // Include user to get ID
    });

    if (!validOtp || !validOtp.user) {
      return NextResponse.json({ error: "کد اشتباه یا منقضی شده است" }, { status: 400 });
    }

    // 2. Cleanup OTPs for this user
    await prisma.otp.deleteMany({ 
        where: { userId: validOtp.userId } 
    });

    // 3. Create Session / Login
    // Assumes loginUser handles cookie setting
    await loginUser(validOtp.user.id, validOtp.user.telegramId || "");

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Verify Error", error);
    return NextResponse.json({ error: "خطا در اعتبارسنجی" }, { status: 500 });
  }
}
