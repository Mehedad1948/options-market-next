// app/dashboard/components/dashboard-ui.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Moon, Sun, Filter, X, Eye,
  TrendingUp, TrendingDown, Clock, CheckCircle,
  AlertTriangle,
  Tag,
  Info,
  DollarSign,
  Search,
  Activity,
  Gauge,
  Layers
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

const TAG_CONFIG: Record<string, { label: string; icon: any }> = {
  risk_level: { label: 'سطح ریسک', icon: AlertTriangle },
  iv_status: { label: 'وضعیت نوسان (IV)', icon: Activity },
  leverage: { label: 'اهرم پیشنهادی', icon: Gauge },
  market_cap: { label: 'ارزش بازار', icon: Layers },
  // Fallback for unknown tags
  default: { label: 'سایر شاخص‌ها', icon: Info }
};

const getTagStyle = (key: string, value: string) => {
  // Logic for coloring based on value content
  if (key === 'risk_level') {
    return value.includes('پر')
      ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
  }
  if (key === 'iv_status') {
    return value.includes('ارزان')
      ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
      : 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
  }
  // Default Style
  return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700';
};

// --- Component ---

export function DetailsModal({ isOpen, onClose, data }: { isOpen: boolean; onClose: () => void; data: any }) {
  if (!isOpen || !data) return null;

  // Render Advice Card (Call/Put)
  const renderAdviceCard = (type: 'CALL' | 'PUT', advice: any) => {
    if (!advice) return null;
    const isCall = type === 'CALL';
    const isBuy = advice.decision === 'BUY';

    // Theme colors
    const accentColor = isCall ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
    const borderColor = isCall ? 'border-emerald-200 dark:border-emerald-900' : 'border-rose-200 dark:border-rose-900';
    const bgHeader = isCall ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-rose-50 dark:bg-rose-900/10';

    return (
      <div className={`border rounded-2xl overflow-hidden flex flex-col ${borderColor} dark:bg-gray-900/50 shadow-sm`}>
        {/* Card Header */}
        <div className={`p-4 ${bgHeader} border-b ${borderColor} flex justify-between items-center`}>
          <div className={`flex items-center gap-2 font-bold text-lg ${accentColor}`}>
            {isCall ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {advice.title || `استراتژی ${type}`}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isBuy ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
            {advice.decision}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-5 flex-1">
          {/* 1. Key Info Row (Symbol & Price) */}
          <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">نماد منتخب</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
                {advice.symbol || '---'}
              </p>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500 mb-1">قیمت ورود</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(advice.entry_price)} <span className="text-xs font-normal text-gray-400">ریال</span>
              </p>
            </div>
          </div>

          {/* 2. Detailed Tags Grid (Metrics) */}
          {advice.tags && (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(advice.tags).map(([key, value]: any) => {
                const config = TAG_CONFIG[key] || TAG_CONFIG.default;
                const Icon = config.icon;
                return (
                  <div
                    key={key}
                    className={`p-2 rounded-lg border flex flex-col gap-1 ${getTagStyle(key, value)}`}
                  >
                    <div className="flex items-center gap-1.5 opacity-80">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold">{config.label}</span>
                    </div>
                    <span className="text-xs font-bold text-right pr-1 truncate" title={value}>
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. Strategy Context */}
          {(advice.profit_scenario || advice.strategy_desc) && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-xs space-y-2 border border-gray-100 dark:border-gray-800">
              {advice.profit_scenario && (
                <div className="flex gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="font-medium">
                    سناریو سود: {advice.profit_scenario}
                  </span>
                </div>
              )}
              {advice.strategy_desc && (
                <p className="text-gray-500 dark:text-gray-400 leading-5 text-justify">
                  {advice.strategy_desc}
                </p>
              )}
            </div>
          )}

          {/* 4. AI Reasoning */}
          {advice.reasoning && (
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">تحلیل تکنیکال:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-6 text-justify">
                {advice.reasoning}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" style={{ zIndex: 9999 }}>
      {/* Container */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-600" />
            جزئیات و تحلیل استراتژی
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 text-right" dir="rtl">

          {/* Section 1: General Market Sentiment */}
          {data.aiReasoning && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
              <h4 className="text-blue-800 dark:text-blue-300 font-bold mb-3 flex items-center gap-2 text-lg">
                🧠 تحلیل کلی بازار (Market Sentiment)
              </h4>
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-8 text-justify font-medium">
                {data.aiReasoning}
              </p>
            </div>
          )}

          {/* Section 2: Strategy Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderAdviceCard('CALL', data.callAdvice)}
            {renderAdviceCard('PUT', data.putAdvice)}
          </div>

          {/* Section 3: Candidates List */}
          {data.candidates && data.candidates.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <h4 className="text-gray-800 dark:text-gray-200 font-bold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-500" />
                سایر نامزدهای بررسی شده
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {data.candidates.map((candidate: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="font-bold text-gray-900 dark:text-white font-mono text-lg mb-1">
                      {candidate.symbol || candidate} {/* Handle if simple string or object */}
                    </span>
                    {candidate.price && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatPrice(candidate.price)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform active:scale-95"
          >
            بستن پنجره
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
