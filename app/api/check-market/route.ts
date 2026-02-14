/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { runTalebStrategy } from '@/lib/engine/taleb';
import { NotificationService } from '@/lib/services/telegram';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getTehranMarketStatus } from '@/lib/services/tehranMarketStatus';
import { generateTelegramMessage } from '@/lib/services/generateTelegramMessage';
import { revalidateTag } from 'next/cache';
import jalaali from 'jalaali-js'; // 1. Import the date converter

// ------------------------------------------------------------------
// 🛠️ HELPER: Check for Weekends and Official Holidays
// ------------------------------------------------------------------
async function checkMarketHoliday(): Promise<{ isClosed: boolean; reason?: string }> {
  const now = new Date();


  try {
    const jDate = jalaali.toJalaali(now);
    // API Format: https://holidayapi.ir/jalali/{year}/{month}/{day}
    const apiUrl = `https://holidayapi.ir/jalali/${jDate.jy}/${jDate.jm}/${jDate.jd}`;
    
    // Set a short timeout so we don't hang if the API is down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 sec timeout

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      // The API returns { is_holiday: true, events: [...] }
      if (data.is_holiday) {
        // Collect event names for the log
        const eventNames = data.events?.map((e: any) => e.description).join(', ') || 'Official Holiday';
        return { isClosed: true, reason: `Official Holiday: ${eventNames}` };
      }
    }
  } catch (error) {
    console.warn("⚠️ Failed to check holiday API, assuming market is open.", error);
    // If API fails, we default to OPEN to be safe, or you can default to CLOSED if you prefer caution.
  }

  return { isClosed: false };
}

// ------------------------------------------------------------------
// 🚀 MAIN ROUTE
// ------------------------------------------------------------------
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  console.log('⭕⭕ auth header', authHeader);

  try {
    // 🛑 HOLIDAY & WEEKEND CHECK
    // We run this BEFORE doing any heavy strategy logic
    const marketCheck = await checkMarketHoliday();
    
    if (marketCheck.isClosed) {
      console.log(`💤 Skipping Analysis: Market is closed due to: ${marketCheck.reason}`);
      return NextResponse.json({
        status: 'skipped',
        message: `Market is closed (${marketCheck.reason}). No analysis run.`
      });
    }

    // 1. Run the Strategy Logic
    const result = await runTalebStrategy();

    const candidatesPayload = {
      calls: result.super_candidates.calls,
      puts: result.super_candidates.puts,
    };

    const currentStatus = getTehranMarketStatus();

    const nothingToSuggest =
      result.ai_analysis.put_suggestion?.decision === 'WAIT' &&
      result.ai_analysis.call_suggestion?.decision === 'WAIT';

    // ============================================================
    // 4. TELEGRAM NOTIFICATIONS (Only if notify_me is true)
    // ============================================================
    if (result.notify_me && !nothingToSuggest) {
      revalidateTag('signals', { expire: 0 });
      const savedSignal = await prisma.talebSignal.create({
        data: {
          marketStatus: currentStatus,
          aiReasoning: result.ai_analysis.market_sentiment,
          callAdvice: (result.ai_analysis.call_suggestion ?? null) as unknown as Prisma.InputJsonValue,
          putAdvice: (result.ai_analysis.put_suggestion ?? null) as unknown as Prisma.InputJsonValue,
          candidates: candidatesPayload as unknown as Prisma.InputJsonValue,
          metadata: {
            definitions: result.definitions,
            engine_version: '2.1.0',
          } as unknown as Prisma.InputJsonValue,
          sentNotification: result.notify_me,
        },
      });

      await NotificationService.broadcastEvent('TALEB_SIGNAL', {
        id: savedSignal.id,
        timestamp: new Date().toISOString(),
        notify: result.notify_me,
        symbol:
          result.ai_analysis.call_suggestion?.decision === 'BUY'
            ? result.ai_analysis.call_suggestion?.symbol
            : result.ai_analysis.put_suggestion?.decision === 'BUY'
              ? result.ai_analysis.put_suggestion?.symbol
              : 'بروزرسانی بازار',
        type:
          result.ai_analysis.call_suggestion?.decision === 'BUY'
            ? 'CALL'
            : result.ai_analysis.put_suggestion?.decision === 'BUY'
              ? 'PUT'
              : 'WAIT',
        price:
          result.ai_analysis.call_suggestion?.decision === 'BUY'
            ? result.ai_analysis.call_suggestion?.entry_price
            : 0,
      });

      const msg = generateTelegramMessage(result);

      // A. Get active subscribers
      const subscribers = await prisma.user.findMany({
        where: {
          telegramId: { not: null },
          notifyTelegram: true,
          subscriptionExpiresAt: { gt: new Date() },
        },
        select: { telegramId: true },
      });

      // B. Create recipient list
      const recipientIds = new Set<string>();
      if (process.env.ADMIN_TELEGRAM_CHAT_ID) {
        recipientIds.add(process.env.ADMIN_TELEGRAM_CHAT_ID);
      }
      subscribers.forEach((user) => {
        if (user.telegramId) recipientIds.add(user.telegramId);
      });

      console.log(`📣 Sending signal to ${recipientIds.size} recipients...`);

      // C. Send messages
      const sendPromises = Array.from(recipientIds).map((chatId) =>
        NotificationService.sendTelegram(msg, chatId),
      );

      await Promise.allSettled(sendPromises);

      return NextResponse.json({
        status: 'success',
        message: `Alert sent to ${recipientIds.size} users + Web Dashboard Updated.`,
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'No significant signals today (Dashboard updated).',
    });
  } catch (error: any) {
    console.error('🐞 Cron Job Error: ', error);
    console.error('🐞 Cron Job Error Request: ', error?.request);

    if (process.env.ADMIN_TELEGRAM_CHAT_ID) {
      await NotificationService.sendTelegram(
        `⚠️ <b>System Error:</b> ${error.message}`,
        process.env.ADMIN_TELEGRAM_CHAT_ID,
      );
    }

    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 },
    );
  }
}
