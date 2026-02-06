import { getSession } from '@/lib/auth';
import { ChartNoAxesCombined } from "lucide-react";
import Link from 'next/link';

export async function DashboardLink() {
    const session = await getSession()
    return session && (
        <Link
            href={`/dashboard`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all border
            
            /* Light Mode: Subtle amber background with darker text */
            bg-amber-50 text-amber-700 border-amber-200 
            hover:bg-amber-100 hover:border-amber-300 hover:text-amber-800 hover:shadow-sm
            
            /* Dark Mode: Translucent glow with bright amber text */
            dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800/50 
            dark:hover:bg-amber-900/20 dark:hover:border-amber-700 dark:hover:text-amber-300"
        >
            <ChartNoAxesCombined className="w-4 h-4" />
            <span className="hidden sm:inline">داشبورد</span>
        </Link>
    );
}
