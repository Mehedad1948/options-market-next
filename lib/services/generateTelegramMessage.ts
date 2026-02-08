import { TalebResult } from '@/types/taleb';

// Helper for Persian number formatting
const formatNumber = (num: number) => {
  return num.toLocaleString('fa-IR');
};

/**
 * Generates the HTML message for Telegram notifications based on TalebResult
 * @param result - The full TalebResult object (do not destructure input)
 */
export const generateTelegramMessage = (
  result: TalebResult, 
): string => {
  
  // 1. Get Dashboard URL from Environment Variables
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  // Ensure no double slashes if the env var ends with /
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const dashboardUrl = `${cleanBaseUrl}/dashboard`;

  // 2. Access Analysis Data safely
  const analysis = result.ai_analysis;
  const call = analysis.call_suggestion;
  const put = analysis.put_suggestion;

  // 3. Identify valid opportunities
  const isCallBuy = call.decision === 'BUY';
  const isPutBuy = put.decision === 'BUY';
  const opportunityCount = (isCallBuy ? 1 : 0) + (isPutBuy ? 1 : 0);

  // If no opportunities, return empty string (or handle as needed)
  if (opportunityCount === 0) return ""; 

  // 4. Build the Header
  let message = `<b>🦅 هشدار آپشن یار</b>\n\n`;
  message += `<b>💎 فرصت‌های ویژه:</b> ${formatNumber(opportunityCount)} مورد یافت شد\n`;
  message += `-----------------------------\n`;

  // 5. Add Call Section (if BUY)
  if (isCallBuy) {
    // Use the specific option symbol if available, otherwise fallback to underlying
    const symbolDisplay = call.symbol ; 
    
    message += `<b>🚀 سیگنال خرید (Call):</b> <code>${symbolDisplay}</code>\n`;
    // Display the recommended entry price from the suggestion
    message += `<b>قیمت خرید:</b> ${formatNumber(call.entry_price)} ریال\n`;
    message += `<i>${call.reasoning}</i>\n\n`;
  }

  // 6. Add Put Section (if BUY) - Using ⬇️ icon
  if (isPutBuy) {
    // Use the specific option symbol if available
    const symbolDisplay = put.symbol ;

    message += `<b>⬇️ سیگنال خرید (Put):</b> <code>${symbolDisplay}</code>\n`;
    // Display the recommended entry price from the suggestion
    message += `<b>قیمت خرید:</b> ${formatNumber(put.entry_price)} ریال\n`;
    message += `<i>${put.reasoning}</i>\n\n`;
  }

  // 7. Add Footer (Dynamic Link)
  message += `<b>🔗 جزئیات کامل:</b> <a href="${dashboardUrl}">مشاهده داشبورد</a>`;

  return message;
};
