import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';
// You likely import your prisma client instance like this.
// Adjust the path to match your project structure.
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { cacheLife, cacheTag } from 'next/cache';

interface GetLatestParams {
  page?: number | string;
  period?: string; // 'today' | 'week' | 'month' | 'all'
  type?: string; // 'buy_call' | 'buy_put' | 'wait' | 'all'
}

export class SignalServices {
  /**
   * Retrieves paginated and filtered signal data.
   */
  static async getLatest(params: GetLatestParams) {
    'use cache';
    cacheLife('hours');
    cacheTag('signals');
    // 1. Pagination Logic
    const page = Number(params.page) || 1;
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const period = params.period || 'all';
    const type = params.type || 'all';

    // 2. Build Filter Logic
    // We use Prisma.TalebSignalWhereInput for better type safety,
    // or keep it as 'any' if your schema is complex.
    const whereClause: Prisma.TalebSignalWhereInput = {};

    const now = new Date();

    // --- DATE FILTERING ---
    if (period === 'today') {
      whereClause.createdAt = { gte: startOfDay(now) };
    } else if (period === 'week') {
      whereClause.createdAt = { gte: startOfWeek(now) };
    } else if (period === 'month') {
      whereClause.createdAt = { gte: startOfMonth(now) };
    }

    // --- TYPE FILTERING LOGIC ---
    if (type === 'buy_call') {
      whereClause.callAdvice = { path: ['decision'], equals: 'BUY' };
    } else if (type === 'buy_put') {
      whereClause.putAdvice = { path: ['decision'], equals: 'BUY' };
    } else if (type === 'wait') {
      // If user explicitly asks for "wait", show ONLY double waits
      whereClause.AND = [
        { callAdvice: { path: ['decision'], equals: 'WAIT' } },
        { putAdvice: { path: ['decision'], equals: 'WAIT' } },
      ];
    } else {
      // DEFAULT (type == 'all'):
      // Exclude rows where BOTH are 'WAIT'
      whereClause.NOT = {
        AND: [
          { callAdvice: { path: ['decision'], equals: 'WAIT' } },
          { putAdvice: { path: ['decision'], equals: 'WAIT' } },
        ],
      };
    }

    // 3. Fetch Data & Count (Parallel for performance)
    const [signals, totalCount] = await prisma.$transaction([
      prisma.talebSignal.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: pageSize,
      }),
      prisma.talebSignal.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    // 4. Return formatted response
    return {
      data: signals,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
