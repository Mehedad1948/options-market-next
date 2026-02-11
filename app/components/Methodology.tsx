/* eslint-disable @typescript-eslint/no-explicit-any */
import { BarChart, BrainCircuit, Calculator, Filter, ShieldCheck, Zap } from 'lucide-react';


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



export default function Methodology() {
  return (
    <div className='border-t border-slate-200 dark:border-slate-800 pt-16'>
      <div className='text-center mb-12'>
        <h3 className='text-2xl font-bold text-slate-800 dark:text-slate-100'>
          موتور جستجوی ما چگونه کار می‌کند؟
        </h3>
        <p className='text-slate-500 dark:text-slate-400 mt-2'>
          فرآیند تبدیل داده‌های خام به سیگنال معاملاتی
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 max-w-6xl mx-auto relative'>
        {/* Connecting Line (Desktop Only) */}
        <div className='hidden lg:block absolute top-8 left-10 right-10 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0'></div>

        <ProcessStep
          number='۱'
          title='غربالگری داده‌ها'
          desc='دریافت لحظه‌ای تمام داده‌های بازار و حذف گزینه‌های کم‌نقدشوندگی.'
          icon={Filter}
        />

        <ProcessStep
          number='۲'
          title='محاسبه ریاضی'
          desc='محاسبه دقیق اهرم (Gearing) و نوسان ضمنی (IV) برای هر قرارداد.'
          icon={Calculator}
        />

        <ProcessStep
          number='۳'
          title='رتبه‌بندی طالب'
          desc='یافتن بالاترین نسبت اهرم به قیمت. (بیشترین بنگ برای هر دلار)'
          icon={BarChart}
        />

        <ProcessStep
          number='۴'
          title='تحلیل هوش مصنوعی'
          desc='بررسی نهایی کاندیداها توسط مدل AI برای تایید شرایط تکنیکال.'
          icon={BrainCircuit}
        />
      </div>
    </div>
  );
}
