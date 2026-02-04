import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { NotificationService } from '@/lib/services/telegram';

const prisma = new PrismaClient();

// Helper to standardise phone input (e.g. 0912 -> 98912)
function normalizePhone(input: string): string {
  let phone = input.replace(/\D/g, ""); // Remove non-digits
  if (phone.startsWith("0")) phone = phone.substring(1);
  if (!phone.startsWith("98")) phone = "98" + phone;
  return phone;
}

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: "شماره موبایل الزامی است" }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phoneNumber);

    // 1. Find User by Phone
    const user = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    // 2. Handle Case: User not found OR User exists but hasn't linked phone yet
    if (!user || !user.telegramId) {
      return NextResponse.json({ 
        error: "UserNotFound", 
        message: "این شماره در سیستم ثبت نشده است. لطفا در ربات تلگرام دکمه «فعال‌سازی داشبورد» را بزنید." 
      }, { status: 404 });
    }

    // 3. Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Save OTP to DB
    await prisma.otp.create({
      data: {
        code,
        identifier: normalizedPhone,
        type: "TELEGRAM", // matches your Enum
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        userId: user.id,
      },
    });

    // 5. Send Code via Telegram
    const message = `🔐 *کد ورود به داشبورد:*\n\n\`${code}\`\n\n⚠️ این کد را به کسی ندهید.`;
    await NotificationService.sendTelegram(user.telegramId, message);

    // Return the normalized phone to be used in the next step
    return NextResponse.json({ success: true, identifier: normalizedPhone }); 

  } catch (error) {
    console.error("OTP Request Error:", error);
    return NextResponse.json({ error: "خطا در سرور" }, { status: 500 });
  }
}
