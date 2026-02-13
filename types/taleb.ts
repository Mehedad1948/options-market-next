// types/taleb.ts

// 1. Structure for the formatted UI data (Label + Value + Class)
export interface PrettyDataItem {
  key: string;
  label: string;
  value: string ;
  class?: string;
}

// 2. Structure for the raw numeric data used for logic/sorting
export interface OptionMetrics {
  price: number;
  strike: number;
  days: number;
  iv: number;
  gearing: number;
  moneyness: number;
  type: 'call' | 'put';
  openInterest: number;
  volume: number;
  spread: number;
  underlyingChange: number;
  breakEvenPrice: number;
  distToBreakEven: number;
  tradesCount: number;
}

// 3. Structure for a single Option Candidate (Row)
export interface OptionCandidate {
  symbol: string;
  data: OptionMetrics;
  pretty_data: PrettyDataItem[];
}

// 4. AI Trade Suggestion
export interface TradeSuggestion {
  decision: 'BUY' | 'WAIT';
  symbol: string | null;
  entry_price?: number; // Made optional as AI might not always pinpoint exact price
  reasoning?: string;
  // Metadata added from static descriptions
  title?: string;
  profit_scenario?: string;
  description?: string;
}

// 5. AI Analysis Container
export interface TalebAIAnalysis {
  market_sentiment: string;
  call_suggestion: TradeSuggestion;
  put_suggestion: TradeSuggestion;
}

// 6. Main Result Object
export interface TalebResult {
  notify_me: boolean;
  ai_analysis: TalebAIAnalysis;
  super_candidates: {
    calls: OptionCandidate[] | null;
    puts: (OptionCandidate | null)[] | null;
  };
  // The dictionary of Persian translations (e.g., { gearing: "اهرم" })
  definitions: Record<string, string>;
}
