// app/api/telegram/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, ""); // Remove trailing slash if present

export async function POST(req: Request) {
  try {
    const update = await req.json();

    // Ensure we have a message object
    if (update.message) {
      const chatId = update.message.chat.id.toString();
      const text = update.message.text;
      const contact = update.message.contact;
      const firstName = update.message.from?.first_name || "کاربر";

      console.log(`📩 Received: ${text} from ${firstName} (${chatId})`);

      // =========================================================
      // 1. HANDLE "/start" (Registration & Welcome)
      // =========================================================
      if (text === "/start") {
        const existingUser = await prisma.user.findUnique({ where: { telegramId: chatId } });
        let messageText = "";

        if (!existingUser) {
          // New User: Create + 14 Days Free
          await prisma.user.create({
            data: {
              telegramId: chatId,
              firstName: firstName,
              notifyTelegram: true,
              subscriptionExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 
            },
          });
          messageText = `سلام ${firstName} عزیز، به ربات آپشن یار خوش آمدید! 👋\n\n🎁 **۱۴ روز اشتراک رایگان** برای شما فعال شد.`;
        } else {
          // Existing User
          messageText = `سلام ${firstName}، خوشحالیم که دوباره شما را می‌بینیم! 👋`;
        }

        await sendMainMenu(chatId, messageText);
      }

      // =========================================================
      // 2. HANDLE DASHBOARD ACCESS (Smart Check)
      // =========================================================
      else if (text === "🔐 فعال‌سازی داشبورد" || text === "/login") {
        const user = await prisma.user.findUnique({ where: { telegramId: chatId } });

        if (user?.phoneNumber) {
          // User already has phone -> Send Link directly
          const link = `${APP_URL}/dashboard`;
          await sendMessage(chatId, `✅ حساب شما قبلاً فعال شده است.\n\n🔗 [ورود به داشبورد](${link})`, "Markdown");
        } else {
          // User needs to share phone -> Request Contact
          await requestContact(chatId);
        }
      }

      // =========================================================
      // 3. HANDLE SUBSCRIPTION STATUS
      // =========================================================
      else if (text === "💎 وضعیت اشتراک") {
        const user = await prisma.user.findUnique({ where: { telegramId: chatId } });
        
        if (!user || !user.subscriptionExpiresAt) {
          await sendMessage(chatId, "❌ اطلاعات اشتراک یافت نشد.");
        } else {
          const now = new Date();
          const expires = new Date(user.subscriptionExpiresAt);
          const diffTime = expires.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const persianDate = getPersianDate(expires);

          if (diffDays > 0) {
            await sendMessage(chatId, `💎 **وضعیت اشتراک شما**\n\n⏳ **${diffDays} روز** باقی‌مانده است.\n📅 تاریخ انقضا: ${persianDate}`);
          } else {
            await sendMessage(chatId, "⚠️ اشتراک شما به پایان رسیده است.\nلطفا نسبت به تمدید اقدام کنید.");
          }
        }
      }

      // =========================================================
      // 4. HANDLE MARKET STATUS (Fetch from TalebSignal)
      // =========================================================
      else if (text === "📊 وضعیت بازار") {
        // Fetch the very latest signal
        const latestSignal = await prisma.talebSignal.findFirst({
          orderBy: { createdAt: "desc" },
        });

        if (!latestSignal) {
          await sendMessage(chatId, "⏳ هنوز داده‌ای برای تحلیل بازار ثبت نشده است.");
        } else {
          // Convert DB Json to typed objects (safely)
          const callAdvice = latestSignal.callAdvice as any;
          const putAdvice = latestSignal.putAdvice as any;
          
          // Generate friendly date string
          const dateString = getFriendlyPersianDate(latestSignal.createdAt);
          const timeString = getPersianTime(latestSignal.createdAt);

          const dateHeader = `📅 <b>وضعیت بازار</b>\n🕐 ${dateString} ساعت ${timeString}\n──────────────────\n`;

          // Generate body
          const analysisBody = generateTelegramMessage(callAdvice, putAdvice);

          if (!analysisBody) {
             // If function returns empty string, it means no BUY signals
             await sendMessage(chatId, `${dateHeader}\nفعلاً سیگنال خرید قطعی (BUY) مشاهده نمی‌شود.\nوضعیت: <b>WAIT</b>`, "HTML");
          } else {
             await sendMessage(chatId, dateHeader + analysisBody, "HTML");
          }
        }
      }

      // =========================================================
      // 5. HANDLE CONTACT SHARING (Update DB)
      // =========================================================
      else if (contact) {
        console.log("📱 Received Contact:", contact.phone_number);
        
        // Normalize phone
        let phone = contact.phone_number.replace(/\D/g, "");
        if (phone.startsWith("98")) phone = "+" + phone;
        else if (phone.startsWith("0")) phone = "+98" + phone.substring(1);
        else phone = "+" + phone;

        await prisma.user.update({
          where: { telegramId: chatId },
          data: { phoneNumber: phone },
        });

        const dashboardLink = `${APP_URL}/dashboard`;
        
        // Send success message + Restore Main Menu
        await sendMainMenu(chatId, `✅ شماره شما با موفقیت ثبت شد.\n\nاکنون می‌توانید وارد شوید:\n🔗 [ورود به داشبورد](${dashboardLink})`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ ok: false });
  }
}

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

// 1. Main Menu Keyboard
async function sendMainMenu(chatId: string, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const keyboard = {
    keyboard: [
      [{ text: "🔐 فعال‌سازی داشبورد" }, { text: "💎 وضعیت اشتراک" }], 
      [{ text: "📊 وضعیت بازار" }] 
    ],
    resize_keyboard: true,
    is_persistent: true,
  };

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      chat_id: chatId, 
      text, 
      reply_markup: keyboard, 
      parse_mode: "Markdown" 
    }),
  });
}

// 2. Generic Message Sender
async function sendMessage(chatId: string, text: string, parseMode: "Markdown" | "HTML" = "Markdown") {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  });
}

// 3. Request Contact Keyboard
async function requestContact(chatId: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const keyboard = {
    keyboard: [
      [{ text: "📱 تایید شماره و فعال‌سازی", request_contact: true }],
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
      text: "⚠️ برای ایجاد حساب کاربری و ورود به داشبورد، نیاز به شماره موبایل شما داریم.\n\nلطفا روی دکمه زیر کلیک کنید:",
      reply_markup: keyboard,
    }),
  });
}

// 4. Date Formatters (Jalali)
function getPersianDate(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tehran",
  }).format(date);
}

function getPersianTime(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tehran",
  }).format(date);
}

function getFriendlyPersianDate(date: Date) {
  const now = new Date();
  const isToday = date.getDate() === now.getDate() && 
                  date.getMonth() === now.getMonth() && 
                  date.getFullYear() === now.getFullYear();
  
  if (isToday) return "امروز";
  return getPersianDate(date);
}

// 5. Number Formatter
const formatNumber = (num: number) => {
  return num ? Number(num).toLocaleString('fa-IR') : "۰";
};

// 6. Signal Message Generator (Refactored for TalebSignal)
const generateTelegramMessage = (call: any, put: any): string => {
  
  const dashboardUrl = `${APP_URL}/dashboard`;

  // Check decisions
  const isCallBuy = call?.decision === 'BUY';
  const isPutBuy = put?.decision === 'BUY';
  const opportunityCount = (isCallBuy ? 1 : 0) + (isPutBuy ? 1 : 0);

  if (opportunityCount === 0) return ""; 

  let message = ""; 
  message += `<b>💎 فرصت‌های ویژه:</b> ${formatNumber(opportunityCount)} مورد\n`;
  message += `-----------------------------\n`;

  if (isCallBuy) {
    // If symbol exists in advice use it, otherwise generic fallback
    const symbolDisplay = call.symbol || "اختیار خرید"; 
    message += `<b>🚀 سیگنال خرید (Call):</b> <code>${symbolDisplay}</code>\n`;
    message += `<b>قیمت خرید:</b> ${formatNumber(call.entry_price)} ریال\n`;
    message += `<i>${call.reasoning}</i>\n\n`;
  }

  if (isPutBuy) {
    const symbolDisplay = put.symbol || "اختیار فروش";
    message += `<b>⬇️ سیگنال خرید (Put):</b> <code>${symbolDisplay}</code>\n`;
    message += `<b>قیمت خرید:</b> ${formatNumber(put.entry_price)} ریال\n`;
    message += `<i>${put.reasoning}</i>\n\n`;
  }

  // message += `<b>🔗 جزئیات کامل:</b> <a href="${dashورد</a>`;

  return message;
};


