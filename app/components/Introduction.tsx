import { BarChart, BrainCircuit, Calculator, Filter, ShieldCheck, Zap } from 'lucide-react';

// --- Reusable Component: Strategy Card (The "Illustrations") ---
const StrategyCard = ({
    title,
    subtitle,
    icon: Icon,
    colorClass,
    bgClass,
    description
}: {
    title: string;
    subtitle: string;
    icon: any;
    colorClass: string;
    bgClass: string;
    description: string;
}) => (
    <div className={`relative group p-8 rounded-3xl border border-slate-200 dark:border-slate-700 ${bgClass} transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}>
        <div className={`absolute top-6 left-6 w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass} bg-opacity-20`}>
            <Icon className={`w-7 h-7 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <div className="mt-12">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
            <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                {description}
            </p>
        </div>
        {/* Abstract Decorative Element */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Icon className="w-40 h-40 -mr-10 -mb-10 text-slate-900" />
        </div>
    </div>
);

// --- Reusable Component: Process Step (The Technical Details) ---
const ProcessStep = ({ number, title, desc, icon: Icon }: { number: string, title: string, desc: string, icon: any }) => (
    <div className="flex flex-col items-center text-center relative z-10">
        <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-7 h-7 text-slate-600 dark:text-slate-300" />
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-full text-xs font-bold text-slate-500 mb-3">
            مرحله {number}
        </div>
        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
            {desc}
        </p>
    </div>
);

export const WhatWeDoSection = () => {
    return (
        <section className="relative py-24 lg:py-32  overflow-hidden dir-rtl">
            {/* Background Decor */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl translate-x-[-50%] translate-y-[-50%]" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl translate-x-[50%] translate-y-[50%]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">

                {/* --- 1. HEADLINE & PHILOSOPHY --- */}
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black leading-tight text-slate-900 dark:text-white mb-8">
                        شکارِ
                        <span className="relative inline-block mx-2">
                            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                                بیمه‌های ارزان
                            </span>
                            <span className="absolute bottom-1 right-0 w-full h-3 bg-amber-200 dark:bg-amber-900/40 -z-10 -rotate-1 rounded-full"></span>
                        </span>
                        برای طوفان‌های بازار
                    </h2>

                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed text-justify md:text-center max-w-3xl mx-auto">
                        ما تلاش نمی‌کنیم آینده را پیش‌بینی کنیم. ما خود را برای آن آماده می‌کنیم.
                        این استراتژی بر اساس فلسفه «پاداش نامتقارن» بنا شده است.
                        <br className="hidden md:block" />
                        ما آگاهانه <strong className="text-slate-800 dark:text-slate-100 bg-slate-200/50 dark:bg-slate-800 px-1 rounded">زیان‌های کوچک و منظم را می‌پذیریم</strong> و آن را هزینه‌ی کسب‌وکار می‌دانیم؛
                        هزینه‌ای ضروری برای اینکه در زمان وقوع رویدادهای نادر، در درست‌ترین سمت بازار ایستاده باشیم.
                    </p>
                </div>

                {/* --- 2. THE VISUAL STRATEGIES (Playful Placement) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-5xl mx-auto mb-24">

                    {/* Card 1: Call */}
                    <StrategyCard
                        title="پتانسیل رشد شارپ"
                        subtitle="Explosive Upside"
                        icon={Zap}
                        bgClass="bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/10"
                        colorClass="bg-emerald-500 text-emerald-600"
                        description="شناسایی آپشن‌های Call که به دلیل ترس یا نادیده گرفته شدن بازار، ارزان قیمت‌گذاری شده‌اند اما پتانسیل جهش‌های چند برابری در صورت حرکت صعودی دارایی پایه را دارند."
                    />

                    {/* Card 2: Put */}
                    <div className="md:mt-12"> {/* Offset effect for playful layout */}
                        <StrategyCard
                            title="بیمه در مقابل سقوط"
                            subtitle="Crash Insurance"
                            icon={ShieldCheck}
                            bgClass="bg-gradient-to-br from-white to-violet-50/50 dark:from-slate-800 dark:to-violet-900/10"
                            colorClass="bg-violet-500 text-violet-600"
                            description="خرید آپشن‌های Put با نوسان ضمنی پایین. این‌ها مانند بیمه‌نامه‌هایی هستند که اگر بازار آرام باشد منقضی می‌شوند (هزینه)، اما اگر بازار سقوط کند، بازدهی عظیمی ایجاد می‌کنند."
                        />
                    </div>
                </div>

                {/* --- 3. THE MACHINE (Methodology Flow) --- */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-16">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            موتور جستجو چگونه کار می‌کند؟
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">فرآیند تبدیل داده‌های خام به سیگنال معاملاتی</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 max-w-6xl mx-auto relative">

                        {/* Connecting Line (Desktop Only) */}
                        <div className="hidden lg:block absolute top-8 left-10 right-10 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0"></div>

                        <ProcessStep
                            number="۱"
                            title="غربالگری داده‌ها"
                            desc="دریافت لحظه‌ای تمام داده‌های بازار و حذف گزینه‌های کم‌نقدشوندگی."
                            icon={Filter}
                        />

                        <ProcessStep
                            number="۲"
                            title="محاسبه ریاضی"
                            desc="محاسبه دقیق اهرم (Gearing) و نوسان ضمنی (IV) برای هر قرارداد."
                            icon={Calculator}
                        />

                        <ProcessStep
                            number="۳"
                            title="رتبه‌بندی طالب"
                            desc="یافتن بالاترین نسبت اهرم به قیمت. (بیشترین بنگ برای هر دلار)"
                            icon={BarChart}
                        />

                        <ProcessStep
                            number="۴"
                            title="تحلیل هوش مصنوعی"
                            desc="بررسی نهایی کاندیداها توسط مدل AI برای تایید شرایط تکنیکال."
                            icon={BrainCircuit}
                        />

                    </div>
                </div>

            </div>
        </section>
    );
};
