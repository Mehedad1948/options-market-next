// app/dashboard/page.tsx
import { prisma } from '@/lib/prisma';
import { FilterBar } from './components/dashboard-ui';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { SignalList } from './components/SignalList';
import { Pagination } from './components/Pagination'; // Import the new component
import { SignalServices } from '@/lib/services/signals.service';


// Instantiate the service (or use dependency injection if set up)

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage(props: PageProps) {
  const params = await props.searchParams;
  
  const { data: signals, meta } = await SignalServices.getLatest({
    page: params.page as string,
    period: params.period as string,
    type: params.type as string,
  });

  // 2. Extract metadata for the UI
  const page = meta.currentPage;
  const totalPages = meta.totalPages;

  return (
    <div className='min-h-screen pt-14 md:pt-12 bg-gray-50 dark:bg-black transition-colors' dir='rtl'>
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
