// The shape of your advice object
export interface TradeSuggestion {
  decision: "BUY" | "WAIT";
  symbol: string | null;
  max_entry_price: number;
  reasoning: string;
}

// The shape of the Prisma row (helper type)
import { TalebSignal } from "@prisma/client";

export interface TalebSignalWithTypes extends Omit<TalebSignal, 'callAdvice' | 'putAdvice'> {
  callAdvice: TradeSuggestion | null;
  putAdvice: TradeSuggestion | null;
}
