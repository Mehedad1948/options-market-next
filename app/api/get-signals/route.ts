/* eslint-disable @typescript-eslint/no-explicit-any */

import iv from 'implied-volatility';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCubVc7Xso_Cr6ebxnFRPSwXW51lewGmVQ';
// Ensure we use the user's API key if provided in env, else fallback (though fallback usually fails in prod)
const API_URL = `https://BrsApi.ir/Api/Tsetmc/Option.php?key=${process.env.BRS_API_KEY || 'FreeWsXDnKpRTg7dfqRMzRlYSYeA83FN'}`;
const RISK_FREE_RATE = 0.3; // 30%

// --- SETUP GEMINI ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-1.5-pro', // 1.5-pro is usually better for reasoning than flash
});

// --- HELPER: Parse numbers safely ---
const cleanNum = (val: any) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  return parseFloat(val.toString().replace(/,/g, ''));
};

export async function GET() {
  // Initialize response variables
  let topPicks: any[] = [];
  let superCandidates: any[] = [];
  let aiDecision = null;

  try {
    console.log('1. Fetching market data...');
    const response = await axios.get(API_URL);
    const rawData = response.data;

    if (!Array.isArray(rawData)) {
      return NextResponse.json(
        { error: 'Invalid API response structure' },
        { status: 500 }
      );
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
        if (
          daysRemain <= 2 ||
          optionPrice <= 0 ||
          spotPrice <= 0 ||
          openInterest < 10
        )
          return null;

        const isCall = option.type && option.type.toLowerCase().includes('call');
        const typeStr = isCall ? 'call' : 'put';
        const T = daysRemain / 365.0;

        // Calculate IV
        let impliedVol = 0;
        try {
          impliedVol = iv.getImpliedVolatility(
            optionPrice,
            spotPrice,
            strikePrice,
            T,
            RISK_FREE_RATE,
            typeStr
          );
        } catch (e) {
          impliedVol = 0;
        }

        // Metrics
        // Call OTM: Strike > Spot (Positive %)
        // Put OTM: Strike < Spot (Negative %)
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
      // Call: 5% to 40% OTM
      // Put: -5% to -40% OTM
      if (d.type === 'call' && (d.moneyness < 0.05 || d.moneyness > 0.40)) return false;
      if (d.type === 'put' && (d.moneyness > -0.05 || d.moneyness < -0.40)) return false;

      // 3. Cheap Premium
      if (d.price > 8000) return false;

      // 4. Reasonable IV
      if (d.iv <= 0 || d.iv > 2.0) return false;

      return true;
    });

    // --- STEP 3: IDENTIFY "SUPER STANDARDS" (SNIPER MODE) ---
    // These are mathematically undeniable bets. 
    superCandidates = filteredCandidates.filter((c: any) => 
        c.data.gearing > 10 && // Massive Leverage
        c.data.iv < 1.0        // Cheap Volatility
    );

    // Sort general list by Score (Leverage / IV)
    filteredCandidates.sort((a: any, b: any) => {
      const scoreA = a.data.gearing / (a.data.iv || 1);
      const scoreB = b.data.gearing / (b.data.iv || 1);
      return scoreB - scoreA;
    });

    topPicks = filteredCandidates.slice(0, 10);

    // Early Exit if market is boring
    if (topPicks.length === 0) {
      return NextResponse.json({
        status: 'success',
        notify_me: false,
        action: 'WAIT',
        message: 'No candidates meet basic Taleb criteria.',
      });
    }

    // --- STEP 4: AI ANALYSIS (With Fail-Safe) ---
    try {
      const marketDataStr = topPicks
        .map((c, index) => {
          const otmStr = (Math.abs(c.data.moneyness) * 100).toFixed(1);
          return `
CANDIDATE ${index + 1} (${c.data.type.toUpperCase()}):
- Symbol: ${c.symbol} (Underlying: ${c.base})
- Price: ${c.data.price} (Spot: ${c.data.spot})
- Strike: ${c.data.strike} (${otmStr}% OTM)
- Leverage: ${c.data.gearing.toFixed(1)}x
- IV: ${(c.data.iv * 100).toFixed(1)}%
- Days to Expiry: ${c.data.days}
          `.trim();
        })
        .join('\n\n');

      const prompt = `
        You are Nassim Taleb. Analyze these Iranian Market Options.
        Strategy: Convexity. We want limited loss, unlimited gain.
        
        Candidates:
        ${marketDataStr}

        INSTRUCTIONS:
        1. Identify the option with the best asymmetry (High Leverage + Low IV).
        2. Consider Puts (Crash bet) vs Calls (Boom bet).
        3. If one stands out, BUY. If all are mediocre, WAIT.

        OUTPUT JSON ONLY:
        {
            "decision": "BUY" or "WAIT",
            "symbol": "Symbol",
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
      // Fallback: If AI fails but we have candidates, set a manual decision
      aiDecision = {
        decision: superCandidates.length > 0 ? "BUY" : "WAIT",
        symbol: superCandidates.length > 0 ? superCandidates[0].symbol : null,
        reasoning: "AI Service Unavailable. Decision based on raw Super-Standard filters.",
        error_note: "Gemini analysis failed."
      };
    }

    // --- STEP 5: FINAL RESPONSE ---
    
    // Logic for Notification:
    // 1. If 'Super Candidates' exist (Math says YES).
    // 2. OR If AI explicitly says BUY.
    const shouldNotify = superCandidates.length > 0 || (aiDecision?.decision === 'BUY');

    return NextResponse.json({
      status: 'success',
      notify: shouldNotify, // <--- CRONJOB LOOKS AT THIS
      super_candidates_count: superCandidates.length,
      ai_analysis: aiDecision,
      super_candidates: superCandidates, // Detailed list of the "Amazing" ones
      top_technical_picks: topPicks,     // The list sent to AI
    });

  } catch (error: any) {
    console.error('Critical API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
