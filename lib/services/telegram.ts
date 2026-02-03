/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // Your personal ID or Channel ID

export class NotificationService {
  /**
   * Sends a formatted message to the configured Telegram Chat.
   */
  static async sendTelegram(message: string): Promise<boolean> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn("⚠️ Telegram credentials missing in .env");
      return false;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
      await axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML', // Allows bolding and links
        disable_web_page_preview: true
      });
      return true;
    } catch (error: any) {
      console.error("❌ Telegram Send Failed:", error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Placeholder for future SSE logic
   */
  static async broadcastEvent(event: string, data: any) {
    // Logic for SSE to frontend clients will go here later
    console.log(`[Event Broadcast]: ${event}`, data);
  }
}
