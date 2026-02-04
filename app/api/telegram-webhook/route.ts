// app/api/telegram-webhook/route.ts
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// Helper to send messages back to Telegram
async function sendMessage(chatId: string | number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown', // Allows bolding text
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate if it's a message
    if (!body.message || !body.message.text) {
      return NextResponse.json({ ok: true }); // Acknowledge generic updates
    }

    const { text, chat, from } = body.message;
    const telegramId = from.id.toString(); // Store as String to match Schema
    const firstName = from.first_name || 'Trader';

    // 2. Handle "/start" command
    if (text === '/start') {
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { telegramId: telegramId },
      });

      if (existingUser) {
        // SCENARIO A: Existing User
        const expiryDate = existingUser.subscriptionExpiresAt 
          ? new Date(existingUser.subscriptionExpiresAt).toLocaleDateString('fa-IR') 
          : 'Expired';
          
        await sendMessage(
          chat.id,
          `Welcome back, ${firstName}! 👋\n\nYou are already registered.\nSubscription Status: *${expiryDate}*`
        );
      } else {
        // SCENARIO B: New User -> Grant 2 Weeks Free
        const twoWeeksLater = new Date();
        twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

        await prisma.user.create({
          data: {
            telegramId: telegramId,
            firstName: firstName,
            role: 'USER',
            notifyTelegram: true, // Default ON
            notifyWeb: true,      // Default ON
            subscriptionExpiresAt: twoWeeksLater, // 14 Day Trial
          },
        });

        const expiryStr = twoWeeksLater.toLocaleDateString('fa-IR');

        await sendMessage(
          chat.id,
          `Welcome to Taleb Signals, ${firstName}! 🚀\n\n🎉 **Account Created!**\nWe have gifted you a **14-day Free Trial**.\n\nYour subscription is active until: *${expiryStr}*\n\nYou will now receive market alerts automatically.`
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
