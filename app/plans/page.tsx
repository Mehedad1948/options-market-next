// app/plans/page.tsx
import React from "react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { verifySession } from "@/lib/auth"; // Adjust path to your actual auth logic
import { cookies } from "next/headers";
import { Zap, Crown, Star, ArrowLeft, Gift } from "lucide-react";
import Image from 'next/image';

// Initialize Prisma (ensure this singleton pattern matches your project)
const prisma = new PrismaClient();

// Helper to calculate days remaining
function getDaysRemaining(expiryDate: Date | null): number {
    if (!expiryDate) return 0;
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    if (diffTime <= 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default async function PlansPage() {
    // 1. Authenticate User Server-Side
    let user = null;
    let daysLeft = 0;
    let planStatus = "Free"; // Free, Active, Expired

    const cookieStore = await cookies();
    const session = await verifySession(cookieStore.get("session")?.value);

    if (session?.userId) {
        user = await prisma.user.findUnique({
            where: { id: session.userId as string },
            select: {
                firstName: true,
                lastName: true,
                subscriptionExpiresAt: true,
                role: true,
            },
        });

        daysLeft = getDaysRemaining(user?.subscriptionExpiresAt || null);

        if (daysLeft > 0) planStatus = "Active";
        else if (user?.subscriptionExpiresAt) planStatus = "Expired";
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">

            {/* Background Decor */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-slate-800/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12 max-w-5xl">

                {/* --- 1. USER METRIC (Curved Indicator) - Only if Logged In --- */}
                {user && (
                    <div className="mb-16 bg-white dark:bg-slate-900 rounded-3xl p-8  border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">

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
                            {/* SVG Gauge */}
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100">
                                {/* Background Arc (Gray) */}
                                <path
                                    d="M 20 100 A 80 80 0 0 1 180 100"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    className="text-slate-200 dark:text-slate-800"
                                />
                                {/* Active Arc (Gradient) - Calculated based on a 30-day cap visual or just full if > 30 */}
                                <path
                                    d="M 20 100 A 80 80 0 0 1 180 100"
                                    fill="none"
                                    stroke="url(#gradientGauge)"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray="251.2" // Full arc length
                                    // Logic: simple visual representation. If daysLeft > 30, full bar. Else proportional.
                                    strokeDashoffset={251.2 - (251.2 * Math.min(daysLeft, 30) / 30)}
                                    className="transition-all duration-1000 ease-out"
                                />
                                <defs>
                                    <linearGradient id="gradientGauge" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#f59e0b" /> {/* Amber-500 */}
                                        <stop offset="100%" stopColor="#d97706" /> {/* Amber-600 */}
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Center Text in Gauge */}
                            <div className="absolute bottom-0 text-center">
                                <span className="text-4xl font-bold text-slate-800 dark:text-white block -mb-1">
                                    {daysLeft}
                                </span>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">روز باقی‌مانده</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 2. HEADER & 14-DAY TRIAL BANNER --- */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                        سرمایه‌گذاری روی <span className="text-amber-500">بینش</span>
                    </h1>

                    {/* 14 Days Free Banner for Newcomers */}
                    {!session?.userId && <div className="inline-flex items-center gap-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 px-6 py-3 rounded-full mt-4 animate-pulse-slow">
                        <Gift className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                        <span className="text-amber-800 dark:text-amber-200 font-medium">
                            تازه واردید؟ <span className="font-bold underline decoration-amber-500/50 underline-offset-4">۱۴ روز اشتراک رایگان</span> بعد از ثبت نام اولیه
                        </span>
                    </div>}
                </div>

                {/* --- 3. PRICING CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

                    {/* PLAN 1: MONTHLY */}
                    <PlanCard
                        title="اشتراک ماهانه"
                        price="۱۰۰,۰۰۰"
                        period="یک ماه"
                        icon={<Zap className="w-6 h-6" />}
                        highlight="شروع مسیر"
                        description="مناسب برای تست استراتژی‌ها و آشنایی با محیط."
                        buttonText="خرید اشتراک"
                        link="/payment/1-month" // Replace with actual payment link
                    />

                    {/* PLAN 2: 6 MONTHS */}
                    <PlanCard
                        title="اشتراک ۶ ماهه"
                        price="۵۰۰,۰۰۰"
                        originalPrice="۶۰۰,۰۰۰"
                        period="شش ماه"
                        badge="۱ ماه رایگان"
                        icon={<Star className="w-6 h-6" />}
                        highlight="اقتصادی"
                        description="پرداخت هزینه ۵ ماه، دریافت ۶ ماه سرویس کامل."
                        buttonText="خرید با تخفیف"
                        isPopular={false} // Mid tier
                        link="/payment/6-month"
                    />

                    {/* PLAN 3: YEARLY */}
                    <PlanCard
                        title="اشتراک سالانه"
                        price="۹۰۰,۰۰۰"
                        originalPrice="۱,۲۰۰,۰۰۰"
                        period="یک سال"
                        badge="۳ ماه رایگان" // Buy 9 get 3 free roughly
                        icon={<Crown className="w-6 h-6" />}
                        highlight="پیشنهاد حرفه‌ای‌ها"
                        description="بهترین ارزش خرید. ۳ ماه استفاده کاملاً رایگان."
                        buttonText="سرمایه‌گذاری هوشمند"
                        isPopular={true} // Highlighted
                        link="/payment/1-year"
                    />
                </div>

                {/* --- 4. FOOTER --- */}
                <div className="mt-16 text-center text-slate-500 text-sm">
                    {!session?.userId ? <Link href="/dashboard" className="inline-flex items-center gap-2 mt-4 text-amber-600 hover:text-amber-700 font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        بازگشت به داشبورد
                    </Link> :
                        <Link href="/" className="inline-flex items-center gap-2 mt-4 text-amber-600 hover:text-amber-700 font-medium">
                            <ArrowLeft className="w-4 h-4" />
                            بازگشت صفحه اصلی
                        </Link>}
                </div>


            </div>
        </div>
    );
}

// --- SUB-COMPONENT: PLAN CARD ---
interface PlanCardProps {
    title: string;
    price: string;
    originalPrice?: string;
    period: string;
    badge?: string;
    icon: React.ReactNode;
    highlight: string;
    description: string;
    buttonText: string;
    isPopular?: boolean;
    link: string;
}

function PlanCard({
    title,
    price,
    originalPrice,
    period,
    badge,
    icon,
    highlight,
    description,
    buttonText,
    isPopular = false,
    link
}: PlanCardProps) {
    return (
        <div className={`relative o flex flex-col p-6 rounded-3xl border transition-all duration-300 group
      ${isPopular
                ? "bg-slate-900 text-white shadow-2xl shadow-amber-500/20 border-amber-500/50 scale-105 z-10"
                : "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-lg border-slate-100 dark:border-slate-800 hover:border-amber-500/30"
            }
    `}>

            {/* <Image
                width={500}
                height={500}
                alt='options'
                src="/hero-2.png"
                className='absolute bottom-0 -rotate-6 translate-y-1/3 translate-x-1/3 z-0 grayscale right-0 w-full  opacity-10  dark:mix-blend-overlay'
            /> */}

            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        محبوب‌ترین انتخاب
                    </span>
                </div>
            )}

            {/* Top Section */}
            <div className="mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${isPopular ? "bg-amber-500/20 text-amber-500" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}>
                    {icon}
                </div>
                <div className="text-sm font-medium text-amber-500 mb-1">{highlight}</div>
                <h3 className="text-xl font-bold">{title}</h3>
            </div>

            {/* Pricing */}
            <div className="mb-6">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{price}</span>
                    <span className={`text-sm ${isPopular ? "text-slate-400" : "text-slate-500"}`}>تومان</span>
                </div>

                {originalPrice && (
                    <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="text-slate-400 line-through decoration-slate-400/50">{originalPrice}</span>
                        {badge && (
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${isPopular ? "bg-amber-500/20 text-amber-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                }`}>
                                {badge}
                            </span>
                        )}
                    </div>
                )}
                <div className="text-xs text-slate-400 mt-1">برای {period}</div>
            </div>

            {/* Description (Replaces Features List) */}
            <div className="flex-grow mb-8">
                <p className={`text-sm leading-relaxed ${isPopular ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                    {description}
                </p>
            </div>

            {/* Button */}
            <Link href={link} className={`w-full relative z-10 py-4 rounded-xl font-bold text-center transition-all ${isPopular
                ? "bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-lg shadow-amber-500/25"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                }`}>
                {buttonText}
            </Link>

        </div>
    );
}
