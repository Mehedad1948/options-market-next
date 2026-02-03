/* eslint-disable @typescript-eslint/no-explicit-any */

import iv from 'implied-volatility';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCubVc7Xso_Cr6ebxnFRPSwXW51lewGmVQ';
const API_URL = `https://BrsApi.ir/Api/Tsetmc/Option.php?key=${process.env.BRS_API_KEY || 'FreeWsXDnKpRTg7dfqRMzRlYSYeA83FN'}`;
const RISK_FREE_RATE = 0.3; 

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-pro' });

const cleanNum = (val: any) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  return parseFloat(val.toString().replace(/,/g, ''));
};

export async function GET() {
  let topPicks: any[] = [];
  let superCandidates: any[] = [];
  let aiDecision = null;

  try {
    console.log('1. Fetching market data...');
    const response = await axios.get(API_URL);
    const rawData = response.data;

    if (!Array.isArray(rawData)) {
      return NextResponse.json({ error: 'Invalid API response structure' }, { status: 500 });
    }

    // --- STEP 1: MATH & PROCESSING ---
    const candidates = rawData
      .map((option) => {
        const spotPrice = cleanNum(option.base_pc);
        const strikePrice = cleanNum(option.price_strike);
        const optionPrice = cleanNum(option.pc);
        const daysRemain = cleanNum(option.day_remain);
        const openInterest = cleanNum(option.interest_open);

        if (daysRemain <= 2 || optionPrice <= 0 || spotPrice <= 0 || openInterest < 10) return null;

        const isCall = option.type && option.type.toLowerCase().includes('call');
        const typeStr = isCall ? 'call' : 'put';
        const T = daysRemain / 365.0;

        let impliedVol = 0;
        try {
          impliedVol = iv.getImpliedVolatility(optionPrice, spotPrice, strikePrice, T, RISK_FREE_RATE, typeStr);
        } catch (e) { impliedVol = 0; }

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

    // --- STEP 2: FILTERS ---
    const filteredCandidates = candidates.filter((c: any) => {
      const d = c.data;
      if (d.openInterest < 100) return false;
      if (d.type === 'call' && (d.moneyness < 0.05 || d.moneyness > 0.40)) return false;
      if (d.type === 'put' && (d.moneyness > -0.05 || d.moneyness < -0.40)) return false;
      if (d.price > 8000) return false;
      if (d.iv <= 0 || d.iv > 2.0) return false;
      return true;
    });

    // --- STEP 3: SNIPER MODE & SORTING ---
    superCandidates = filteredCandidates.filter((c: any) => 
        c.data.gearing > 10 && c.data.iv < 1.0 
    );

    filteredCandidates.sort((a: any, b: any) => {
      const scoreA = a.data.gearing / (a.data.iv || 1);
      const scoreB = b.data.gearing / (b.data.iv || 1);
      return scoreB - scoreA;
    });

    topPicks = filteredCandidates.slice(0, 10);

    if (topPicks.length === 0) {
      return NextResponse.json({
        status: 'success',
        notify_me: false,
        action: 'WAIT',
        message: 'No candidates found.',
      });
    }

    // --- STEP 4: AI ANALYSIS ---
    try {
      const marketDataStr = topPicks.map((c, index) => {
          return `
CANDIDATE ${index + 1} (${c.data.type.toUpperCase()}):
- Symbol: ${c.symbol}
- Current Price: ${c.data.price}
- Strike: ${c.data.strike}
- Leverage: ${c.data.gearing.toFixed(1)}x
- IV: ${(c.data.iv * 100).toFixed(1)}%
          `.trim();
        }).join('\n\n');

      // UPDATED PROMPT: Request max_entry_price
      const prompt = `
        You are Nassim Taleb. Analyze these Iranian Market Options.
        
        Candidates:
        ${marketDataStr}

        INSTRUCTIONS:
        1. Identify the best asymmetric bet (High Leverage + Low IV).
        2. **Determine Entry Price:** Illiquid markets have large spreads. Suggest a 'max_entry_price' (Limit Order). This should be the Current Price + max 5-10% buffer to ensure a fill without overpaying. 
        3. If no candidate is good, decide WAIT.

        OUTPUT JSON ONLY:
        {
            "decision": "BUY" or "WAIT",
            "symbol": "Symbol",
            "max_entry_price": number (integer),
            "reasoning": "Brief explanation."
        }
      `;

      console.log('3. Consulting Gemini...');
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      aiDecision = JSON.parse(cleanJson);

    } catch (aiError) {
      console.error("AI Analysis Failed:", aiError);
      
      // FALLBACK LOGIC: Calculate Max Price manually
      const bestCandidate = superCandidates.length > 0 ? superCandidates[0] : null;
      
      aiDecision = {
        decision: bestCandidate ? "BUY" : "WAIT",
        symbol: bestCandidate ? bestCandidate.symbol : null,
        // Fallback: Current Price + 5% wiggle room
        max_entry_price: bestCandidate ? Math.floor(bestCandidate.data.price * 1.05) : 0, 
        reasoning: "AI Failed. Falling back to Super-Standard math (Lev > 10, IV < 1).",
        error_note: "Gemini unavailable."
      };
    }

    const shouldNotify = superCandidates.length > 0 || (aiDecision?.decision === 'BUY');

    return NextResponse.json({
      status: 'success',
      notify_me: shouldNotify,
      ai_analysis: aiDecision,
      super_candidates: superCandidates,
      top_technical_picks: topPicks,
    });

  } catch (error: any) {
    console.error('Critical API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
