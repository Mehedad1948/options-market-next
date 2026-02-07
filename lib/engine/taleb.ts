/* eslint-disable @typescript-eslint/no-explicit-any */

import iv from 'implied-volatility';
import axios from 'axios';
import { TalebResult } from '@/types/taleb';
import { GoogleGenAI } from '@google/genai';

// Config
// NOTE: Remove the hardcoded fallback key for security. Ensure GEMINI_API_KEY is in your .env file.
const API_URL = `https://BrsApi.ir/Api/Tsetmc/Option.php?key=${process.env.BRS_API_KEY || 'FreeWsXDnKpRTg7dfqRMzRlYSYeA83FN'}`;
const RISK_FREE_RATE = 0.3;

// Helper
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

  // 2. Process Math
  const candidates = rawData
    .map((option: any) => {
      const spot = cleanNum(option.base_pc);
      const strike = cleanNum(option.price_strike);
      const price = cleanNum(option.pc);
      const days = cleanNum(option.day_remain);
      
      // NEW: Capture Trading Volume
      const volume = cleanNum(option.tvol);

      if (
        days <= 2 ||
        price <= 0 ||
        spot <= 0 ||
        cleanNum(option.interest_open) < 10
      )
        return null;

      const isCall = option.type?.toLowerCase().includes('call');
      const typeStr = isCall ? 'call' : 'put';
      const T = days / 365.0;

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

      return {
        symbol: option.l18,
        data: {
          price,
          strike,
          days,
          iv: impliedVol || 0,
          gearing: spot / price,
          moneyness: strike / spot - 1,
          type: typeStr,
          openInterest: cleanNum(option.interest_open),
          volume: volume, // Added volume here
        },
      };
    })
    .filter(Boolean);

  // 3. Filter
  const filtered = candidates.filter((c: any) => {
    const d = c.data;
    
    // NEW LOGIC: Filter out very low volume options (dead markets)
    if (d.volume < 50) return false; 

    if (d.openInterest < 100) return false;
    if (d.type === 'call' && (d.moneyness < 0.05 || d.moneyness > 0.4))
      return false;
    if (d.type === 'put' && (d.moneyness > -0.05 || d.moneyness < -0.4))
      return false;
    if (d.price > 8000 || d.iv <= 0 || d.iv > 2.0) return false;
    return true;
  });

  const sortFn = (a: any, b: any) =>
    b.data.gearing / (b.data.iv || 1) - a.data.gearing / (a.data.iv || 1);

  // Super Candidates (Gearing > 10, IV < 1.0)
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

  // Top Lists for AI
  const topCalls = filtered
    .filter((c: any) => c.data.type === 'call')
    .sort(sortFn)
    .slice(0, 5);
  const topPuts = filtered
    .filter((c: any) => c.data.type === 'put')
    .sort(sortFn)
    .slice(0, 5);

  let aiDecision: any = {
    call_suggestion: {
      decision: 'WAIT',
      symbol: null,
      max_entry_price: 0,
      reasoning: '',
    },
    put_suggestion: {
      decision: 'WAIT',
      symbol: null,
      max_entry_price: 0,
      reasoning: '',
    },
    market_sentiment: 'No significant data for analysis.',
  };

  // 4. AI Analysis
  if (topCalls.length > 0 || topPuts.length > 0) {
    // CHECK API KEY EXISTENCE
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ MISSING GEMINI_API_KEY in .env file');
      aiDecision.market_sentiment = 'System Error: Missing AI Key';
    } else {
      try {
        // INITIALIZE INSIDE THE FUNCTION TO ENSURE ENV VARS ARE LOADED
        const genAI = new GoogleGenAI({ apiKey });
        
        // NEW: Added Volume (Vol) to the format string
        const formatList = (list: any[]) =>
          list
            .map(
              (c) =>
                `${c.symbol} | Vol:${c.data.volume} | P:${c.data.price} | Lev:${c.data.gearing.toFixed(1)} | IV:${(c.data.iv * 100).toFixed(0)}%`,
            )
            .join('\n');

        const promptText = `
        Analyze Iranian Options Market.
        
        Top 5 Calls (Sorted by leverage/risk): 
        ${formatList(topCalls)}
        
        Top 5 Puts (Sorted by leverage/risk): 
        ${formatList(topPuts)}
        
        Task:
        1. Analyze the general volatility (IV) and risk.
        2. Pay attention to 'Vol' (Daily Volume). Avoid suggesting options with Volume < 100 unless the Leverage is excellent.
        3. Select ONE best Call and ONE best Put based on Taleb Strategy (High Gearing, Cheap IV, Acceptable Liquidity).
        4. Explain strictly in Persian.

        Output JSON format ONLY (no markdown code blocks):
        { 
          "market_sentiment": "Short summary...",
          "call_suggestion": { 
              "decision": "BUY"|"WAIT", 
              "symbol": "...", 
              "entry_price": 0, 
              "reasoning": "..." 
          }, 
          "put_suggestion": { 
              "decision": "BUY"|"WAIT", 
              "symbol": "...", 
              "entry_price": 0, 
              "reasoning": "..." 
          } 
        }`;

        console.log('🤖 Asking Gemini...');
        const result = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
        });

        console.log('🚀🚀🚀 Gemini Answer', result);

        if (!result || !result?.text) {
          aiDecision.market_sentiment = 'Error in AI generation: ' + 'No response from AI';
          throw new Error('No response from AI');
        }

        const responseText = result?.text || 'No response from AI';
        console.log('🎄responseText🎄', responseText);

        // Clean markdown backticks just in case
        const cleanText = responseText?.replace(/```json|```/g, '').trim();

        aiDecision = JSON.parse(cleanText);
        console.log('✅ AI Analysis Complete');
      } catch (e: any) {
        console.error('🐞 AI Failed Error:', e.message);
        aiDecision.market_sentiment = 'Error in AI generation: ' + e.message;
      }
    }
  }

  const notify_me =
    superCandidates.length > 0 ||
    aiDecision.call_suggestion?.decision === 'BUY' ||
    aiDecision.put_suggestion?.decision === 'BUY';

  return {
    notify_me,
    ai_analysis: aiDecision,    super_candidates: { calls: superCalls, puts: superPuts },
  };
}

