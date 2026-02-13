import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Parse the incoming JSON payload (chat_id, text, etc.)
    const body = await req.json();

    // 2. Get the Bot Token from environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json(
        { ok: false, description: 'Telegram Bot Token is not configured on the server.' },
        { status: 500 }
      );
    }

    // 3. Proxy the request to Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 4. Parse Telegram's response
    const telegramData = await telegramResponse.json();

    // 5. Return the exact response from Telegram back to your client
    return NextResponse.json(telegramData, { status: telegramResponse.status });

  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json(
      { ok: false, description: 'Failed to proxy request to Telegram' },
      { status: 500 }
    );
  }
}
