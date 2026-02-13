import { getSession } from '@/lib/auth';
import { SignalServices } from '@/lib/services/signals.service';
import { connection } from 'next/server'; // Assuming this is your DB connection helper
import { NextRequest, NextResponse } from 'next/server';

// Initialize the service

export async function GET(request: NextRequest) {
  await connection();

  try {
    const session = await getSession();


    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Parse Query Parameters from the URL
    const searchParams = request.nextUrl.searchParams;

    const serviceParams = {
      page: searchParams.get('page') || 1,
      period: searchParams.get('period') || 'all',
      type: searchParams.get('type') || 'all',
    };

    // 2. Fetch Data using the Service
    // The service handles the Prisma query, filtering, and pagination logic
    const { data: rawSignals, meta } =
      await SignalServices.getLatest(serviceParams);

    // 3. Transform Data
    // We iterate over the results from the service to format them
    // and calculate the candidatesCount logic specific to this API endpoint.
    const signals = rawSignals.map((signal) => {
      let count = 0;

      // Safely determine array length regardless of Prisma JSON type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const candidates = signal.candidates as any;

      if (Array.isArray(candidates)) {
        count = candidates.length;
      } else if (typeof candidates === 'object' && candidates !== null) {
        // Handle case where it might be an object-wrapped list
        count = Object.keys(candidates).length;
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

    // 4. Return Data AND Metadata
    // Since we are now paginating, it is best practice to return the meta info
    // so the client knows how many pages exist.
    return NextResponse.json({
      data: signals,
      meta: meta,
    });
  } catch (error) {
    console.error('Error fetching Taleb signals:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
