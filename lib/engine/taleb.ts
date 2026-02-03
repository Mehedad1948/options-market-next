/* eslint-disable @typescript-eslint/no-explicit-any */

import iv from 'implied-volatility';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Config
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCubVc7Xso_Cr6ebxnFRPSwXW51lewGmVQ';
const API_URL = `https://BrsApi.ir/Api/Tsetmc/Option.php?key=${process.env.BRS_API_KEY || 'FreeWsXDnKpRTg7dfqRMzRlYSYeA83FN'}`;
const RISK_FREE_RATE = 0.3;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// Helper
const cleanNum = (val: any) => (!val ? 0 : (typeof val === 'number' ? val : parseFloat(val.toString().replace(/,/g, ''))));

export interface TalebResult {
  notify_me: boolean;
  ai_analysis: {
    call_suggestion: Suggestion;
    put_suggestion: Suggestion;
  };
  super_candidates: {calls: any[]; puts: any[];};
}

interface Suggestion {
  decision: "BUY" | "WAIT";
  symbol: string | null;
  max_entry_price: number;
  reasoning: string;
}

export async function runTalebStrategy(): Promise<TalebResult> {
  console.log('🔄 Engine: Running Taleb Strategy...');
  
  // 1. Fetch Data
  const { data: rawData } = await axios.get(API_URL, { timeout: 10000 });
  if (!Array.isArray(rawData)) throw new Error("Invalid Data from Provider");

  // 2. Process Math
  const candidates = rawData.map((option: any) => {
    const spot = cleanNum(option.base_pc);
    const strike = cleanNum(option.price_strike);
    const price = cleanNum(option.pc);
    const days = cleanNum(option.day_remain);
    
    if (days <= 2 || price <= 0 || spot <= 0 || cleanNum(option.interest_open) < 10) return null;

    const isCall = option.type?.toLowerCase().includes('call');
    const typeStr = isCall ? 'call' : 'put';
    const T = days / 365.0;

    let impliedVol = 0;
    try { impliedVol = iv.getImpliedVolatility(price, spot, strike, T, RISK_FREE_RATE, typeStr); } catch (e) { impliedVol = 0; }

    return {
      symbol: option.l18,
      data: { 
        price, strike, days, iv: impliedVol || 0, 
        gearing: spot / price, 
        moneyness: (strike / spot) - 1, 
        type: typeStr,
        openInterest: cleanNum(option.interest_open)
      }
    };
  }).filter(Boolean);

  // 3. Filter
  const filtered = candidates.filter((c: any) => {
    const d = c.data;
    if (d.openInterest < 100) return false;
    if (d.type === 'call' && (d.moneyness < 0.05 || d.moneyness > 0.40)) return false;
    if (d.type === 'put' && (d.moneyness > -0.05 || d.moneyness < -0.40)) return false;
    if (d.price > 8000 || d.iv <= 0 || d.iv > 2.0) return false;
    return true;
  });

  const sortFn = (a: any, b: any) => (b.data.gearing / (b.data.iv || 1)) - (a.data.gearing / (a.data.iv || 1));
  
  // Super Candidates (Gearing > 10, IV < 1.0)
  const superRaw = filtered.filter((c: any) => c.data.gearing > 10 && c.data.iv < 1.0);
  const superCalls = superRaw.filter((c: any) => c.data.type === 'call').sort(sortFn).slice(0, 5);
  const superPuts = superRaw.filter((c: any) => c.data.type === 'put').sort(sortFn).slice(0, 5);
  const superCandidates = [...superCalls, ...superPuts];

  // Top Lists for AI
  const topCalls = filtered.filter((c: any) => c.data.type === 'call').sort(sortFn).slice(0, 5);
  const topPuts = filtered.filter((c: any) => c.data.type === 'put').sort(sortFn).slice(0, 5);

  let aiDecision: any = {
    call_suggestion: { decision: "WAIT", symbol: null, max_entry_price: 0, reasoning: "" },
    put_suggestion: { decision: "WAIT", symbol: null, max_entry_price: 0, reasoning: "" }
  };

  // 4. AI Analysis
  if (topCalls.length > 0 || topPuts.length > 0) {
    try {
        const formatList = (list: any[]) => list.map(c => `${c.symbol} | P:${c.data.price} | K:${c.data.strike} | Lev:${c.data.gearing.toFixed(1)} | IV:${(c.data.iv * 100).toFixed(0)}%`).join('\n');
        
        const prompt = `Analyze Iranian Options. Top 5 Calls: \n${formatList(topCalls)}\n Top 5 Puts: \n${formatList(topPuts)}\n. 
        Select ONE best Call and ONE best Put. Criteria: High Leverage, Low IV.
        Output JSON: { "call_suggestion": { "decision": "BUY"|"WAIT", "symbol": "...", "max_entry_price": 0, "reasoning": "Persian Only" }, "put_suggestion": { ... } }`;
        
        const result = await model.generateContent(prompt);
        aiDecision = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
    } catch (e) {
        console.error("AI Failed, using fallback");
        // Fallback logic could go here
    }
  }

  const notify_me = superCandidates.length > 0 || aiDecision.call_suggestion.decision === 'BUY' || aiDecision.put_suggestion.decision === 'BUY';

  return { notify_me, ai_analysis: aiDecision, super_candidates: { calls: superCalls, puts: superPuts } };
}
