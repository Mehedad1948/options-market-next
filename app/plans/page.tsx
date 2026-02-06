import React, { Suspense } from "react";
import { Zap, Crown, Star, Loader2 } from "lucide-react";
import { 
  UserSubscriptionGauge, 
  PromotionalHeader, 
  NavigationFooter 
} from "./client-components";
import { initiatePaymentAction } from '../actions/payment';
// Import the Server Action

// --- SUB-COMPONENT: SUBMIT BUTTON ---
// Needs to be a client component hook if extracted, but inside a Server Action form works fine.
// We'll use a simple button here. Ideally, use `useFormStatus` for loading state.
function BuyButton({ text, isPopular }: { text: string, isPopular: boolean }) {
  return (
    <button 
      type="submit"
      className={`w-full relative z-10 py-4 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2
      ${isPopular
        ? "bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-lg shadow-amber-500/25"
        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
      }`}
    >
      {text}
    </button>
  );
}

// --- SHARED COMPONENT: PLAN CARD ---
interface PlanCardProps {
    planKey: string; // Add this ID
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
}

function PlanCard({
    planKey, title, price, originalPrice, period, badge, icon, highlight, description, buttonText, isPopular = false
}: PlanCardProps) {
    
    // Create a specific server action binder for this plan
    const buyAction = initiatePaymentAction.bind(null, planKey);

    return (
        <div className={`relative flex flex-col p-6 rounded-3xl border transition-all duration-300 group
            ${isPopular
                ? "bg-slate-900 text-white shadow-2xl shadow-amber-500/20 border-amber-500/50 scale-105 z-10"
                : "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-lg border-slate-100 dark:border-slate-800 hover:border-amber-500/30"
            }
        `}>
            {isPopular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        محبوب‌ترین انتخاب
                    </span>
                </div>
            )}
            
            <div className="mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${isPopular ? "bg-amber-500/20 text-amber-500" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                    {icon}
                </div>
                <div className="text-sm font-medium text-amber-500 mb-1">{highlight}</div>
                <h3 className="text-xl font-bold">{title}</h3>
            </div>

            <div className="mb-6">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{price}</span>
                    <span className={`text-sm ${isPopular ? "text-slate-400" : "text-slate-500"}`}>تومان</span>
                </div>
                {originalPrice && (
                    <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="text-slate-400 line-through decoration-slate-400/50">{originalPrice}</span>
                        {badge && (
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${isPopular ? "bg-amber-500/20 text-amber-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                                {badge}
                            </span>
                        )}
                    </div>
                )}
                <div className="text-xs text-slate-400 mt-1">برای {period}</div>
            </div>

            <div className="flex-grow mb-8">
                <p className={`text-sm leading-relaxed ${isPopular ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                    {description}
                </p>
            </div>

            {/* FORM WRAPPER FOR SERVER ACTION */}
            <form action={buyAction}>
                <BuyButton text={buttonText} isPopular={isPopular} />
            </form>
        </div>
    );
}

// Loading Fallback
function GaugeSkeleton() {
  return <div className="mb-16 w-full h-48 bg-slate-100 dark:bg-slate-900/50 rounded-3xl animate-pulse" />;
}

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-slate-800/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-5xl">
        <Suspense fallback={<GaugeSkeleton />}>
           <UserSubscriptionGauge />
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
           <PromotionalHeader />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* PLAN 1 */}
            <PlanCard
                planKey="1-month" 
                title="اشتراک ماهانه"
                price="۱۰۰,۰۰۰"
                period="یک ماه"
                icon={<Zap className="w-6 h-6" />}
                highlight="شروع مسیر"
                description="مناسب برای تست استراتژی‌ها و آشنایی با محیط."
                buttonText="خرید اشتراک"
            />
            {/* PLAN 2 */}
            <PlanCard
                planKey="6-month"
                title="اشتراک ۶ ماهه"
                price="۵۰۰,۰۰۰"
                originalPrice="۶۰۰,۰۰۰"
                period="شش ماه"
                badge="۱ ماه رایگان"
                icon={<Star className="w-6 h-6" />}
                highlight="اقتصادی"
                description="پرداخت هزینه ۵ ماه، دریافت ۶ ماه سرویس کامل."
                buttonText="خرید با تخفیف"
                isPopular={false}
            />
            {/* PLAN 3 */}
            <PlanCard
                planKey="1-year"
                title="اشتراک سالانه"
                price="۹۰۰,۰۰۰"
                originalPrice="۱,۲۰۰,۰۰۰"
                period="یک سال"
                badge="۳ ماه رایگان"
                icon={<Crown className="w-6 h-6" />}
                highlight="پیشنهاد حرفه‌ای‌ها"
                description="بهترین ارزش خرید. ۳ ماه استفاده کاملاً رایگان."
                buttonText="سرمایه‌گذاری هوشمند"
                isPopular={true}
            />
        </div>

        <Suspense fallback={<div className="mt-16 h-10" />}>
            <NavigationFooter />
        </Suspense>
      </div>
    </div>
  );
}
