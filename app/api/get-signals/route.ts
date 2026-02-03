/* eslint-disable @typescript-eslint/no-explicit-any */
import iv from 'implied-volatility';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCubVc7Xso_Cr6ebxnFRPSwXW51lewGmVQ';
const API_URL = `https://BrsApi.ir/Api/Tsetmc/Option.php?key=${process.env.BRS_API_KEY || 'FreeWsXDnKpRTg7dfqRMzRlYSYeA83FN'}`;
const RISK_FREE_RATE = 0.3; // 30%

// --- SETUP GEMINI ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
});

// --- HELPER: Parse numbers safely ---
const cleanNum = (val: any) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  return parseFloat(val.toString().replace(/,/g, ''));
};

// --- HELPER: Standard Error Response ---
const errorResponse = (message: string, code: string, status: number, details: any = null) => {
  return NextResponse.json({
    status: 'error',
    code: code,
    message: message,
    details: details
  }, { status });
};

export async function GET() {
  let superCandidates: any[] = [];
  let aiDecision = {
    call_suggestion: { decision: "WAIT", symbol: null, max_entry_price: 0, reasoning: "" },
    put_suggestion: { decision: "WAIT", symbol: null, max_entry_price: 0, reasoning: "" }
  };

  try {
    console.log('1. Fetching market data...');
    let rawData;
    try {
      const response = await axios.get(API_URL, { timeout: 10000 });
      rawData = response.data;
    } catch (netError: any) {
      return errorResponse("Failed to fetch data from BrsApi", "NETWORK_ERROR", 502, netError.message);
    }

    if (!Array.isArray(rawData)) {
      return errorResponse("Invalid API response structure from provider", "INVALID_DATA", 500);
    }

    // --- STEP 1: MATH & PROCESSING ---
    const candidates = rawData
      .map((option) => {
        const spotPrice = cleanNum(option.base_pc);
        const strikePrice = cleanNum(option.price_strike);
        const optionPrice = cleanNum(option.pc);
        const daysRemain = cleanNum(option.day_remain);
        const openInterest = cleanNum(option.interest_open);

        // Basic Hygiene Filters
        if (daysRemain <= 2 || optionPrice <= 0 || spotPrice <= 0 || openInterest < 10) return null;

        const isCall = option.type && option.type.toLowerCase().includes('call');
        const typeStr = isCall ? 'call' : 'put';
        const T = daysRemain / 365.0;

        let impliedVol = 0;
        try {
          impliedVol = iv.getImpliedVolatility(optionPrice, spotPrice, strikePrice, T, RISK_FREE_RATE, typeStr);
        } catch (e) {
          impliedVol = 0;
        }

        // Metrics
        const moneynessPct = (strikePrice / spotPrice) - 1;
        const gearing = spotPrice / optionPrice;

        return {
          symbol: option.l18,
          base: option.base_l18,
          data: {
            spot: spotPrice,
            strike: strikePrice,
            price: optionPrice,
            days: daysRemain,
            iv: impliedVol || 0,
            gearing: gearing,
            moneyness: moneynessPct,
            openInterest: openInterest,
            type: typeStr,
          },
        };
      })
      .filter((item) => item !== null);

    // --- STEP 2: TALEB STRATEGY FILTERS ---
    const filteredCandidates = candidates.filter((c: any) => {
      const d = c.data;
      // 1. Liquidity
      if (d.openInterest < 100) return false;
      // 2. Moneyness (OTM Only)
      if (d.type === 'call' && (d.moneyness < 0.05 || d.moneyness > 0.40)) return false;
      if (d.type === 'put' && (d.moneyness > -0.05 || d.moneyness < -0.40)) return false;
      // 3. Cheap Premium & Reasonable IV
      if (d.price > 8000) return false;
      if (d.iv <= 0 || d.iv > 2.0) return false;

      return true;
    });

    // Score function: Higher Leverage / Lower IV is better
    const sortFn = (a: any, b: any) => {
      const scoreA = a.data.gearing / (a.data.iv || 1);
      const scoreB = b.data.gearing / (b.data.iv || 1);
      return scoreB - scoreA;
    };

    // --- STEP 3: SNIPER MODE (SUPER CANDIDATES) ---
    // Split into Calls and Puts to get top 5 of each
    const superRaw = filteredCandidates.filter((c: any) => c.data.gearing > 10 && c.data.iv < 1.0);
    
    const superCalls = superRaw.filter((c: any) => c.data.type === 'call').sort(sortFn).slice(0, 5);
    const superPuts = superRaw.filter((c: any) => c.data.type === 'put').sort(sortFn).slice(0, 5);
    
    superCandidates = [...superCalls, ...superPuts];

    // Prepare lists for AI (Top 5 Calls and Top 5 Puts from general list)
    const topCalls = filteredCandidates.filter((c: any) => c.data.type === 'call').sort(sortFn).slice(0, 5);
    const topPuts = filteredCandidates.filter((c: any) => c.data.type === 'put').sort(sortFn).slice(0, 5);

    if (topCalls.length === 0 && topPuts.length === 0) {
      return NextResponse.json({
        status: 'success',
        notify_me: false,
        message: 'No candidates meet basic Taleb criteria.',
        ai_analysis: aiDecision
      });
    }

    // --- STEP 4: AI ANALYSIS ---
    try {
      const formatList = (list: any[]) => list.map((c) => 
        `Symbol: ${c.symbol} | Price: ${c.data.price} | Strike: ${c.data.strike} | Lev: ${c.data.gearing.toFixed(1)}x | IV: ${(c.data.iv * 100).toFixed(1)}%`
      ).join('\n');

      const prompt = `
        You are Nassim Taleb. Analyze these Iranian Market Options.
        
        TOP 5 CALLS (Betting on Boom):
        ${formatList(topCalls)}

        TOP 5 PUTS (Betting on Crash):
        ${formatList(topPuts)}

        INSTRUCTIONS:
        1. Select ONE best Call option and ONE best Put option.
        2. Criteria: High Leverage + Low IV + Convexity.
        3. Suggest a 'max_entry_price' (Limit Order) which is Current Price + 5% buffer.
        4. If the candidates are weak, decide "WAIT".
        5. **IMPORTANT:** Write the 'reasoning' strictly in **PERSIAN (Farsi)**.

        OUTPUT JSON SCHEMA ONLY (Do not output markdown):
        {
            "call_suggestion": {
                "decision": "BUY" | "WAIT",
                "symbol": "SymbolString",
                "max_entry_price": Number,
                "reasoning": "Persian explanation"
            },
            "put_suggestion": {
                "decision": "BUY" | "WAIT",
                "symbol": "SymbolString",
                "max_entry_price": Number,
                "reasoning": "Persian explanation"
            }
        }
      `;

      console.log('3. Consulting Gemini...');
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      aiDecision = JSON.parse(cleanJson);

    } catch (aiError) {
      console.error("AI Analysis Failed:", aiError);
      
      // --- FALLBACK LOGIC IF AI FAILS ---
      // Manually pick the top math-based candidate for Call and Put
      const bestCall = superCalls.length > 0 ? superCalls[0] : (topCalls[0] || null);
      const bestPut = superPuts.length > 0 ? superPuts[0] : (topPuts[0] || null);

      aiDecision = {
        call_suggestion: {
          decision: bestCall ? "BUY" : "WAIT",
          symbol: bestCall ? bestCall.symbol : null,
          max_entry_price: bestCall ? Math.floor(bestCall.data.price * 1.05) : 0,
          reasoning: bestCall 
            ? "هوش مصنوعی در دسترس نیست. این گزینه بر اساس محاسبات ریاضی (اهرم بالا و نوسان پایین) انتخاب شده است."
            : "گزینه مناسبی پیدا نشد."
        },
        put_suggestion: {
          decision: bestPut ? "BUY" : "WAIT",
          symbol: bestPut ? bestPut.symbol : null,
          max_entry_price: bestPut ? Math.floor(bestPut.data.price * 1.05) : 0,
          reasoning: bestPut 
            ? "هوش مصنوعی در دسترس نیست. این گزینه بر اساس محاسبات ریاضی (اهرم بالا و نوسان پایین) انتخاب شده است."
            : "گزینه مناسبی پیدا نشد."
        }
      };
    }

    // --- STEP 5: FINAL RESPONSE ---
    
    // Notify if we have Super Candidates OR if AI explicitly says BUY
    const shouldNotify = superCandidates.length > 0 || 
                         (aiDecision.call_suggestion.decision === 'BUY') || 
                         (aiDecision.put_suggestion.decision === 'BUY');

    return NextResponse.json({
      status: 'success',
      notify_me: shouldNotify,
      timestamp: new Date().toISOString(),
      counts: {
        super_calls: superCalls.length,
        super_puts: superPuts.length
      },
      ai_analysis: aiDecision,
      super_candidates: superCandidates, // Contains top 5 calls + top 5 puts
      raw_top_picks: {
        calls: topCalls,
        puts: topPuts
      }
    });

  } catch (error: any) {
    console.error('Critical Server Error:', error);
    return errorResponse("Internal Server Error", "INTERNAL_ERROR", 500, error.message);
  }
}
