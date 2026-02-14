/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/components/dashboard-ui.tsx
'use client';

import { useEffect, useState } from 'react';
import { useQueryState } from 'nuqs';
import {
  Activity,
  AlertTriangle,
  Gauge,
  Info,
  Layers,
  Search,
  TrendingDown,
  TrendingUp,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
  Clock,
} from 'lucide-react';

// --- Helpers ---

const formatPrice = (price?: number) => {
  if (!price) return '-';
  return new Intl.NumberFormat('fa-IR').format(price);
};

const formatPersianDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// --- Tag Configuration ---
const TAG_CONFIG: Record<string, { label: string; icon: any }> = {
  risk_level: { label: 'سطح ریسک', icon: AlertTriangle },
  iv_status: { label: 'وضعیت نوسان (IV)', icon: Activity },
  leverage: { label: 'اهرم پیشنهادی', icon: Gauge },
  leverage_tag: { label: 'اهرم', icon: Gauge },
  market_cap: { label: 'ارزش بازار', icon: Layers },
  default: { label: 'شاخص', icon: Info },
};

const getTagStyle = (key: string, value: string) => {
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
  return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700';
};

// --- Main Component ---

interface DetailsModalProps {
  initialData?: any;
}

export function DetailsModal({ initialData }: DetailsModalProps) {
  // 1. Manage State with URL
  const [signalId, setSignalId] = useQueryState('signalId');

  console.log('🐞🐞🐞', initialData);

  // Internal state for fetching
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isOpen = !!signalId || !!initialData;

  // 2. Close Handler
  const onClose = () => {
    setSignalId(null);
    setFetchedData(null);
    setError('');
  };

  // 3. Fetch Logic
  useEffect(() => {
    if (!signalId) return;

    // A. Use Initial Data if it matches the requested ID
    if (initialData && String(initialData.id) === signalId) {
      setFetchedData(initialData);
      setLoading(false);
      return;
    }

    // B. Otherwise, Fetch from API
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/signals/${signalId}`);
        if (!res.ok) throw new Error('Failed to load signal');

        const data = await res.json();
        setFetchedData(data);
      } catch (err) {
        console.error(err);
        setError('خطا در دریافت اطلاعات سیگنال');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [signalId, initialData]);

  // Determine what to show
  const displayData =
    initialData && String(initialData.id) === signalId
      ? initialData
      : fetchedData;

  // Early Return
  if (!isOpen) return null;

  // --- Sub-renderers ---

  const renderCandidateSection = (
    title: string,
    items: any[],
    type: 'CALL' | 'PUT',
  ) => {
    if (!items || items.length === 0) return null;

    const isCall = type === 'CALL';
    const HeaderIcon = isCall ? ArrowUpCircle : ArrowDownCircle;
    const headerColor = isCall
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-rose-600 dark:text-rose-400';
    const itemBorderHover = isCall
      ? 'hover:border-emerald-300 dark:hover:border-emerald-700'
      : 'hover:border-rose-300 dark:hover:border-rose-700';

    return (
      <div className='mt-6'>
        <h4
          className={`font-bold mb-3 flex items-center gap-2 text-base md:text-lg ${headerColor}`}
        >
          <HeaderIcon className='w-4 h-4 md:w-5 md:h-5' />
          {title}
        </h4>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3'>
          {items.map((item: any, index: number) => {
            const symbol = item.symbol || '---';
            const price = item.data?.price || item.price;

            return (
              <div
                key={index}
                className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-2 md:p-3 flex flex-col items-center justify-center text-center transition-all shadow-sm ${itemBorderHover}`}
              >
                <span className='font-black text-gray-800 dark:text-gray-100 font-mono text-base md:text-lg mb-1 tracking-tight'>
                  {symbol}
                </span>
                {price !== undefined && (
                  <div className='text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md'>
                    <span className='text-[10px] md:text-xs'>ریال</span>
                    {formatPrice(price)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAdviceCard = (type: 'CALL' | 'PUT', advice: any) => {
    if (!advice) return null;
    const isCall = type === 'CALL';
    const isBuy = advice.decision === 'BUY';

    const accentColor = isCall
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-purple-600 dark:text-purple-400';
    const borderColor = isCall
      ? 'border-emerald-200 dark:border-emerald-900'
      : 'border-purple-200 dark:border-purple-900';
    const bgHeader = isCall
      ? 'bg-emerald-50 dark:bg-emerald-900/10'
      : 'bg-purple-50 dark:bg-purple-900/10';

    return (
      <div
        className={`w-full border rounded-2xl overflow-hidden flex flex-col ${borderColor} dark:bg-gray-900/50 shadow-sm mb-4 md:mb-6`}
      >
        {/* Card Header */}
        <div
          className={`p-3 md:p-4 ${bgHeader} border-b ${borderColor} flex justify-between items-center`}
        >
          <div
            className={`flex items-center gap-2 font-bold text-base md:text-lg ${accentColor}`}
          >
            {isCall ? (
              <TrendingUp className='w-5 h-5 md:w-6 md:h-6' />
            ) : (
              <TrendingDown className='w-5 h-5 md:w-6 md:h-6' />
            )}
            {advice.title || `استراتژی ${type}`}
          </div>
          <span
            className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-bold shadow-sm ${isBuy ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}
          >
            {advice.decision}
          </span>
        </div>

        {/* Card Body */}
        <div className='p-3 md:p-5 space-y-4 md:space-y-6'>
          {/* Price & Symbol Row */}
          <div className='flex justify-between items-end border-b border-gray-100 dark:border-gray-800 pb-3 md:pb-5'>
            <div>
              <p className='text-xs md:text-sm text-gray-500 mb-1'>
                نماد منتخب
              </p>
              <p className='text-lg md:text-xl font-black text-gray-900 dark:text-white font-mono tracking-tighter'>
                {advice.symbol || '---'}
              </p>
            </div>
            <div className='text-left'>
              <p className='text-xs md:text-sm text-gray-500 mb-1'>قیمت ورود</p>
              <p className='text-lg md:text-2xl font-bold text-gray-900 dark:text-white'>
                {formatPrice(advice.entry_price)}{' '}
                <span className='text-xs md:text-sm font-normal text-gray-400'>
                  ریال
                </span>
              </p>
            </div>
          </div>

          {/* Tags Grid */}
          {advice.tags && (
            <div className='grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4'>
              {Object.entries(advice.tags).map(([key, value]: any) => {
                const config = TAG_CONFIG[key] || TAG_CONFIG.default;
                const Icon = config.icon;
                return (
                  <div
                    key={key}
                    className={`p-2 md:p-3 rounded-xl border flex flex-col gap-1.5 md:gap-2 ${getTagStyle(key, value)}`}
                  >
                    <div className='flex items-center gap-1.5 opacity-80'>
                      <Icon className='w-3.5 h-3.5 md:w-4 md:h-4' />
                      <span className='text-[10px] md:text-xs font-bold'>
                        {config.label}
                      </span>
                    </div>
                    <span
                      className='text-xs md:text-sm font-black text-right truncate leading-tight'
                      title={value}
                    >
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Scenarios / Strategy Desc */}
          {(advice.profit_scenario || advice.strategy_desc) && (
            <div className='bg-gray-50 dark:bg-gray-800/40 p-3 md:p-4 rounded-xl text-xs md:text-sm space-y-2 md:space-y-3 border border-gray-100 dark:border-gray-800'>
              {advice.profit_scenario && (
                <div className='flex gap-2 text-amber-600 dark:text-amber-400 items-start'>
                  <AlertTriangle className='w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5' />
                  <span className='font-bold text-sm md:text-base'>
                    سناریو سود: {advice.profit_scenario}
                  </span>
                </div>
              )}
              {advice.strategy_desc && (
                <p className='text-gray-600 dark:text-gray-300 text-sm md:text-base leading-6 md:leading-7 text-justify'>
                  {advice.strategy_desc}
                </p>
              )}
            </div>
          )}

          {/* Reasoning Text */}
          {advice.reasoning && (
            <div>
              <p className='text-xs md:text-sm font-bold text-gray-400 mb-1.5 md:mb-2'>
                تحلیل تکنیکال:
              </p>
              <p className='text-sm md:text-base text-gray-800 dark:text-gray-200 leading-7 md:leading-8 text-justify font-medium'>
                {advice.reasoning}
              </p>
            </div>
          )}

          {/* --- NEW: Enriched Candidate Details (Grid Layout) --- */}
          {advice.candidate_details && advice.candidate_details.length > 0 && (
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 mb-1'>
              {advice.candidate_details.map(
                (item: {
                  key: string;
                  class: string;
                  label: string;
                  value: string;
                }) => (
                  <div
                    key={item.key}
                    className='flex flex-col justify-center bg-gray-50 rounded px-2 py-1.5 border border-gray-100 hover:bg-gray-100 transition-colors'
                  >
                    {/* Label: Tiny text for mobile (10px), small for desktop */}
                    <span className='text-[10px] md:text-xs text-gray-500 font-medium truncate mb-0.5'>
                      {item.label}
                    </span>

                    {/* Value: Bold mono, force LTR for numbers */}
                    <span
                      className={`text-xs md:text-sm font-bold font-mono tracking-tight ${item.class}`}
                      dir='ltr'
                    >
                      {item.value}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Main Return (JSX) ---
  return (
    <div
      className='fixed inset-0 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'
      style={{ zIndex: 9999 }}
    >
      <div
        onClick={onClose}
        className='w-full h-full absolute z-0 top-0 left-0'
      ></div>

      {/* Container Card */}
      <div className='bg-white z-10 dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800 relative'>
        {/* --- Header --- */}
        <div className='flex items-center justify-between p-4 md:p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10'>
          <div className='flex flex-col gap-1'>
            <h3 className='text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
              <Info className='w-5 h-5 md:w-7 md:h-7 text-blue-600' />
              جزئیات و تحلیل استراتژی
            </h3>
            {/* DATE BADGE */}
            {!loading && displayData?.createdAt && (
              <div className='flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 mr-7 md:mr-9'>
                <Clock className='w-3 h-3 md:w-3.5 md:h-3.5' />
                <span>{formatPersianDate(displayData.createdAt)}</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className='p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors'
          >
            <X className='w-5 h-5 md:w-6 md:h-6 text-gray-500' />
          </button>
        </div>

        {/* --- Content Area --- */}
        <div
          className='p-3 md:p-8 overflow-y-auto space-y-4 md:space-y-8 text-right bg-gray-50/50 dark:bg-black/20 flex-grow'
          dir='rtl'
        >
          {/* Loading State */}
          {loading && (
            <div className='flex flex-col items-center justify-center h-64 gap-4 text-gray-500'>
              <Loader2 className='w-8 h-8 md:w-10 md:h-10 animate-spin text-blue-600' />
              <p className='text-xs md:text-sm font-medium animate-pulse'>
                در حال دریافت اطلاعات...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className='flex flex-col items-center justify-center h-64 gap-4 text-red-500'>
              <AlertTriangle className='w-8 h-8 md:w-10 md:h-10' />
              <p className='text-sm md:text-base'>{error}</p>
              <button
                onClick={onClose}
                className='text-blue-600 underline text-xs md:text-sm'
              >
                بستن
              </button>
            </div>
          )}

          {/* Data Content */}
          {!loading && !error && displayData && (
            <>
              {/* Section 1: General Market Sentiment */}
              {displayData.aiReasoning && (
                <div className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 md:p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm'>
                  <h4 className='text-blue-800 dark:text-blue-300 font-bold mb-2 md:mb-4 flex items-center gap-2 text-base md:text-lg'>
                    🧠 تحلیل کلی بازار (Market Sentiment)
                  </h4>
                  <p className='text-sm md:text-base text-gray-800 dark:text-gray-100 leading-7 md:leading-9 text-justify font-medium'>
                    {displayData.aiReasoning}
                  </p>
                </div>
              )}

              {/* Section 2: Strategy Cards */}
              <div className='flex flex-col gap-2'>
                {displayData.callAdvice.decision !== 'WAIT' &&
                  renderAdviceCard('CALL', displayData.callAdvice)}
                {displayData.putAdvice.decision !== 'WAIT' &&
                  renderAdviceCard('PUT', displayData.putAdvice)}
              </div>

              {/* Section 3: Candidates Lists */}
              {(displayData.candidates?.calls?.length > 0 ||
                displayData.candidates?.puts?.length > 0) && (
                <div className='border-t border-gray-200 dark:border-gray-800 pt-4 md:pt-8'>
                  <div className='flex items-center gap-2 mb-3 md:mb-6 opacity-70'>
                    <Search className='w-5 h-5 md:w-6 md:h-6' />
                    <h3 className='text-sm md:text-base font-bold text-gray-900 dark:text-white'>
                      بررسی سایر نمادها
                    </h3>
                  </div>

                  {renderCandidateSection(
                    'سایر فرصت‌های خرید (Calls)',
                    displayData.candidates.calls,
                    'CALL',
                  )}
                  {renderCandidateSection(
                    'سایر فرصت‌های فروش (Puts)',
                    displayData.candidates.puts,
                    'PUT',
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* --- Footer --- */}
        <div className='p-3 md:p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex justify-end gap-3 sticky bottom-0'>
          <button
            onClick={onClose}
            className='px-6 py-2.5 md:px-8 md:py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-sm md:text-base font-bold hover:opacity-90 transition-all shadow-lg hover:shadowxl transform active:scale-95'
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
}
