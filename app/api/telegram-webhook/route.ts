import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // <--- CHANGE THIS: Import from your shared lib
// Remove: const prisma = new PrismaClient(); 

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(req: Request) {
  try {
    const update = await req.json();

    if (update.message) {
      const chatId = update.message.chat.id.toString();
      const text = update.message.text;
      const contact = update.message.contact;
      const firstName = update.message.from?.first_name || "";

      console.log(`📩 Received message from ${firstName} (${chatId}): ${text}`);

      // ---------------------------------------------------------
      // 1. HANDLE "/start" (Lightweight Registration)
      // ---------------------------------------------------------
      if (text === "/start") {
        console.log("⚡ Processing /start for:", chatId);
        
        try {
          // Attempt DB Write
          const user = await prisma.user.upsert({
            where: { telegramId: chatId },
            update: {}, // If user exists, do nothing
            create: {
              telegramId: chatId,
              firstName: firstName,
              notifyTelegram: true, // Auto-enable telegram notifications
              subscriptionExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 
            },
          });
          console.log("✅ DB Write Success. User ID:", user.id);
        } catch (dbError) {
          console.error("❌ DB Write Failed:", dbError);
          // We continue to send the message even if DB fails, to be polite, 
          // but looking at logs will reveal the issue.
        }

       await sendMainMenu(chatId, `سلام ${firstName} خوش آمدید! 👋

شما می‌توانید از سیگنال‌ها و 📊 وضعیت بازار استفاده کنید.
برای ورود به پنل تحت وب، دکمه "🔐 فعال‌سازی داشبورد" را بزنید.`);
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
        console.log("📱 Received Contact:", contact.phone_number);
        
        // Normalize phone: remove '+' and ensure it's clean
        let phone = contact.phone_number.replace(/\D/g, ""); // Remove non-digits
        if (phone.startsWith("98")) phone = "+" + phone;       // +98912...
        else if (phone.startsWith("0")) phone = "+98" + phone.substring(1); // 0912 -> +98912
        else phone = "+" + phone;

        await prisma.user.update({
          where: { telegramId: chatId },
          data: { phoneNumber: phone },
        });

          const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
    
    // Update 1: Dashboard Link added
    await sendMainMenu(chatId, `✅ شماره شما ثبت شد.

اکنون می‌توانید با همین شماره موبایل در سایت وارد شوید:
🔗 [ورود به داشبورد](${dashboardLink})`);
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
  
  const keyboard = {
    keyboard: [
      [{ text: "🔐 فعال‌سازی داشبورد" }], 
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
    one_time_keyboard: true, 
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
