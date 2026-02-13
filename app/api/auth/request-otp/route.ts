import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Kavenegar from 'kavenegar';

// Initialize Kavenegar
const kavenegarApi = Kavenegar.KavenegarApi({
  apikey: process.env.KAVENEGAR_API_KEY || '',
});

function normalizePhone(phone: string) {
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('09')) {
    clean = '98' + clean.substring(1);
  }
  return '+' + clean;
}

// SMS Sender Helper
function sendSmsOtp(mobile: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    kavenegarApi.VerifyLookup(
      {
        receptor: mobile,
        token: code,
        template: 'verify',
      },
      (response, status) => {
        if (status === 200) resolve();
        else {
          console.error('Kavenegar Error:', status, response);
          reject(new Error('SMS Failed'));
        }
      },
    );
  });
}

export async function POST(request: Request) {
  try {
    const { phoneNumber, method = 'telegram' } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'شماره موبایل الزامی است' },
        { status: 400 },
      );
    }

    const cleanPhone = normalizePhone(phoneNumber);

    // 1. Try to find the user
    let user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone },
    });

    // 2. Handle User Creation Logic
    if (!user) {
      if (method === 'sms') {
        // AUTO-REGISTER: Create user if method is SMS
        try {
          user = await prisma.user.create({
            data: {
              phoneNumber: cleanPhone,
              role: 'USER', // Default role
              // telegramId is left null, they can link it later
            },
          });
        } catch (dbError) {
          console.error('User Creation Error:', dbError);
          return NextResponse.json(
            { error: 'خطا در ایجاد حساب کاربری' },
            { status: 500 },
          );
        }
      } else {
        // CANNOT REGISTER VIA TELEGRAM WEB: We don't have their Chat ID yet
        return NextResponse.json(
          {
            message:
              'حساب کاربری یافت نشد. لطفا برای اولین ورود از گزینه "پیامک" استفاده کنید.',
            error: 'USER_NOT_FOUND',
            identifier: cleanPhone,
          },
          { status: 404 },
        );
      }
    }

    // 3. Validation for Telegram Method
    // If user exists (or was just created via SMS logic above) but tries to use Telegram without an ID
    if (method === 'telegram' && !user.telegramId) {
      return NextResponse.json(
        {
          message:
            'برای دریافت کد تلگرامی، ابتدا باید ربات را استارت کنید تا حساب شما متصل شود.',
          identifier: cleanPhone,
        },
        { status: 404 },
      );
    }

    // 4. Generate Code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // 5. Save OTP
    await prisma.otp.create({
      data: {
        code,
        identifier: cleanPhone,
        type: method === 'sms' ? 'SMS' : 'TELEGRAM',
        expiresAt,
        userId: user.id,
      },
    });

    // 6. Send Code
    if (method === 'sms') {
      await sendSmsOtp(cleanPhone, code);
      return NextResponse.json({
        success: true,
        identifier: cleanPhone,
        message: 'کد تایید پیامک شد (حساب کاربری ایجاد شد)',
      });
    } else {
      // Telegram Logic
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const text = `🔐 *کد ورود به داشبورد*\n\nکد: \`${code}\`\n\nاین کد تا ۲ دقیقه معتبر است.`;
      console.log('👋👋👋', botToken);

      if (user.telegramId) {
        await fetch(`${process.env.PROXY_BASE_URL}/telegram/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.telegramId,
            text: text,
            parse_mode: 'Markdown',
          }),
        });
      }

      return NextResponse.json({
        success: true,
        identifier: cleanPhone,
        message: 'کد به تلگرام ارسال شد',
      });
    }
  } catch (error) {
    console.error('Auth Error:', error);
    return NextResponse.json({ error: 'خطای سیستمی' }, { status: 500 });
  }
}
