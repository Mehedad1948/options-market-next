/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { SignalRow } from './signalRow';
import { DetailsModal } from './details-modal';

interface SignalListProps {
  signals: any[];
}

export function SignalList({ signals }: SignalListProps) {
  // 1. Listen to URL state
  const [signalId] = useQueryState('signalId');

  // 2. Derive the active signal data
  const activeSignal = useMemo(() => {
    if (!signalId) return null;
    return signals.find((s) => String(s.id) === signalId);
  }, [signalId, signals]);

  const handleRowClick = (data: any) => {
    // Optional: Add analytics here
    console.log('Row clicked:', data.id);
  };

  return (
    <>
      <tbody className='bg-white dark:bg-gray-900'>
        {signals.map((signal) => (
          <SignalRow
            key={signal.id}
            signal={signal}
            call={signal.callAdvice}
            put={signal.putAdvice}
            date={signal.createdAt}
            onClick={handleRowClick}
          />
        ))}

        {signals.length === 0 && (
          <tr>
            <td
              colSpan={6}
              className='px-6 py-16 text-center text-gray-500 dark:text-gray-400'
            >
              داده‌ای با این فیلترها در این صفحه یافت نشد.
            </td>
          </tr>
        )}
      </tbody>

      {/* 
         If activeSignal is found in current list, pass it as initialData.
         If not found (e.g. valid ID in URL but on different page), activeSignal is undefined.
         The Modal should ideally handle fetching by ID itself if initialData is missing, 
         or simply not render. Assuming here we render it only if we have data or let the Modal handle null.
      */}
      {signalId && (
        <DetailsModal
          initialData={
            activeSignal
              ? {
                  ...activeSignal,
                  callAdvice: activeSignal.callAdvice,
                  putAdvice: activeSignal.putAdvice,
                }
              : null
          }
        />
      )}
    </>
  );
}
