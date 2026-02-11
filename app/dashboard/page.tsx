// app/dashboard/page.tsx
import { prisma } from '@/lib/prisma';
import { FilterBar } from './components/dashboard-ui';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { SignalList } from './components/SignalList';
import { Pagination } from './components/Pagination'; // Import the new component

interface PageProps {
  searchParams: Promise<{
    period?: string;
    type?: string;
    page?: string; // Add page param
  }>;
}

export default async function DashboardPage(props: PageProps) {
   const params = await props.searchParams;
  
  // 1. Parse Pagination Params
  const page = Number(params.page) || 1;
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const period = params.period || 'all';
  const type = params.type || 'all';

  // 2. Build Filter Logic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {};

  const now = new Date();
  if (period === 'today') whereClause.createdAt = { gte: startOfDay(now) };
  else if (period === 'week') whereClause.createdAt = { gte: startOfWeek(now) };
  else if (period === 'month') whereClause.createdAt = { gte: startOfMonth(now) };

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
      ]
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

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-black transition-colors' dir='rtl'>
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

              {/* Pass signals to the list */}
              <SignalList signals={signals} />
            </table>
          </div>
          
          {/* Pagination Controls */}
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
