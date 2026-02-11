/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/page.tsx
import { prisma } from '@/lib/prisma';
import { ThemeToggle, FilterBar } from './components/dashboard-ui';
import { startOfDay, startOfWeek, startOfMonth, subDays } from 'date-fns';
import { SignalRow } from './components/signalRow';
import { SignalList } from './components/SignalList';

interface PageProps {
  searchParams: Promise<{
    period?: string;
    type?: string;
  }>;
}

export default async function DashboardPage(props: PageProps) {
  // Await searchParams for Next.js 15/16
  const params = await props.searchParams;
  const period = params.period || 'all';
  const type = params.type || 'all';

  // 1. Build Filter Logic
  const whereClause: any = {};

  // Time Filter
  const now = new Date();
  if (period === 'today') whereClause.createdAt = { gte: startOfDay(now) };
  else if (period === 'week') whereClause.createdAt = { gte: startOfWeek(now) };
  else if (period === 'month')
    whereClause.createdAt = { gte: startOfMonth(now) };

  // Type Filter (Querying JSON fields is tricky, Prisma 5+ supports filtering JSON paths)
  // Simple heuristic: check if JSON string contains "BUY" for the specific type
  if (type === 'buy_call') {
    whereClause.callAdvice = { path: ['decision'], equals: 'BUY' };
  } else if (type === 'buy_put') {
    whereClause.putAdvice = { path: ['decision'], equals: 'BUY' };
  } else if (type === 'wait') {
    whereClause.AND = [
      { callAdvice: { path: ['decision'], equals: 'WAIT' } },
      { putAdvice: { path: ['decision'], equals: 'WAIT' } },
    ];
  }

  // 2. Fetch Data
  const signals = await prisma.talebSignal.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div
      className='min-h-screen bg-gray-50 dark:bg-black transition-colors'
      dir='rtl'
    >
      <div className='max-w-7xl mx-auto p-4 md:p-8 space-y-6'>
        {/* Header & Controls */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-sans'>
              پیشنهادات
            </h1>
            <p className='text-gray-500 dark:text-gray-400 mt-2 text-sm'>
              مانیتورینگ هوشمند بازار اختیار معامله (Option)
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <FilterBar />
            {/* <ThemeToggle /> */}
          </div>
        </div>

        {/* Data Table */}
        <div className='bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm text-right'>
              <thead className='bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800'>
                <tr>
                  <th className='px-6 py-4 whitespace-nowrap'>زمان</th>
                  <th className='px-6 py-4 whitespace-nowrap'>پیشنهاد Call</th>
                  <th className='px-6 py-4 whitespace-nowrap'>پیشنهاد Put</th>
                  <th className='px-6 py-4 whitespace-nowrap'>عملیات</th>
                </tr>
              </thead>

              <SignalList signals={signals} />
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
