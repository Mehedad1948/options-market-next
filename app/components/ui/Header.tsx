import Link from "next/link";
import { BotButton } from "./bot-link";
import { UserMenu } from "./user-menu";
import { Loader2 } from "lucide-react";
import { DashboardLink } from './dashboard-link';
import { ExtensionLink } from './extension-link';
import { Suspense } from 'react';
import { ThemeToggle } from './ThemeToggle';
import Logo from './Logo';

export default function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
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
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Suspense fallback={<div className='bg-amber-50 animate-pulse w-24 h-9 rounded-xl'></div>}>
            <DashboardLink />
          </Suspense>

          <ExtensionLink />

          <BotButton />

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block mx-1"></div>

          <Suspense fallback={<Loader2 className='animate-spin text-amber-400' />}>
            <UserMenu />
          </Suspense>
        </div>

      </div>
    </header>
  );
}
