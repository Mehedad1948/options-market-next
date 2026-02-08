import Link from "next/link";
import { BotButton } from "./bot-link";
import { UserMenu } from "./user-menu";
import { BarChart3 } from "lucide-react";
import { DashboardLink } from './dashboard-link';
import { Suspense } from 'react';
import { ThemeToggle } from './ThemeToggle';
import Logo from './Logo';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between" dir="rtl">

        {/* RIGHT SIDE: Logo & Title */}
        <div className='flex items-center gap-4 ml-2'>
          <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
             <Logo className='w-6'  />
            <span className="text-lg md:block hidden font-black tracking-tight text-gray-900 dark:text-white">
              آپشن‌<span className="text-amber-600">یار</span>
            </span>
          </Link>

          <ThemeToggle />
        </div>

        {/* LEFT SIDE: Actions */}
        <div className="flex items-center gap-3 md:gap-6">
          <Suspense>
            <DashboardLink />
          </Suspense>

          <BotButton />

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

          <Suspense>
            <UserMenu />
          </Suspense>
        </div>

      </div>
    </header>
  );
}
