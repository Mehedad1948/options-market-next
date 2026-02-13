/* --- START FILE: policy/page.jsx --- */
'use cache'

import React from 'react';
import {
  ShieldAlert,
  Scale,
  Lock,
  FileText,
  ArrowRight,
  Activity,
  Puzzle, // <--- Added this icon for the extension section
} from 'lucide-react';
import Link from 'next/link';

// --- REUSABLE COMPONENTS ---

const BackgroundGrid = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    {/* Grid Pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    {/* Fade out at the bottom/top for smoothness */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-slate-950"></div>
  </div>
);

// Updated the type definition to include children properly
const SectionCard = ({
  icon,
  title,
  children,
  isWarning = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  isWarning?: boolean;
}) => (
  <div
    className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 relative z-10
    ${
      isWarning
        ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5'
        : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-sm'
    }`}
  >
    <div className='flex items-center gap-4 mb-4'>
      <div
        className={`p-3 rounded-2xl ${
          isWarning
            ? 'bg-amber-500 text-slate-900'
            : 'bg-slate-100 dark:bg-slate-800 text-amber-500'
        }`}
      >
        {icon}
      </div>
      <h3
        className={`text-xl font-bold ${
          isWarning
            ? 'text-amber-600 dark:text-amber-500'
            : 'text-slate-900 dark:text-slate-100'
        }`}
      >
        {title}
      </h3>
    </div>
    <div className='text-slate-600 dark:text-slate-400 leading-8 text-justify'>
      {children}
    </div>
  </div>
);

export default async function TermsPage() {
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300' dir="rtl">
      <BackgroundGrid />

      <div className='relative z-10 container mx-auto px-4 py-12 max-w-4xl'>
        {/* --- HEADER --- */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-slate-200 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'>
            <Scale className='w-8 h-8' />
          </div>
          <h1 className='text-3xl md:text-5xl font-black mb-6 tracking-tight'>
            قوانین و <span className='text-amber-500'>حریم خصوصی</span>
          </h1>
          <p className='text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed'>
            به خانواده‌ی بزرگ{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              آپشن‌<span className="text-amber-500">یار</span>
            </span>{' '}
            خوش آمدید. لطفاً پیش از استفاده از وب‌سایت یا افزونه، این موارد را مطالعه فرمایید.
          </p>
        </div>

        <div className='space-y-8'>
          {/* --- 1. CRITICAL DISCLAIMER --- */}
          <SectionCard
            isWarning={true}
            icon={<ShieldAlert className='w-6 h-6' />}
            title='سلب مسئولیت مالی و سرمایه‌گذاری'
          >
            <p className='font-bold text-slate-800 dark:text-slate-200 mb-2'>
              کاربر گرامی، توجه به این نکته بسیار حیاتی است:
            </p>
            <p>
              پلتفرم{' '}
              <span className="font-bold text-amber-700 dark:text-amber-500">آپشن‌یار</span>{' '}
              صرفاً یک ابزار{' '}
              <strong>
                تحلیل داده، پردازش آماری و نمایش سیگنال‌های تکنیکال
              </strong>{' '}
              است. ما هیچ‌گونه توصیه‌ی مستقیم برای «خرید» یا «فروش» دارایی‌ها
              ارائه نمی‌دهیم.
            </p>
            <ul className='list-disc list-inside mt-4 space-y-2 marker:text-amber-500'>
              <li>
                بازارهای مالی ذاتاً دارای ریسک و نوسان هستند. مسئولیت نهایی
                هرگونه تصمیم‌گیری مالی، سود کسب‌شده یا زیان احتمالی،{' '}
                <strong>کاملاً و صددرصد بر عهده شخص شماست</strong>.
              </li>
              <li>
                داده‌های نمایش داده شده در آپشن‌یار بر اساس الگوریتم‌های ریاضی محاسبه
                می‌شوند و تضمینی برای محقق شدن آن‌ها در آینده وجود ندارد.
              </li>
            </ul>
          </SectionCard>

          {/* --- 2. NATURE OF SERVICE --- */}
          <SectionCard
            icon={<Activity className='w-6 h-6' />}
            title='ماهیت خدمات ما'
          >
            <p>
              <span className="font-bold">آپشن‌یار</span> ابزاری برای معامله‌گران فراهم کرده تا بتوانند با سرعت
              بیشتری بازار را رصد کنند. نقش ما «دستیار هوشمند» است، نه «مشاور
              مالی». استفاده از این ابزار نیازمند دانش قبلی شما از اصول مدیریت
              سرمایه و تحلیل تکنیکال است.
            </p>
          </SectionCard>

          {/* --- 3. PRIVACY & DATA --- */}
          <SectionCard
            icon={<Lock className='w-6 h-6' />}
            title='حریم خصوصی و داده‌های کاربری'
          >
            <p>
              ما به حریم خصوصی شما احترام می‌گذاریم. اطلاعاتی که در پلتفرم{' '}
              <span className="font-bold">آپشن‌یار</span> ثبت
              می‌کنید (شامل شماره تماس و ایمیل) صرفاً برای موارد
              زیر استفاده می‌شود:
            </p>
            <ul className='list-disc list-inside mt-3 space-y-1 marker:text-slate-400'>
              <li>احراز هویت و ورود امن به حساب کاربری.</li>
              <li>مدیریت اشتراک و پشتیبانی فنی.</li>
            </ul>
            <p className='mt-3'>
              اطلاعات شما نزد ما امانت است و هرگز به شخص ثالث یا نهادهای
              تبلیغاتی فروخته نخواهد شد.
            </p>
          </SectionCard>

          {/* --- 4. EXTENSION SPECIFIC POLICY (NEW ADDITION FOR GOOGLE) --- */}
          <SectionCard
            icon={<Puzzle className='w-6 h-6' />}
            title='خط‌مشی افزونه مرورگر (Browser Extension)'
          >
            <p>
              جهت شفاف‌سازی عملکرد افزونه کروم آپشن‌یار برای کاربران و فروشگاه گوگل:
            </p>
            <ul className='list-disc list-inside mt-3 space-y-2 marker:text-slate-400'>
              <li>
                <strong>عدم جمع‌آوری داده‌های مرورگر:</strong> این افزونه هیچ‌گونه دسترسی به تاریخچه مرورگر (Browser History)، تب‌های باز یا فعالیت شما در سایر وب‌سایت‌ها ندارد.
              </li>
              <li>
                <strong>نحوه احراز هویت:</strong> افزونه تنها برای بررسی وضعیت اشتراک شما، به کوکی‌های احراز هویت وب‌سایت ما دسترسی پیدا می‌کند تا نیازی به ورود مجدد نداشته باشید.
              </li>
              <li>
                <strong>ارتباط با سرور:</strong> داده‌های نمایش داده شده در افزونه مستقیماً از سرورهای امن آپشن‌یار دریافت می‌شوند و هیچ داده‌ای به سرورهای ناشناس ارسال نمی‌گردد.
              </li>
            </ul>
          </SectionCard>

          {/* --- 5. SUBSCRIPTION RULES --- */}
          <SectionCard
            icon={<FileText className='w-6 h-6' />}
            title='قوانین اشتراک و دسترسی'
          >
            <p>
              دسترسی به امکانات ویژه (Premium) منوط به داشتن اشتراک فعال است. پس
              از انقضای تاریخ اشتراک، حساب کاربری به صورت خودکار به حالت رایگان
              تغییر وضعیت می‌دهد. لطفاً توجه داشته باشید که به دلیل ماهیت
              دیجیتال خدمات، امکان عودت وجه پس از فعال‌سازی اشتراک وجود ندارد.
            </p>
          </SectionCard>
        </div>

        {/* --- FOOTER / BACK ACTION --- */}
        <div className='mt-16 border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4'>
          <p className='text-sm text-slate-400'>
            آخرین بروزرسانی: ۲۴ بهمن ۱۴۰۴
          </p>

          <Link
            href='/'
            className='group flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-amber-500 hover:text-slate-900 hover:border-amber-500 dark:hover:text-slate-900 transition-all text-slate-600 dark:text-slate-300 shadow-sm'
          >
            <span>بازگشت به صفحه اصلی</span>
            <ArrowRight className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
          </Link>
        </div>
      </div>
    </div>
  );
}
/* --- END FILE: policy/page.jsx --- */
