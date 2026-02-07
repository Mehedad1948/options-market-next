// app/dashboard/components/dashboard-ui.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  Moon, Sun, Filter, X, Eye, 
  TrendingUp, TrendingDown, Clock, CheckCircle 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

// --- 3. Details Modal Component ---
export function DetailsModal({ isOpen, onClose, data }: { isOpen: boolean; onClose: () => void; data: any }) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">جزئیات تحلیل تکنیکال و هوش مصنوعی</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 text-right" dir="rtl">
          
          {/* AI Reasoning */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <h4 className="text-blue-800 dark:text-blue-300 font-bold mb-2 flex items-center gap-2">
               تحلیل هوش مصنوعی
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-8 text-justify">
              {data.aiReasoning}
            </p>
          </div>

          {/* Raw Data (Candidates) - Showing Advice Objects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Call Details */}
            <div className="border dark:border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-bold">
                 <TrendingUp className="w-4 h-4" /> استراتژی Call
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">تصیمیم:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{data.callAdvice?.decision}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">نماد:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{data.callAdvice?.symbol || '-'}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-gray-500">قیمت پیشنهادی:</span>
                   <span className="font-bold text-gray-900 dark:text-white">{formatPrice(data.callAdvice?.entry_price)}</span>
                </div>
              </div>
            </div>

            {/* Put Details */}
            <div className="border dark:border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3 text-rose-600 dark:text-rose-400 font-bold">
                 <TrendingDown className="w-4 h-4" /> استراتژی Put
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">تصیمیم:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{data.putAdvice?.decision}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">نماد:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{data.putAdvice?.symbol || '-'}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-gray-500">قیمت پیشنهادی:</span>
                   <span className="font-bold text-gray-900 dark:text-white">{formatPrice(data.putAdvice?.entry_price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Candidates Log (If you add this field later to DB) */}
          {/* 
          <div className="mt-4">
             <h4 className="font-bold text-gray-900 dark:text-white mb-2">لیست کاندیداها:</h4>
             <pre className="bg-gray-100 dark:bg-black p-4 rounded-lg text-xs font-mono overflow-auto max-h-40" dir="ltr">
               {JSON.stringify(data.candidates, null, 2)}
             </pre>
          </div> 
          */}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            بستن
          </button>
        </div>
      </div>
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
        data={{...signal, callAdvice: call, putAdvice: put}} 
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
