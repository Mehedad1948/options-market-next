import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  CheckCircle2,
  LineChart,
  Lock,
  ShieldCheck,
  TrendingUp,
  Zap
} from "lucide-react";
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* <Image
        width={500}
        height={500}
        alt='options'
        src="/swan.png"
        className='fixed bottom-4 left-4 z-20 w-16 md:w-32 opacity-10  -scale-x-100'
      /> */}
      <Image
        width={500}
        height={500}
        alt='options'
        src="/hero-2.png"
        className='absolute bottom-4 right-4 z-20 hidden lg:block md:w-64 '
      />
      {/* --- HERO SECTION --- */}
      <section className="relative pt-16 pb-16 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 dark:bg-blue-500/10 blur-[100px] rounded-full -z-10" />

        <div className="container mx-auto px-4 text-center">
          {/* Small Pill Badge */}
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-medium mb-8 border border-blue-100 dark:border-blue-800 animate-fade-in-up">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
    </span>
    موتور شکار فرصت‌های طلایی فعال شد
  </div> */}

          {/* MAIN HEADLINE */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            <span className="block text-gray-900 dark:text-white mb-2">آپشن‌<span className="text-blue-600">یار</span></span>
            <span className="text-3xl md:text-5xl font-extrabold text-gray-700 dark:text-gray-300">
              شکارچی هوشمندِ
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 dark:from-blue-400 dark:via-cyan-300 dark:to-teal-200">
              سودهای نامتقارن
            </span>
          </h1>

          {/* SUB-HEADLINE / SLOGAN */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4 font-bold">
            &quot;ریسک محدود، پاداش نامحدود&quot;
          </p>

          {/* DESCRIPTION - BRIDGING THE TALEB GAP */}

          <div className="flex mt-4 flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group"
            >
              ورود به داشبورد
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link
              href="https://t.me/OptionYarBot"
              target="_blank"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-5 h-5 text-blue-500" />
              تست رایگان ربات
            </Link>
          </div>

          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mt-10 leading-relaxed">
            ما با الهام از فلسفه <span className="text-gray-900 dark:text-white font-bold">نسیم طالب</span>، به دنبال نوسانات عادی نیستیم.
            هوش مصنوعی ما بازارهای مالی را رصد می‌کند تا
            <span className="text-blue-600 dark:text-blue-400 font-bold px-1">قوی سیاه</span>
            (فرصت‌های کمیاب با سود انفجاری) را قبل از دیگران شناسایی کند.
          </p>

          {/* Trust Metrics */}
          {/* <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-100 dark:border-gray-800 pt-8 max-w-4xl mx-auto">
            {[
              { label: "کاربر فعال", value: "+۵,۰۰۰" },
              { label: "سیگنال موفق", value: "٪۸۷" },
              { label: "تحلیل روزانه", value: "+۲۰۰" },
              { label: "پشتیبانی", value: "۲۴/۷" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 font-mono">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">چرا معامله‌گران حرفه‌ای آپشن‌یار را انتخاب می‌کنند؟</h2>
            <p className="text-gray-600 dark:text-gray-400">
              ما پیچیدگی‌های بازار اختیار معامله را با تکنولوژی ترکیب کرده‌ایم تا شما ساده‌تر تصمیم بگیرید.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">تحلیل هوشمند AI</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                الگوریتم‌های ما تمام قراردادهای موجود در بازار را در کسری از ثانیه اسکن می‌کنند تا بهترین فرصت‌های خرید و فروش را شناسایی کنند.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">سیگنال‌های لحظه‌ای</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                فرصت‌ها در بازار آپشن به سرعت می‌سوزند. سیگنال‌های ما بدون تاخیر از طریق تلگرام و داشبورد به دست شما می‌رسد.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">مدیریت ریسک</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                علاوه بر نقطه ورود، ما حد ضرر و حد سود را نیز به شما پیشنهاد می‌دهیم تا سرمایه شما همیشه در امنیت باشد.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- DASHBOARD PREVIEW --- */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                یک داشبورد کامل برای <br />
                <span className="text-blue-600">رصد تمام بازار</span>
              </h2>
              <ul className="space-y-4">
                {[
                  "نمایش لحظه‌ای صف‌های خرید و فروش",
                  "فیلترهای پیشرفته بر اساس سررسید و نوع قرارداد",
                  "محاسبه بلک-شولز و یونانی‌های بازار",
                  "پشتیبانی از تم تاریک برای معامله‌گران شب",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/dashboard" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
                  مشاهده دمو داشبورد <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Representation (Abstract Dashboard) */}
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-blue-600 blur-[80px] opacity-20 rounded-full"></div>
              <div className="relative bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* Fake Header */}
                <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                {/* Fake Content */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-gray-400 text-sm">
                    <span>وضعیت بازار</span>
                    <span className="text-green-400">باز - صعودی</span>
                  </div>
                  <div className="h-32 bg-gray-800/50 rounded-lg flex items-end justify-between p-2 gap-1">
                    {[40, 60, 45, 70, 50, 80, 75, 90].map((h, i) => (
                      <div key={i} className="w-full bg-blue-500/80 rounded-sm" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-10 bg-gray-800 rounded flex items-center px-3 justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500/20 text-green-500 rounded flex items-center justify-center"><TrendingUp size={14} /></div>
                        <span className="text-white text-sm">ضخود ۱۰۱۲</span>
                      </div>
                      <span className="text-green-400 text-sm">+۱۲٪</span>
                    </div>
                    <div className="h-10 bg-gray-800 rounded flex items-center px-3 justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-500/20 text-red-500 rounded flex items-center justify-center"><LineChart size={14} /></div>
                        <span className="text-white text-sm">طملی ۷۰۰۴</span>
                      </div>
                      <span className="text-red-400 text-sm">-۳٪</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING / CTA --- */}
      <section className="py-24 bg-blue-600 text-white relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">آماده شروع معاملات هوشمند هستید؟</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            همین حالا ثبت نام کنید و ۱۴ روز اشتراک رایگان پرمیوم دریافت کنید. بدون نیاز به کارت بانکی.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              شروع رایگان
            </Link>
            <Link
              href="https://t.me/OptionYarBot"
              target="_blank"
              className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-5 h-5" />
              ارتباط با ربات
            </Link>
          </div>

          <p className="mt-6 text-sm text-blue-200 opacity-80 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" />
            اطلاعات شما کاملاً محفوظ است
          </p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-900 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                  <LineChart className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">آپشن‌یار</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                اولین پلتفرم جامع تحلیل و سیگنال‌دهی بازار اختیار معامله در ایران. ما به شما کمک می‌کنیم تا با دید باز معامله کنید.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">دسترسی سریع</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">داشبورد</Link></li>
                <li><Link href="/login" className="hover:text-blue-600 transition-colors">ورود / ثبت نام</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">قوانین و مقررات</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">ارتباط با ما</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>پشتیبانی تلگرام: <span dir="ltr">@OptionYarSupport</span></li>
                <li>ایمیل: info@optionyar.ir</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-900 pt-8 text-center text-sm text-gray-400">
            © ۱۴۰۴ آپشن‌یار. تمامی حقوق محفوظ است.
          </div>
        </div>
      </footer>
    </div>
  );
}
