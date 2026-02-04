import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to clean phone numbers (e.g. 0912 -> +98912)
function normalizePhone(phone: string) {
  let clean = phone.replace(/\D/g, ''); // remove all non-digits
  if (clean.startsWith('09')) {
    clean = '98' + clean.substring(1);
  }
  return '+' + clean;
}

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'شماره موبایل الزامی است' }, { status: 400 });
    }

    const cleanPhone = normalizePhone(phoneNumber);

    // 1. Find the user
    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone },
    });

    // 2. STRICT CHECK: User must exist AND have a telegramId
    // If not found, return 404 to trigger the "Go to Bot" UI
    if (!user || !user.telegramId) {
      return NextResponse.json({
        message: 'حساب کاربری یافت نشد. لطفا ابتدا در ربات تلگرام ثبت نام کنید.',
        identifier: cleanPhone
      }, { status: 404 });
    }

    // 3. Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // 4. Save OTP to DB
    await prisma.otp.create({
      data: {
        code,
        identifier: cleanPhone,
        type: 'TELEGRAM',
        expiresAt,
        userId: user.id,
      },
    });

    // 5. Send via Telegram Bot
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
       return NextResponse.json({ error: 'خطای تنظیمات سرور (Bot Token)' }, { status: 500 });
    }

    const text = `🔐 *کد ورود به داشبورد*\n\nکد: \`${code}\`\n\nاین کد تا ۵ دقیقه معتبر است.`;

    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user.telegramId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    if (!telegramRes.ok) {
       console.error('Telegram Send Error:', await telegramRes.text());
       return NextResponse.json({ error: 'خطا در ارسال پیام به تلگرام' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      identifier: cleanPhone,
      message: 'کد به تلگرام شما ارسال شد'
    });

  } catch (error) {
    console.error('Auth Error:', error);
    return NextResponse.json({ error: 'خطای سیستمی' }, { status: 500 });
  }
}
