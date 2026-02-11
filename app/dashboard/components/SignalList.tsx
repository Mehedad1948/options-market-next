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
  // We look through the passed 'signals' array to find the one matching the URL ID.
  // This handles both clicking a row AND refreshing the page with an ID in the URL.
  const activeSignal = useMemo(() => {
    if (!signalId) return null;
    return signals.find((s) => String(s.id) === signalId);
  }, [signalId, signals]);

  // 3. Callback for the row (Optional if we rely purely on URL, but good for immediate feedback)
  const handleRowClick = (data: any) => {
    // The Row component already handles setting the URL via setSignalId.
    // We can add extra logic here if needed (e.g., analytics),
    // otherwise the URL change triggers the 'activeSignal' recalculation above.
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
              داده‌ای با این فیلترها یافت نشد.
            </td>
          </tr>
        )}
      </tbody>

      {/* 
        4. The Modal sits here. 
        It renders whenever 'activeSignal' is found (via URL).
        Since standard Modals use React Portals, rendering it here inside the fragment 
        won't break the HTML table structure.
      */}
      {
        <DetailsModal
          initialData={ activeSignal ?{
            ...activeSignal,
            // Ensure strictly consistent naming with what Modal expects
            callAdvice: activeSignal?.callAdvice,
            putAdvice: activeSignal?.putAdvice,
          }: null}
        />
      }
    </>
  );
}
