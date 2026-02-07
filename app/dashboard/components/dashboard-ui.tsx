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
        
        {/* CORRECTED LABELS BELOW */}
        <option value="buy_call">خرید Call (صعودی)</option>
        <option value="buy_put">خرید Put (نزولی)</option>
        
        <option value="wait">صبر (Wait)</option>
      </select>
    </div>
  );
}


