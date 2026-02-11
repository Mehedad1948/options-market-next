/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { clsx, type ClassValue } from 'clsx';
import { Eye, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useState, MouseEvent } from 'react';
import { twMerge } from 'tailwind-merge';
import { DetailsModal } from './details-modal';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatPrice = (price?: number) => {
  if (price === undefined || price === null) return '-';
  return new Intl.NumberFormat('fa-IR').format(price);
};

const toPersianDigits = (num: number) => {
  return new Intl.NumberFormat('fa-IR').format(num);
};

// --- Helper: Date & Relative Time Logic ---
const getDateTimeInfo = (dateInput: string | Date) => {
  if (!dateInput)
    return {
      mainLabel: '-',
      subLabel: '',
      className: 'text-gray-400',
      isToday: false,
    };

  const d = new Date(dateInput);
  const now = new Date();

  // Formatters
  const dateFormatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const timeFormatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const inputDateString = dateFormatter.format(d);
  const todayString = dateFormatter.format(now);

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayString = dateFormatter.format(yesterdayDate);

  // 1. Logic for TODAY (Relative Time)
  if (inputDateString === todayString) {
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);

    let relativeLabel = '';

    if (diffInMinutes < 1) {
      relativeLabel = 'همین الان';
    } else if (diffInMinutes < 60) {
      relativeLabel = `${toPersianDigits(diffInMinutes)} دقیقه پیش`;
    } else {
      relativeLabel = `${toPersianDigits(diffInHours)} ساعت پیش`;
    }

    return {
      mainLabel: 'امروز',
      subLabel: relativeLabel,
      className: 'text-emerald-600 dark:text-emerald-400 font-extrabold',
      isToday: true,
    };
  }

  // 2. Logic for YESTERDAY
  if (inputDateString === yesterdayString) {
    return {
      mainLabel: 'دیروز',
      subLabel: timeFormatter.format(d), // Show explicit time for yesterday
      className: 'text-amber-600 dark:text-amber-400 font-bold',
      isToday: false,
    };
  }

  // 3. Logic for OLDER dates
  return {
    mainLabel: inputDateString,
    subLabel: timeFormatter.format(d),
    className: 'text-gray-600 dark:text-gray-400 font-medium',
    isToday: false,
  };
};

// --- Component ---

import { useQueryState } from 'nuqs'; // Import nuqs

interface SignalRowProps {
  signal: any;
  date: string;
  call: any;
  put: any;
  onClick: (data: any) => void; // The callback function
}

export function SignalRow({
  signal,
  date,
  call,
  put,
  onClick,
}: SignalRowProps) {
  // We still keep nuqs here to know which row is "active" for styling purposes
  const [signalId, setSignalId] = useQueryState('signalId');

  // Logic for suggestions
  const hasSuggestion = call?.decision === 'BUY' || put?.decision === 'BUY';
  const isStraddle = call?.decision === 'BUY' && put?.decision === 'BUY';

  // Check if THIS specific row is currently active in the URL
  const isRowActive = signalId === String(signal.id);

  // Get Date Info
  const { mainLabel, subLabel, className, isToday } = getDateTimeInfo(date);

  // Prepare the full data object to pass to the parent
  const fullSignalData = {
    ...signal,
    callAdvice: call,
    putAdvice: put,
  };

  // Click Handler: Update URL and call the parent's callback
  const handleRowClick = () => {
    if (hasSuggestion) {
      onClick(fullSignalData); // Pass the data up to the parent
      setSignalId(String(signal.id)); // Set the URL param for styling
    }
  };

  // Button Handler: Same logic, but stops event propagation
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the row's onClick from firing twice
    onClick(fullSignalData);
    setSignalId(String(signal.id));
  };

  return (
    <tr
      onClick={handleRowClick}
      className={cn(
        'transition-all border-b border-gray-100 dark:border-gray-800 last:border-0 relative group',
        // Highlight active row if its modal is open
        isRowActive ? 'bg-blue-50/50 dark:bg-blue-900/10' : '',

        // Right border logic for Today
        isToday
          ? 'border-r-4 border-r-emerald-500 bg-emerald-50/10'
          : 'border-r-4 border-r-transparent',

        hasSuggestion ? 'cursor-pointer' : '',
        // Hover effects
        !isRowActive && isStraddle
          ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
          : !isRowActive &&
              hasSuggestion &&
              'hover:bg-gray-50 dark:hover:bg-gray-800/50',
      )}
    >
      {/* Date Column */}
      <td className='px-6 py-4 whitespace-nowrap text-right'>
        <div
          className={cn(
            'flex items-center gap-2',
            'flex-col items-start gap-1',
          )}
        >
          <span className={cn('text-sm', className)}>{mainLabel}</span>
          <span
            className={cn(
              'text-xs dir-ltr text-right',
              isToday
                ? 'text-emerald-600/70 dark:text-emerald-400/70 font-medium'
                : 'text-gray-400 dark:text-gray-500',
            )}
          >
            {subLabel}
          </span>
        </div>
      </td>

      {/* Strategies - Call */}
      <td className='px-6 py-4'>
        <SignalBadge type='CALL' data={call} />
      </td>

      {/* Strategies - Put */}
      <td className='px-6 py-4'>
        <SignalBadge type='PUT' data={put} />
      </td>

      {/* Actions */}
      <td className='px-6 py-4 text-left w-12'>
        {hasSuggestion && (
          <button
            onClick={handleButtonClick}
            className='text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
          >
            <Eye className='w-5 h-5' />
          </button>
        )}
      </td>
    </tr>
  );
}

function SignalBadge({ type, data }: { type: 'CALL' | 'PUT'; data: any }) {
  const isBuy = data?.decision === 'BUY';
  const isCall = type === 'CALL';

  if (!isBuy) {
    return (
      <div className='flex items-center gap-2.5 opacity-60 select-none'>
        <div className='w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0'>
          <Minus className='w-4 h-4 text-gray-400 dark:text-gray-500' />
        </div>
        <span className='text-xs font-medium text-gray-400 dark:text-gray-500'>
          فعلاً خبری نیست
        </span>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-3 group/badge'>
      <div
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-transform group-hover/badge:scale-110 shadow-sm',
          isCall
            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
            : 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
        )}
      >
        {isCall ? (
          <TrendingUp className='w-5 h-5' />
        ) : (
          <TrendingDown className='w-5 h-5' />
        )}
      </div>

      <div className='flex flex-col justify-center'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide'>
            {data.symbol}
          </span>
          <span
            className={cn(
              'text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider',
              isCall
                ? 'text-emerald-700 bg-emerald-100/50 dark:bg-transparent dark:text-emerald-500'
                : 'text-violet-700 bg-violet-100/50 dark:bg-transparent dark:text-violet-500',
            )}
          >
            {isCall ? 'Call' : 'Put'}
          </span>
        </div>

        <div className='flex items-baseline gap-1'>
          <span
            className={cn(
              'text-base font-black font-mono',
              isCall
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-violet-700 dark:text-violet-400',
            )}
          >
            {formatPrice(data.entry_price)}
          </span>
          <span className='text-[10px] text-gray-400 dark:text-gray-500'>
            ریال
          </span>
        </div>
      </div>
    </div>
  );
}
