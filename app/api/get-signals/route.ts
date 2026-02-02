/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import axios from 'axios';
import iv from 'implied-volatility';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIGURATION ---
// Ideally, put this in your .env.local file: GEMINI_API_KEY=AIzaSy...
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || 'AIzaSyCubVc7Xso_Cr6ebxnFRPSwXW51lewGmVQ';

const API_URL = `https://BrsApi.ir/Api/Tsetmc/Option.php?key=${process.env.BRS_API_KEY}`;
const RISK_FREE_RATE = 0.3; // 30% Risk-free rate

// --- SETUP GEMINI SDK ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
});

// --- HELPER: Parse numbers safely ---
const cleanNum = (val: any) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  return parseFloat(val.toString().replace(/,/g, ''));
};

// --- NEXT.JS ROUTE HANDLER ---
export async function GET() {
  try {
    console.log('1. Fetching market data...');
    const response = await axios.get(API_URL);
    const rawData = response.data;

    if (!Array.isArray(rawData)) {
      return NextResponse.json(
        { error: 'Invalid API response structure' },
        { status: 500 },
      );
    }

    // --- STEP 1: MATH & BLACK-SCHOLES ---
    const candidates = rawData
      .map((option) => {
        const spotPrice = cleanNum(option.base_pc);
        const strikePrice = cleanNum(option.price_strike);
        const optionPrice = cleanNum(option.pc);
        const daysRemain = cleanNum(option.day_remain);
        const openInterest = cleanNum(option.interest_open);

        // Filter out noise immediately
        if (
          daysRemain <= 2 ||
          optionPrice <= 0 ||
          spotPrice <= 0 ||
          openInterest < 10
        )
          return null;

        const isCall =
          option.type && option.type.toLowerCase().includes('call');
        const typeStr = isCall ? 'call' : 'put';
        const T = daysRemain / 365.0;

        // Calculate IV
        let impliedVol = 0;
        try {
          // implied-volatility lib might throw errors on extreme values
          impliedVol = iv.getImpliedVolatility(
            optionPrice,
            spotPrice,
            strikePrice,
            T,
            RISK_FREE_RATE,
            typeStr,
          );
        } catch (e) {
          impliedVol = 0;
        }

        // Metrics
        const moneynessPct = strikePrice / spotPrice - 1; // >0 means OTM for Call
        const gearing = spotPrice / optionPrice; // Leverage

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
    const filteredCandidates = candidates.filter((c) => {
      const d = c.data;

      // 1. Liquidity
      if (d.openInterest < 100) return false;

      // 2. OTM Calls (Convexity) - 5% to 40% OTM
      if (d.type !== 'call') return false;
      if (d.moneyness < 0.05 || d.moneyness > 0.4) return false;

      // 3. Cheap Premium
      if (d.price > 8000) return false;

      // 4. Reasonable IV (Don't buy panic)
      if (d.iv <= 0 || d.iv > 2.0) return false;

      return true;
    });

    // --- STEP 3: RANKING ---
    // Rank by Leverage / IV
    filteredCandidates.sort((a, b) => {
      const scoreA = a.data.gearing / (a.data.iv || 1);
      const scoreB = b.data.gearing / (b.data.iv || 1);
      return scoreB - scoreA;
    });

    const topPicks = filteredCandidates.slice(0, 10);

    // If no candidates found
    if (topPicks.length === 0) {
      return NextResponse.json({
        status: 'success',
        action: 'WAIT',
        message: 'No candidates meet Taleb criteria today.',
      });
    }

    // --- STEP 4: PREPARE GEMINI PROMPT ---
    const marketDataStr = topPicks
      .map((c, index) => {
        return `
CANDIDATE ${index + 1}:
- Symbol: ${c.symbol} (Underlying: ${c.base})
- Price: ${c.data.price} (Spot: ${c.data.spot})
- Strike: ${c.data.strike} (${(c.data.moneyness * 100).toFixed(1)}% OTM)
- Leverage: ${c.data.gearing.toFixed(1)}x
- IV: ${(c.data.iv * 100).toFixed(1)}%
- Days to Expiry: ${c.data.days}
- Open Interest: ${c.data.openInterest}
            `.trim();
      })
      .join('\n\n');

    const prompt = `
        You are an AI assistant mimicking Nassim Nicholas Taleb. 
        Your Strategy: The Barbell / Anti-fragile. 
        Goal: Buy cheap OTM options with high convexity (limited downside, unlimited upside).
        
        Here are the top filtered candidates from the Iranian Option Market:
        ${marketDataStr}

        INSTRUCTIONS:
        1. Analyze the risk/reward. High Leverage and Low IV are best.
        2. Select the SINGLE BEST option to buy.
        3. If all look like bad bets (too expensive or liquidity too low), output "WAIT".

        OUTPUT FORMAT:
        Return a valid JSON object ONLY. Do not write markdown or extra text.
        {
            "decision": "BUY" or "WAIT",
            "symbol": "Symbol Name",
            "reasoning": "A short, sharp explanation of why this offers the best convexity."
        }
        `;

    console.log('3. Consulting Gemini...');

    // --- STEP 5: CALL GEMINI SDK ---
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Cleanup JSON
    const cleanJson = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let aiDecision;
    try {
      aiDecision = JSON.parse(cleanJson);
    } catch (e) {
      aiDecision = { error: 'Failed to parse AI response', raw: responseText };
    }

    // --- STEP 6: RESPONSE ---
    return NextResponse.json({
      status: 'success',
      candidates_scanned: candidates.length,
      candidates_filtered: filteredCandidates.length,
      ai_analysis: aiDecision,
      top_technical_picks: topPicks,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
