import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    // 1. Auth Check
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch from TalebSignal
    const signals = await prisma.talebSignal.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        createdAt: true,
        marketStatus: true,
        aiReasoning: true,
        callAdvice: true, // Returns JSON object
        putAdvice: true,  // Returns JSON object
        // candidates: false, // Too large for the popup list, usually not needed
      },
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
