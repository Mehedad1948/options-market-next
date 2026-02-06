// types/taleb.ts
export interface TradeSuggestion {
  decision: "BUY" | "WAIT";
  symbol: string | null;
  entry_price: number;
  // Specific reasoning for THIS specific option
  reasoning: string; 
}

export interface TalebAIAnalysis {
  // Global market analysis (e.g., "IV is generally low today...")
  market_sentiment: string; 
  call_suggestion: TradeSuggestion;
  put_suggestion: TradeSuggestion;
}

export interface TalebResult {
  notify_me: boolean;
  ai_analysis: TalebAIAnalysis;
  super_candidates: { calls: any[]; puts: any[]; };
}
