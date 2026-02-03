/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { runTalebStrategy } from '@/lib/engine/taleb';
import { NotificationService } from '@/lib/services/telegram';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // OPTIONAL: Add a secret key check so only GitHub Actions can call this
  const authHeader = request.headers.get('authorization');
  //   if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  //   }

  console.log('🐞🐞 authHeader', authHeader);
  

  try {
    // 1. Run the Strategy Logic
    const result = await runTalebStrategy();

    console.log('⭕⭕⭕ result', result);

    // 2. Check if we need to notify
    if (result.notify_me) {
      const { call_suggestion, put_suggestion } = result.ai_analysis;
      const superCount = result.super_candidates.length;

      // Construct Telegram Message (HTML Format)
      let msg = `<b>🦅 Taleb System Alert</b>\n\n`;
      msg += `<b>💎 Super Candidates:</b> ${superCount} found\n`;
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

      // 3. Send Notification
      const sent = await NotificationService.sendTelegram(msg);

      if (sent) {
        return NextResponse.json({
          status: 'success',
          message: 'Alert sent to Telegram',
        });
      } else {
        return NextResponse.json({
          status: 'warning',
          message: 'Signal found but Telegram failed',
        });
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'No significant signals today.',
    });
  } catch (error: any) {
    console.error('🐞 Cron Job Error: ', error);
    await NotificationService.sendTelegram(
      `⚠️ <b>System Error:</b> ${error.message}`,
    );
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 },
    );
  }
}
