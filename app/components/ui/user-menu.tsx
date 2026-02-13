'use client'

import Link from "next/link";
import { LogIn, User as UserIcon, Clock, AlertTriangle } from "lucide-react";
import { useUser } from '@/app/providers/user-context';
import { usePathname } from 'next/navigation';

export  function UserMenu() {
  const user = useUser()

  const pathname = usePathname()

  // --- GUEST STATE ---
  if (!user && !pathname.includes('login')) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-xl transition-all shadow-sm"
      >
        <LogIn className="w-4 h-4" />
        <span>ورود به حساب</span>
      </Link>
    );
  }


  if (!user) return null;

  // Calculate Subscription Status
  const now = new Date();
  const expiry = new Date(user.subscriptionExpiresAt || 0);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isExpired = diffDays <= 0;
  const isWarning = diffDays > 0 && diffDays < 7; // Less than 1 week

  // Persian Date Formatter
  const formattedDate = new Intl.DateTimeFormat('fa-IR').format(expiry);

  return (
    <div className="flex items-center gap-3 md:gap-4">

      {/* Subscription Badge */}
      <Link href={'/plans'} className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border
        ${isExpired
          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
          : isWarning
            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
            : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
        }
      `}>
        {isWarning || isExpired ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">
          {isExpired
            ? "اشتراک تمام شده"
            : `${diffDays} روز باقی‌مانده`
          }
        </span>
        <span className="sm:hidden">
          {diffDays} روز
        </span>
      </Link>

      {/* User Info */}
      <Link href={'/profile'} className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
          <UserIcon className="w-4 h-4" />
        </div>
        <div className="flex flex-col text-right hidden md:flex">
          <span className="text-xs font-bold truncate max-w-[100px]">
            {user.firstName || "کاربر عزیز"}
          </span>
          <span className="text-[10px] text-gray-400 font-mono" dir="ltr">
            {user.phoneNumber || "---"}
          </span>
        </div>
      </Link>
    </div>
  );
}
