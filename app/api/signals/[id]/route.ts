import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const signalId = (await params).id;

    // Optional: Validate if ID is a number (if your DB uses Auto-Increment IDs)
    // If your DB uses UUID/CUID (Strings), remove this check and the parseInt

    // 2. Fetch Single Signal
    const signal = await prisma.talebSignal.findUnique({
      where: {
        id: signalId, // Use 'signalId' directly if using UUIDs
      },
      // We explicitly select fields.
      // IMPORTANT: Here we fetch the full 'candidates' object to show details
      select: {
        id: true,
        createdAt: true,
        marketStatus: true,
        aiReasoning: true,
        callAdvice: true,
        putAdvice: true,
        candidates: true, // Fetching the FULL data for the details view
      },
    });

    // 3. Handle Not Found
    if (!signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }

    // 4. Return Data
    // We don't need to map/transform here because we want the raw data for the details page
    return NextResponse.json(signal);
  } catch (error) {
    console.error(`Error fetching signal:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
