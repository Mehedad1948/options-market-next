/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { eventBus } from '../event-bus';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export class NotificationService {
  /**
   * Sends a formatted message to the configured Telegram Chat.
   */
  static async sendTelegram(message: string, chatId: string): Promise<boolean> {
    if (!TELEGRAM_BOT_TOKEN || !chatId) {
      console.warn("⚠️ Telegram credentials missing in .env");
      return false;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
      await axios.post(url, {
        chat_id: chatId,
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

static async broadcastEvent(eventType: string, data: any) {
    // 1. Log it

    // 2. Emit to the Event Bus (The API route is listening to this)
    eventBus.emit('sse-message', {
      type: eventType,
      data: data,
      timestamp: new Date().toISOString()
    });
  }
}
