// app/dashboard/components/dashboard-ui.tsx
'use client';

import { clsx, type ClassValue } from 'clsx';
import {
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Moon, Sun,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { DetailsModal } from './details-modal';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatPrice = (price?: number) => {
  if (!price) return '-';
  return new Intl.NumberFormat('fa-IR').format(price) + ' ریال';
};

// --- 1. Theme Toggle Component ---
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

// --- 2. Filter Bar Component ---
export function FilterBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    replace(`${pathname}?${params.toString()}`);
  };




  return (
    <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-2 px-2 text-gray-500 dark:text-gray-400">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">فیلترها:</span>
      </div>

      <select
        className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm p-2 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
        onChange={(e) => handleFilter('period', e.target.value)}
        defaultValue={searchParams.get('period') || 'all'}
      >
        <option value="all">همه زمان‌ها</option>
        <option value="today">امروز</option>
        <option value="week">هفته جاری</option>
        <option value="month">ماه جاری</option>
      </select>

      <select
        className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm p-2 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
        onChange={(e) => handleFilter('type', e.target.value)}
        defaultValue={searchParams.get('type') || 'all'}
      >
        <option value="all">همه سیگنال‌ها</option>
        <option value="buy_call">خرید (Call)</option>
        <option value="buy_put">فروش (Put)</option>
        <option value="wait">صبر</option>
      </select>
    </div>
  );
}



// --- 4. Main Table Row Wrapper (to handle Modal state) ---
export function SignalRow({ signal, formattedDate, marketIsOpen, call, put }: any) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <tr className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">

        {/* Date */}
        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">
          {formattedDate}
        </td>

        {/* Market Status */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border",
            marketIsOpen
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
          )}>
            {marketIsOpen ? '🟢 باز' : '🔴 بسته'}
          </span>
        </td>

        {/* Call Strategy */}
        <td className="px-6 py-4">
          <SignalBadge type="CALL" data={call} />
        </td>

        {/* Put Strategy */}
        <td className="px-6 py-4">
          <SignalBadge type="PUT" data={put} />
        </td>

        {/* Notification */}
        <td className="px-6 py-4 text-center">
          {signal.sentNotification ? (
            <CheckCircle className="w-5 h-5 text-blue-500 mx-auto" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 inline-block" />
          )}
        </td>

        {/* Actions */}
        <td className="px-6 py-4">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md"
          >
            <Eye className="w-4 h-4" />
            جزئیات
          </button>
        </td>
      </tr>

      <DetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={{ ...signal, callAdvice: call, putAdvice: put }}
      />
    </>
  );
}

function SignalBadge({ type, data }: { type: 'CALL' | 'PUT', data: any }) {
  if (!data) return <span className="text-gray-300 dark:text-gray-600 text-xs">-</span>;
  const isBuy = data.decision === 'BUY';
  const isCall = type === 'CALL';

  if (!isBuy) {
    return (
      <div className="flex items-center text-gray-400 dark:text-gray-500 text-xs bg-gray-50 dark:bg-gray-800 px-2 py-1.5 rounded-md w-fit">
        <Clock className="w-3.5 h-3.5 ml-1.5" />
        <span>صبر</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col border-r-2 pr-3 py-1",
      isCall ? "border-emerald-500" : "border-rose-500"
    )}>
      <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-100 text-sm">
        {isCall ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
        <span dir="ltr" className="text-sm uppercase tracking-wider">{data.symbol}</span>
      </div>
      <div className="text-green-500 underline-offset-8 underline dark:text-gray-400 mt-1.5 font-bold">
        {formatPrice(data.entry_price)}
      </div>
    </div>
  );
}
