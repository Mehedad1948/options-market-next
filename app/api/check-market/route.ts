/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { runTalebStrategy } from '@/lib/engine/taleb';
import { NotificationService } from '@/lib/services/telegram'; // Ensure this service has the broadcastEvent method we added
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma'; // FIXED: Use singleton to prevent connection leaks
import { getTehranMarketStatus } from '@/lib/services/tehranMarketStatus';
import { generateTelegramMessage } from '@/lib/services/generateTelegramMessage';

export async function GET(request: Request) {
  // OPTIONAL: Add a secret key check so only GitHub Actions can call this
  const authHeader = request.headers.get('authorization');
  console.log('⭕⭕ auth header', authHeader);

  try {
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
      const savedSignal = await prisma.talebSignal.create({
        data: {
          marketStatus: currentStatus, // Keep your existing status logic

          // 1. The General Analysis goes to the main text column
          aiReasoning: result.ai_analysis.market_sentiment,

          // 2. The Specific Advice goes into the JSON columns
          // The JSON now contains the 'reasoning' for that specific symbol
          callAdvice: (result.ai_analysis.call_suggestion ??
            null) as unknown as Prisma.InputJsonValue,
          putAdvice: (result.ai_analysis.put_suggestion ??
            null) as unknown as Prisma.InputJsonValue,

          // 3. Candidates logic
          candidates: candidatesPayload as unknown as Prisma.InputJsonValue,
          sentNotification: result.notify_me,
        },
      });

      await NotificationService.broadcastEvent('TALEB_SIGNAL', {
        id: savedSignal.id,
        timestamp: new Date().toISOString(),
        notify: result.notify_me, // Vital: Client uses this to trigger sound/popup
        // Summary data for the toast
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

      // Construct Telegram Message (HTML Format)
      const msg = generateTelegramMessage(result);

      // A. Get active subscribers from DB
      const subscribers = await prisma.user.findMany({
        where: {
          telegramId: { not: null }, // Must have Telegram ID linked
          notifyTelegram: true, // Must have notifications ON
          subscriptionExpiresAt: {
            gt: new Date(), // Subscription must be in the future
          },
        },
        select: { telegramId: true },
      });

      // B. Create a unique list of recipients (Admin + Subscribers)
      // We use a Set to ensure the Admin doesn't get double texts if they are also in the User table
      const recipientIds = new Set<string>();

      // Always add Admin (from .env)
      if (process.env.ADMIN_TELEGRAM_CHAT_ID) {
        recipientIds.add(process.env.ADMIN_TELEGRAM_CHAT_ID);
      }

      // Add Subscribers
      subscribers.forEach((user) => {
        if (user.telegramId) recipientIds.add(user.telegramId);
      });

      console.log(`📣 Sending signal to ${recipientIds.size} recipients...`);

      // C. Send to everyone (using Promise.allSettled to prevent one failure stops all)
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

    // Fallback: Try to notify only Admin about the crash
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
