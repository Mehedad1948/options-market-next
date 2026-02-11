'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Create URL for a specific page
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(createPageURL(newPage));
  };

  // Logic to determine which page numbers to show (Sliding window of 5)
  const pageNumbers = useMemo(() => {
    const maxVisible = 5;

    // If total pages are less than max visible, show all
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calculate start and end based on current page to keep it centered
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);

    // Adjust if we are near the end (e.g. showing pages 8,9,10,11,12)
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className='flex flex-col items-center justify-center py-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-2xl'>
      {/* Mobile View: Simple Previous/Next */}
      <div className='flex w-full justify-between px-6 sm:hidden'>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className='flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          قبلی
        </button>
        <div className='text-sm text-gray-500 self-center'>
          {currentPage} / {totalPages}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className='flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          بعدی
        </button>
      </div>

      {/* Desktop View: Numbered List */}
      <div className='hidden sm:flex  px-4 justify-between w-full sm:items-center sm:gap-2'>
        <p className='text-sm text-gray-500 dark:text-gray-400 ml-4'>
          صفحه{' '}
          <span className='font-semibold text-gray-900 dark:text-white'>
            {currentPage}
          </span>{' '}
          از {totalPages}
        </p>

        <nav
          className='isolate inline-flex gap-2'
          dir='ltr'
          aria-label='Pagination'
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className='inline-flex items-center justify-center w-9 h-9 text-gray-500 bg-transparent rounded-lg  hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all'
            aria-label='Previous page'
          >
            <ChevronLeft className='w-5 h-5' />
          </button>

          {/* Page Numbers */}
          {pageNumbers.map((page) => {
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={cn(
                  'inline-flex cursor-pointer items-center justify-center w-9 h-9 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:ring-offset-1 dark:focus:ring-offset-gray-900',
                  isActive
                    ? 'bg-amber-400 text-white border-t border-white/40 shadow-[0_4px_12px_rgba(251,191,36,0.35)] backdrop-blur-md scale-105'
                    : 'text-gray-500 bg-transparent hover:bg-amber-50 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-amber-400',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className='inline-flex items-center justify-center w-9 h-9 text-gray-500 bg-transparent rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all'
            aria-label='Next page'
          >
            <ChevronRight className='w-5 h-5' />
          </button>
        </nav>
      </div>
    </div>
  );
}
