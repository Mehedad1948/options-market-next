/* eslint-disable @typescript-eslint/no-explicit-any */

import iv from 'implied-volatility';
import axios from 'axios';
import { TalebResult, OptionCandidate, TalebAIAnalysis } from '@/types/taleb';
import { GoogleGenAI } from '@google/genai';

// --- CONFIGURATION ---
const API_URL = `https://BrsApi.ir/Api/Tsetmc/Option.php?key=${process.env.BRS_API_KEY || 'FreeWsXDnKpRTg7dfqRMzRlYSYeA83FN'}`;
const RISK_FREE_RATE = 0.3;
const MIN_VOLUME_THRESHOLD = 1000;

// --- STATIC TEXTS & DEFINITIONS ---
const TALEB_DESCRIPTIONS = {
  CALL: {
    title: 'استراتژی (Call)',
    profit_scenario: 'رشد شارپ و ناگهانی بازار (Explosive Upside)',
    description: 'خرید اختیار خرید با اهرم بالا...',
  },
  PUT: {
    title: 'استراتژی (Put)',
    profit_scenario: 'ریزش سنگین یا سقوط بازار (Market Crash)',
    description: 'خرید اختیار فروش به عنوان بیمه پرتفوی...',
  },
};

// 🟢 Global Definitions for the Frontend
const FIELD_DEFINITIONS = {
  price: 'قیمت آپشن',
  strike: 'قیمت اعمال',
  days: 'روزهای باقیمانده',
  iv: 'نوسان‌پذیری ضمنی (IV)',
  gearing: 'اهرم مؤثر',
  spread: 'شکاف خرید و فروش (Spread)',
  underlyingChange: 'تغییر سهم پایه (امروز)',
  breakEvenPrice: 'نقطه سر‌به‌سر',
  distToBreakEven: 'فاصله تا سر‌به‌سر (%)',
  tradesCount: 'تعداد دفعات معامله',
  volume: 'حجم معاملات',
  openInterest: 'موقعیت‌های باز',
};

// --- HELPERS ---
const cleanNum = (val: any) =>
  !val
    ? 0
    : typeof val === 'number'
      ? val
      : parseFloat(val.toString().replace(/,/g, ''));

const formatPercent = (val: number) =>
  `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;

export async function runTalebStrategy(): Promise<TalebResult> {
  console.log('🔄 Engine: Running Taleb Strategy...');

  // 1. Fetch Data
  const { data: rawData } = await axios.get(API_URL, { timeout: 10000 });
  if (!Array.isArray(rawData)) throw new Error('Invalid Data from Provider');

  // 2. Process Math (Returns OptionCandidate OR Null)
  const rawCandidates = rawData.map((option: any): OptionCandidate | null => {
    const spot = cleanNum(option.base_pc);
    const strike = cleanNum(option.price_strike);
    const price = cleanNum(option.pc);
    const days = cleanNum(option.day_remain);
    const volume = cleanNum(option.tvol);
    const openInterest = cleanNum(option.interest_open);

    const underlyingChange = cleanNum(option.base_pcp);
    const bestBuyPrice = cleanNum(option.pd1);
    const bestSellPrice = cleanNum(option.po1);

    // Calculate Spread
    let spread = 0;
    if (bestSellPrice > 0) {
      spread = ((bestSellPrice - bestBuyPrice) / bestSellPrice) * 100;
    }

    // Basic Validity Checks
    if (days <= 2 || price <= 0 || spot <= 0 || openInterest < 10) return null;

    const isCall = option.type?.toLowerCase().includes('call');
    const typeStr = isCall ? 'call' : 'put';
    const T = days / 365.0;

    // Break-Even Math
    const breakEven = isCall ? strike + price : strike - price;
    const distToBreakEven = ((breakEven - spot) / spot) * 100;

    let impliedVol = 0;
    try {
      impliedVol = iv.getImpliedVolatility(
        price,
        spot,
        strike,
        T,
        RISK_FREE_RATE,
        typeStr,
      );
    } catch (e) {
      impliedVol = 0;
    }

    const gearing = spot / price;

    // Raw Numeric Data (Must match OptionMetrics interface)
    const dataObj = {
      price,
      strike,
      days,
      iv: impliedVol || 0,
      gearing: gearing,
      moneyness: strike / spot - 1,
      type: typeStr as 'call' | 'put',
      openInterest: openInterest,
      volume: volume,
      spread: parseFloat(spread.toFixed(2)),
      underlyingChange: underlyingChange,
      breakEvenPrice: breakEven,
      distToBreakEven: parseFloat(distToBreakEven.toFixed(1)),
      tradesCount: cleanNum(option.tno),
    };

    // Return valid object
    return {
      symbol: option.l18,
      data: dataObj,
      pretty_data: [
        {
          key: 'gearing',
          label: FIELD_DEFINITIONS.gearing,
          value: gearing.toFixed(1) + 'x',
          class: 'text-blue-500',
        },
        {
          key: 'spread',
          label: FIELD_DEFINITIONS.spread,
          value: spread.toFixed(1) + '%',
          class: spread > 10 ? 'text-red-500' : 'text-emerald-500',
        },
        {
          key: 'iv',
          label: FIELD_DEFINITIONS.iv,
          value: (dataObj.iv * 100).toFixed(0) + '%',
          class: '',
        },
        {
          key: 'underlyingChange',
          label: FIELD_DEFINITIONS.underlyingChange,
          value: formatPercent(underlyingChange),
          class: underlyingChange < 0 ? 'text-red-500' : 'text-green-500',
        },
        {
          key: 'distToBreakEven',
          label: FIELD_DEFINITIONS.distToBreakEven,
          value: formatPercent(distToBreakEven),
          class: '',
        },
        {
          key: 'tradesCount',
          label: FIELD_DEFINITIONS.tradesCount,
          value: dataObj.tradesCount.toLocaleString(),
          class: 'text-gray-500',
        },
      ],
    };
  });

  // 3. Strict Filtering (Removes Nulls & Enforces Type)
  const candidates = rawCandidates.filter(
    (c): c is OptionCandidate => c !== null,
  );

  // 4. Strategy Filtering
  const filtered = candidates.filter((c) => {
    const d = c.data;
    if (d.volume < MIN_VOLUME_THRESHOLD) return false;
    if (d.openInterest < 100) return false;
    if (d.spread > 30) return false; // Filter strictly bad spreads
    if (d.type === 'call' && (d.moneyness < 0.05 || d.moneyness > 0.4))
      return false;
    if (d.type === 'put' && (d.moneyness > -0.05 || d.moneyness < -0.4))
      return false;
    if (d.price > 8000 || d.iv <= 0 || d.iv > 2.0) return false;
    return true;
  });

  // Sort Function
  const sortFn = (a: OptionCandidate, b: OptionCandidate) =>
    b.data.gearing / (b.data.iv || 1) - a.data.gearing / (a.data.iv || 1);

  // 5. Creating Lists (Typed as OptionCandidate[])
  const superRaw = filtered.filter(
    (c) => c.data.gearing > 10 && c.data.iv < 1.0,
  );

  const superCalls = superRaw
    .filter((c) => c.data.type === 'call')
    .sort(sortFn)
    .slice(0, 5);

  const superPuts = superRaw
    .filter((c) => c.data.type === 'put')
    .sort(sortFn)
    .slice(0, 5);

  const topCalls = filtered
    .filter((c) => c.data.type === 'call')
    .sort(sortFn)
    .slice(0, 5);

  const topPuts = filtered
    .filter((c) => c.data.type === 'put')
    .sort(sortFn)
    .slice(0, 5);

  // Default AI State
  const aiDecision: TalebAIAnalysis = {
    market_sentiment: 'No significant data.',
    call_suggestion: {
      decision: 'WAIT',
      symbol: null,
      entry_price: 0,
      reasoning: 'Waiting for signal.',
    },
    put_suggestion: {
      decision: 'WAIT',
      symbol: null,
      entry_price: 0,
      reasoning: 'Waiting for signal.',
    },
  };

  // 6. AI Analysis
  if (topCalls.length > 0 || topPuts.length > 0) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenAI({ apiKey });
        const modelName =
          process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite-preview-02-05';

        const formatList = (list: OptionCandidate[]) =>
          list
            .map(
              (c) =>
                `Sym:${c.symbol} | Trend:${c.data.underlyingChange}% | Spread:${c.data.spread}% | IV:${(c.data.iv * 100).toFixed(0)}%`,
            )
            .join('\n');

        const promptText = `
         Act as an Expert Options Trader (Nassim Taleb Strategy) for the Tehran Stock Exchange.
        
        **Data Key:**
        - StockTrend: Daily change of underlying asset.
        - Spr (Spread): Bid-Ask spread %. >10% is risky.
        - IV: Implied Volatility. >80% is expensive.
        
        **Candidates:**
        Calls: 
        ${formatList(topCalls)}
        
        Puts: 
        ${formatList(topPuts)}
        
        Task:
        1. Select ONE best Call and ONE best Put.
        2. If StockTrend is negative, avoid Calls. If positive, avoid Puts.
        3. Prioritize Low IV and Low Spread.
        
        RESPONSE FORMAT:
        You must output ONLY valid JSON. No markdown, no conversational text.
        Output Schema (Strict JSON):
        { 
          "market_sentiment": "Short Persian summary...",
          "call_suggestion": { 
              "decision": "BUY"|"WAIT", 
              "symbol": "...", 
              "entry_price": 0, 
              "reasoning": "Persian explanation...",
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

        const result = await genAI.models.generateContent({
          model: modelName,
          contents: promptText,
          // Force JSON response from API if supported
          config: { responseMimeType: 'application/json' },
        });

        // Strict Parsing with Regex to fix "Unexpected token" errors
        const rawText = result?.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
          throw new Error('AI did not return valid JSON structure.');
        }

        const parsedAI = JSON.parse(jsonMatch[0]);

        // 🟢 HELPERS: Enrich Suggestion with Real Data
        // This function finds the real candidate object and attaches 'pretty_data' to the suggestion
        const enrichSuggestion = (
          suggestion: any,
          candidates: OptionCandidate[],
        ) => {
          if (!suggestion?.symbol) return suggestion;

          // Find the candidate (Look in the full filtered list to be safe)
          const found = candidates.find((c) => c.symbol === suggestion.symbol);

          if (found) {
            return {
              ...suggestion,
              // Inject the pre-formatted UI data (definitions + values)
              candidate_details: found.pretty_data,
              // Inject exact math data if needed by frontend
              math_data: found.data,
            };
          }
          return suggestion;
        };

        aiDecision.market_sentiment =
          parsedAI.market_sentiment || aiDecision.market_sentiment;

        // Process Call Suggestion
        if (parsedAI.call_suggestion) {
          const enrichedCall = enrichSuggestion(
            parsedAI.call_suggestion,
            filtered,
          );
          aiDecision.call_suggestion = {
            ...aiDecision.call_suggestion,
            ...enrichedCall,
            ...TALEB_DESCRIPTIONS.CALL,
          };
        }

        // Process Put Suggestion
        if (parsedAI.put_suggestion) {
          const enrichedPut = enrichSuggestion(
            parsedAI.put_suggestion,
            filtered,
          );
          aiDecision.put_suggestion = {
            ...aiDecision.put_suggestion,
            ...enrichedPut,
            ...TALEB_DESCRIPTIONS.PUT,
          };
        }
      } catch (e: any) {
        console.error('AI Error:', e.message);
        aiDecision.market_sentiment = `AI Service Error: ${e.message}`;
      }
    }
  }

  const notify_me =
    superCalls.length > 0 ||
    superPuts.length > 0 ||
    aiDecision.call_suggestion?.decision === 'BUY';

  // 7. Return with Strict Types
  return {
    notify_me,
    ai_analysis: aiDecision,
    super_candidates: { calls: superCalls, puts: superPuts },
    definitions: FIELD_DEFINITIONS,
  };
}
