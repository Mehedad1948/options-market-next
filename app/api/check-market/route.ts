/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { runTalebStrategy } from '@/lib/engine/taleb';
import { NotificationService } from '@/lib/services/telegram';
import { Prisma, PrismaClient } from '@prisma/client';
import { getTehranMarketStatus } from '@/lib/services/tehranMarketStatus';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // OPTIONAL: Add a secret key check so only GitHub Actions can call this
  const authHeader = request.headers.get('authorization');
  //   if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  //   }

  console.log('⭕⭕ auth header', authHeader);

  try {
    // 1. Run the Strategy Logic
    const result = await runTalebStrategy();

    const candidatesPayload = {
      calls: result.super_candidates.calls,
      puts: result.super_candidates.puts,
    };

    const currentStatus = getTehranMarketStatus();

    // 3. Save to PostgreSQL
const savedSignal = await prisma.talebSignal.create({
  data: {
    marketStatus: currentStatus,
    
    // FIX: Use 'as unknown as Prisma.InputJsonValue'
    callAdvice: (result.ai_analysis.call_suggestion ?? null) as unknown as Prisma.InputJsonValue,
    putAdvice: (result.ai_analysis.put_suggestion ?? null) as unknown as Prisma.InputJsonValue,

    // Remember to include the required aiReasoning field
    aiReasoning: result.ai_analysis.call_suggestion?.reasoning || "No reasoning provided",

    // Apply the same fix to candidates if needed
    candidates: candidatesPayload as unknown as Prisma.InputJsonValue,
    
    sentNotification: result.notify_me,
  },
});

    // 2. Check if we need to notify
   if (result.notify_me) {
      const { call_suggestion, put_suggestion } = result.ai_analysis;
      const superCount =
        result.super_candidates.calls.length +
        result.super_candidates.puts.length;

      // Construct Telegram Message (HTML Format)
      let msg = `<b>🦅 Taleb System Alert</b>\n\n`;
      msg += `<b>💎 Candidates:</b> ${superCount} found\n`;
      msg += `-----------------------------\n`;

      // Call Section
      if (call_suggestion.decision === 'BUY') {
        msg += `<b>🚀 CALL SIGNAL:</b> <code>${call_suggestion.symbol}</code>\n`;
        msg += `<b>Buy Limit:</b> ${call_suggestion.max_entry_price} Rials\n`;
        msg += `<i>${call_suggestion.reasoning}</i>\n\n`;
      }

      // Put Section
      if (put_suggestion.decision === 'BUY') {
        msg += `<b>🩸 PUT SIGNAL:</b> <code>${put_suggestion.symbol}</code>\n`;
        msg += `<b>Buy Limit:</b> ${put_suggestion.max_entry_price} Rials\n`;
        msg += `<i>${put_suggestion.reasoning}</i>\n`;
      }

      // If only Super candidates but AI said WAIT
      if (
        superCount > 0 &&
        call_suggestion.decision === 'WAIT' &&
        put_suggestion.decision === 'WAIT'
      ) {
        msg += `AI suggests waiting, but mathematical super candidates exist. Check dashboard.`;
      }

      // ============================================================
      // 3. FETCH SUBSCRIBERS & SEND NOTIFICATIONS
      // ============================================================

      // A. Get active subscribers from DB
      const subscribers = await prisma.user.findMany({
        where: {
          telegramId: { not: null },      // Must have Telegram ID linked
          notifyTelegram: true,           // Must have notifications ON
          subscriptionExpiresAt: {
            gt: new Date()                // Subscription must be in the future
          }
        },
        select: { telegramId: true }
      });

      // B. Create a unique list of recipients (Admin + Subscribers)
      // We use a Set to ensure the Admin doesn't get double texts if they are also in the User table
      const recipientIds = new Set<string>();

      // Always add Admin (from .env)
      if (process.env.ADMIN_TELEGRAM_CHAT_ID) {
        recipientIds.add(process.env.ADMIN_TELEGRAM_CHAT_ID);
      }
      
      // Add Subscribers
      subscribers.forEach(user => {
        if (user.telegramId) recipientIds.add(user.telegramId);
      });

      console.log(`📣 Sending signal to ${recipientIds.size} recipients...`);

      // C. Send to everyone (using Promise.allSettled to prevent one failure stops all)
      const sendPromises = Array.from(recipientIds).map(chatId => 
        NotificationService.sendTelegram(msg, chatId) 
      );

      await Promise.allSettled(sendPromises);

      return NextResponse.json({
        status: 'success',
        message: `Alert sent to ${recipientIds.size} users.`,
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'No significant signals today.',
    });
  } catch (error: any) {
    console.error('🐞 Cron Job Error: ', error);
    
    // Fallback: Try to notify only Admin about the crash
    if (process.env.ADMIN_TELEGRAM_CHAT_ID) {
        await NotificationService.sendTelegram(
        `⚠️ <b>System Error:</b> ${error.message}`, 
        process.env.ADMIN_TELEGRAM_CHAT_ID
        );
    }
    
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 },
    );
  }
}