/* eslint-disable @typescript-eslint/no-explicit-any */

import iv from 'implied-volatility';
import axios from 'axios';
import { TalebResult } from '@/types/taleb'; 
import { GoogleGenAI } from '@google/genai';

// --- CONFIGURATION ---
const API_URL = `https://BrsApi.ir/Api/Tsetmc/Option.php?key=${process.env.BRS_API_KEY || 'FreeWsXDnKpRTg7dfqRMzRlYSYeA83FN'}`;
const RISK_FREE_RATE = 0.3;
const MIN_VOLUME_THRESHOLD = 1000; 

// --- STATIC TEXTS ---
const TALEB_DESCRIPTIONS = {
  CALL: {
    title: 'استراتژی (Call)',
    profit_scenario: 'رشد شارپ و ناگهانی بازار (Explosive Upside)',
    description:
      'خرید اختیار خرید با اهرم بالا و نوسان ضمنی (IV) ارزان. مناسب برای شرط‌بندی روی جهش‌های بزرگ قیمت با ریسک محدود.',
  },
  PUT: {
    title: 'استراتژی (Put)',
    profit_scenario: 'ریزش سنگین یا سقوط بازار (Market Crash)',
    description:
      'خرید اختیار فروش به عنوان بیمه پرتفوی یا شرط‌بندی روی سقوط. هدف کسب سود نامتقارن از ترس بازار و افزایش IV است.',
  },
};

// --- HELPERS ---
const cleanNum = (val: any) =>
  !val
    ? 0
    : typeof val === 'number'
      ? val
      : parseFloat(val.toString().replace(/,/g, ''));

export async function runTalebStrategy(): Promise<TalebResult> {
  console.log('🔄 Engine: Running Taleb Strategy...');

  // 1. Fetch Data
  const { data: rawData } = await axios.get(API_URL, { timeout: 10000 });
  if (!Array.isArray(rawData)) throw new Error('Invalid Data from Provider');

  console.log('🚀🚀 Tehran Market data length:', rawData.length);

  // 2. Process Math
  const candidates = rawData
    .map((option: any) => {
      const spot = cleanNum(option.base_pc); // Base Price (Underlying)
      const strike = cleanNum(option.price_strike);
      const price = cleanNum(option.pc); // Current Option Price
      const days = cleanNum(option.day_remain);
      const volume = cleanNum(option.tvol);
      const openInterest = cleanNum(option.interest_open);
      
      // --- 🟢 NEW: Extra Data Points ---
      const underlyingChange = cleanNum(option.base_pcp); // e.g. 1.5% or -2%
      const bestBuyPrice = cleanNum(option.pd1); // Best Bid
      const bestSellPrice = cleanNum(option.po1); // Best Ask
      
      // Calculate Spread % (Liquidity Cost)
      // If spread is > 20%, it's very hard to profit.
      let spread = 0;
      if(bestSellPrice > 0) {
        spread = ((bestSellPrice - bestBuyPrice) / bestSellPrice) * 100;
      }

      // Basic sanity check
      if (days <= 2 || price <= 0 || spot <= 0 || openInterest < 10) return null;

      const isCall = option.type?.toLowerCase().includes('call');
      const typeStr = isCall ? 'call' : 'put';
      const T = days / 365.0;

      // Calculate Break-Even Point
      // Call BreakEven = Strike + Price
      // Put BreakEven = Strike - Price
      const breakEven = isCall ? (strike + price) : (strike - price);
      const distToBreakEven = Math.abs((breakEven - spot) / spot) * 100;

      let impliedVol = 0;
      try {
        impliedVol = iv.getImpliedVolatility(
          price, spot, strike, T, RISK_FREE_RATE, typeStr,
        );
      } catch (e) {
        impliedVol = 0;
      }
      
      const gearing = spot / price; // Leverage

      return {
        symbol: option.l18,
        data: {
          price,
          strike,
          days,
          iv: impliedVol || 0,
          gearing: gearing,
          moneyness: strike / spot - 1, // Negative for OTM Call
          type: typeStr,
          openInterest: openInterest,
          volume: volume,
          
          // 🟢 NEW: Useful Metrics for Frontend & AI
          // These are now available in your frontend via `signal.data.spread`, etc.
          spread: parseFloat(spread.toFixed(2)), 
          underlyingChange: underlyingChange, // Trend of the stock today
          breakEvenPrice: breakEven,
          distToBreakEven: parseFloat(distToBreakEven.toFixed(1)), // % distance
          tradesCount: cleanNum(option.tno) // Number of trades
        },
      };
    })
    .filter(Boolean);

  // 3. Filter Logic
  const filtered = candidates.filter((c: any) => {
    const d = c.data;

    if (d.volume < MIN_VOLUME_THRESHOLD) return false; 
    if (d.openInterest < 100) return false;

    // Filter out extreme spreads (if spread > 30%, it's a trap)
    if (d.spread > 30) return false;

    if (d.type === 'call' && (d.moneyness < 0.05 || d.moneyness > 0.4)) return false;
    if (d.type === 'put' && (d.moneyness > -0.05 || d.moneyness < -0.4)) return false;
    
    if (d.price > 8000 || d.iv <= 0 || d.iv > 2.0) return false;
    
    return true;
  });

  const sortFn = (a: any, b: any) =>
    b.data.gearing / (b.data.iv || 1) - a.data.gearing / (a.data.iv || 1);

  // Super Candidates & Lists
  const superRaw = filtered.filter(
    (c: any) => c.data.gearing > 10 && c.data.iv < 1.0,
  );
  
  const superCalls = superRaw
    .filter((c: any) => c.data.type === 'call')
    .sort(sortFn)
    .slice(0, 5);
    
  const superPuts = superRaw
    .filter((c: any) => c.data.type === 'put')
    .sort(sortFn)
    .slice(0, 5);
    
  const superCandidates = [...superCalls, ...superPuts];

  const topCalls = filtered
    .filter((c: any) => c.data.type === 'call')
    .sort(sortFn)
    .slice(0, 5);
    
  const topPuts = filtered
    .filter((c: any) => c.data.type === 'put')
    .sort(sortFn)
    .slice(0, 5);

  // Default State
  const aiDecision: any = {
    call_suggestion: { decision: 'WAIT', symbol: null, max_entry_price: 0, reasoning: '', tags: {} },
    put_suggestion: { decision: 'WAIT', symbol: null, max_entry_price: 0, reasoning: '', tags: {} },
    market_sentiment: 'No significant data for analysis.',
  };

  // 4. AI Analysis
  if (topCalls.length > 0 || topPuts.length > 0) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ MISSING GEMINI_API_KEY');
      aiDecision.market_sentiment = 'System Error: Missing AI Key';
    } else {
      try {
        const genAI = new GoogleGenAI({ apiKey });
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite-preview-02-05'; 

        // 🟢 UPDATED: Sending richer data to AI
        const formatList = (list: any[]) =>
          list
            .map(
              (c) =>
                `${c.symbol} | StockTrend:${c.data.underlyingChange}% | Vol:${c.data.volume} (#${c.data.tradesCount}) | Spr:${c.data.spread}% | Lev:${c.data.gearing.toFixed(1)} | IV:${(c.data.iv * 100).toFixed(0)}%`
            )
            .join('\n');

        const promptText = `
        Act as an Expert Options Trader (Nassim Taleb Strategy) for the Tehran Stock Exchange.
        
        **Data Key:**
        - StockTrend: Daily change of underlying asset (Critical for direction).
        - Spr (Spread): Bid-Ask spread %. High spread (>10%) = High Slippage Risk.
        - Vol (#Trades): High Volume with low #Trades means block trades (Caution).
        
        **Candidates (Already Volume Filtered):**
        
        Top Calls (High Leverage/Low IV): 
        ${formatList(topCalls)}
        
        Top Puts (High Leverage/Low IV): 
        ${formatList(topPuts)}
        
        Task:
        1. Select ONE best Call and ONE best Put.
        2. **Important:** If StockTrend is negative, be very careful recommending a CALL unless it's a technical reversal.
        3. **Important:** Avoid options with Spread > 15% unless potential is huge.
        
        Output Schema (Strict JSON):
        { 
          "market_sentiment": "Short Persian summary of liquidity and trend...",
          "call_suggestion": { 
              "decision": "BUY"|"WAIT", 
              "symbol": "...", 
              "entry_price": 0, 
              "reasoning": "Persian explanation mentioning trend and spread...",
              "tags": { "leverage_tag": "...", "iv_status": "...", "risk_level": "..." }
          }, 
          "put_suggestion": { 
              "decision": "BUY"|"WAIT", 
              "symbol": "...", 
              "entry_price": 0, 
              "reasoning": "Persian explanation...",
              "tags": { "leverage_tag": "...", "iv_status": "...", "risk_level": "..." }
          } 
        }`;

        console.log('🤖 Asking Gemini...');
        const result = await genAI.models.generateContent({
          model: modelName,
          contents: promptText,
        });

        const responseText = result?.text || '';
        const cleanText = responseText.replace(/```json|```/g, '').trim();
        const parsedAI = JSON.parse(cleanText);

        aiDecision.market_sentiment = parsedAI.market_sentiment;

        if (parsedAI.call_suggestion) {
          aiDecision.call_suggestion = {
            ...parsedAI.call_suggestion,
            title: TALEB_DESCRIPTIONS.CALL.title,
            profit_scenario: TALEB_DESCRIPTIONS.CALL.profit_scenario,
            strategy_desc: TALEB_DESCRIPTIONS.CALL.description,
          };
        }

        if (parsedAI.put_suggestion) {
          aiDecision.put_suggestion = {
            ...parsedAI.put_suggestion,
            title: TALEB_DESCRIPTIONS.PUT.title,
            profit_scenario: TALEB_DESCRIPTIONS.PUT.profit_scenario,
            strategy_desc: TALEB_DESCRIPTIONS.PUT.description,
          };
        }
      } catch (e: any) {
        console.error('🐞 AI Failed Error:', e.message);
        aiDecision.market_sentiment = 'Error in AI generation';
      }
    }
  }

  const notify_me =
    superCandidates.length > 0 ||
    aiDecision.call_suggestion?.decision === 'BUY' ||
    aiDecision.put_suggestion?.decision === 'BUY';

  return {
    notify_me,
    ai_analysis: aiDecision,
    super_candidates: { calls: superCalls, puts: superPuts },
  };
}
