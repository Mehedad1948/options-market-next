import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    // 1. Auth Check
    const session = await verifyAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch from TalebSignal
    // We fetch 'candidates' here to count them, but we won't send the full array to client
    const rawSignals = await prisma.talebSignal.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        createdAt: true,
        marketStatus: true,
        aiReasoning: true,
        callAdvice: true,
        putAdvice: true,
        candidates: true, // Fetching to count length
      },
    });

    // 3. Transform Data (Calculate Count & Remove Heavy Array)
    const signals = rawSignals.map(signal => {
      let count = 0;
      
      // Safely determine array length regardless of Prisma JSON type
      if (Array.isArray(signal.candidates)) {
        count = signal.candidates.length;
      } else if (typeof signal.candidates === 'object' && signal.candidates !== null) {
        // Handle case where it might be an object-wrapped list
        count = Object.keys(signal.candidates).length;
      }

      return {
        id: signal.id,
        createdAt: signal.createdAt,
        marketStatus: signal.marketStatus,
        aiReasoning: signal.aiReasoning,
        callAdvice: signal.callAdvice,
        putAdvice: signal.putAdvice,
        candidatesCount: count, // Sending only the number
      };
    });

    return NextResponse.json(signals);
  } catch (error) {
    console.error('Error fetching Taleb signals:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
