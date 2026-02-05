'use client';

import { Gift, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '../providers/user-context';

// Helper Logic
function getDaysRemaining(expiryDate: Date | null | string): number {
  if (!expiryDate) return 0;
  // Handle both Date object and ISO string (from JSON serialization)
  const expiry = new Date(expiryDate); 
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  if (diffTime <= 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function UserSubscriptionGauge() {
  const user = useUser();

  // If not logged in, render nothing
  if (!user) return null;

  const daysLeft = getDaysRemaining(user.subscriptionExpiresAt);

  return (
    <div className="mb-16 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* Text Info */}
      <div className="z-10 text-center md:text-right">
        <h2 className="text-2xl font-bold mb-2">
          سلام {user.firstName || "همراه عزیز"}،
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          {daysLeft > 0
            ? "اشتراک شما فعال است. از شکار فرصت‌ها لذت ببرید."
            : "اشتراک شما به پایان رسیده است. برای ادامه تمدید کنید."}
        </p>
      </div>

      {/* CURVED GAUGE INDICATOR */}
      <div className="relative w-48 h-24 flex justify-center items-end">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            className="text-slate-200 dark:text-slate-800"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gradientGauge)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (251.2 * Math.min(daysLeft, 30) / 30)}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradientGauge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute bottom-0 text-center">
          <span className="text-4xl font-bold text-slate-800 dark:text-white block -mb-1">
            {daysLeft}
          </span>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">روز باقی‌مانده</span>
        </div>
      </div>
    </div>
  );
}

export function PromotionalHeader() {
  const user = useUser();

  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
        سرمایه‌گذاری روی <span className="text-amber-500">بینش</span>
      </h1>

      {/* Show only if NOT logged in */}
      {!user && (
        <div className="inline-flex items-center gap-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 px-6 py-3 rounded-full mt-4 animate-pulse-slow">
          <Gift className="w-5 h-5 text-amber-600 dark:text-amber-500" />
          <span className="text-amber-800 dark:text-amber-200 font-medium">
            تازه واردید؟ <span className="font-bold underline decoration-amber-500/50 underline-offset-4">۱۴ روز اشتراک رایگان</span> بعد از ثبت نام اولیه
          </span>
        </div>
      )}
    </div>
  );
}

export function NavigationFooter() {
  const user = useUser();
  const linkTarget = user ? '/' : '/dashboard';
  const linkText = user ? 'بازگشت صفحه اصلی' : 'بازگشت به داشبورد';

  return (
    <div className="mt-16 text-center text-slate-500 text-sm">
      <Link href={linkTarget} className="inline-flex items-center gap-2 mt-4 text-amber-600 hover:text-amber-700 font-medium">
        <ArrowLeft className="w-4 h-4" />
        {linkText}
      </Link>
    </div>
  );
}
