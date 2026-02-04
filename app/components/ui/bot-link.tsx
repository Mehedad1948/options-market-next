import { Bot, ExternalLink } from "lucide-react";

export function BotButton() {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || "OptionYarBot";
  
  return (
    <a
      href={`https://t.me/${botUsername}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 rounded-xl transition-colors border border-blue-200 dark:border-blue-800"
    >
      <Bot className="w-4 h-4" />
      <span className="hidden sm:inline">ربات تلگرام</span>
      <ExternalLink className="w-3 h-3 opacity-50" />
    </a>
  );
}
