import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(req: Request) {
  try {
    const update = await req.json();

    if (update.message) {
      const chatId = update.message.chat.id.toString();
      const text = update.message.text;
      const contact = update.message.contact;
      const firstName = update.message.from?.first_name || "";

      // ---------------------------------------------------------
      // 1. HANDLE "/start" (Lightweight Registration)
      // ---------------------------------------------------------
      if (text === "/start") {
        // Create user if not exists, but DON'T ask for phone yet
        await prisma.user.upsert({
          where: { telegramId: chatId },
          update: {}, // No changes if exists
          create: {
            telegramId: chatId,
            firstName: firstName,
            // 14 Days Free Trial
            subscriptionExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 
          },
        });

        await sendMainMenu(chatId, `سلام ${firstName} خوش آمدید! 👋\n\nشما می‌توانید از سیگنال‌ها استفاده کنید.\nبرای ورود به پنل تحت وب، دکمه "🔐 فعال‌سازی داشبورد" را بزنید.`);
      }

      // ---------------------------------------------------------
      // 2. HANDLE DASHBOARD REQUEST (Ask for Phone)
      // ---------------------------------------------------------
      else if (text === "🔐 فعال‌سازی داشبورد" || text === "/login") {
        await requestContact(chatId);
      }

      // ---------------------------------------------------------
      // 3. HANDLE CONTACT SHARING (Update DB)
      // ---------------------------------------------------------
      else if (contact) {
        // Normalize phone: remove '+' and ensure it's clean
        const phone = contact.phone_number.replace("+", "").replace(/\s/g, "");
        
        // Update the user associated with this Telegram ID
        await prisma.user.update({
          where: { telegramId: chatId },
          data: { phoneNumber: phone },
        });

        await sendMainMenu(chatId, "✅ شماره شما ثبت شد.\n\nاکنون می‌توانید با همین شماره موبایل در سایت وارد شوید.");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ ok: false });
  }
}

// --- Helpers ---

async function sendMainMenu(chatId: string, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  // A persistent menu at the bottom
  const keyboard = {
    keyboard: [
      [{ text: "🔐 فعال‌سازی داشبورد" }], // This triggers step 2
      [{ text: "📊 وضعیت بازار" }]
    ],
    resize_keyboard: true,
  };

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: keyboard }),
  });
}

async function requestContact(chatId: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  // Special button that asks for phone number permission
  const keyboard = {
    keyboard: [
      [
        {
          text: "📱 تایید شماره و فعال‌سازی",
          request_contact: true, 
        },
      ],
      [{ text: "🔙 بازگشت" }]
    ],
    resize_keyboard: true,
    one_time_keyboard: true, // Hide after clicking
  };

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "⚠️ برای ورود به پنل وب، ما نیاز به تایید هویت شما داریم.\n\nلطفا روی دکمه زیر کلیک کنید تا شماره شما تایید شود.",
      reply_markup: keyboard,
    }),
  });
}
