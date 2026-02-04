import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  LineChart,
  Lock,
  Quote,
  ShieldCheck,
  Zap
} from "lucide-react";
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors relative selection:bg-amber-500 selection:text-white">

      {/* --- GLOBAL GRID BACKGROUND --- */}
      {/* This covers the whole page but sits behind everything (z-0) */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

      {/* Optional: Floating Hero Image Decor */}


      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-20 overflow-hidden z-10">
        <Image
          width={500}
          height={500}
          alt='options'
          src="/hero-2.png"
          className='absolute bottom-4 right-4 z-20 hidden lg:block md:w-64 opacity-80 mix-blend-multiply dark:mix-blend-overlay'
        />
        {/* Background Gradients - Changed to Warm Amber/Orange to match "Fire" theme */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px]  blur-[100px] rounded-full -z-10" />

        <div className="container mx-auto px-4 text-center">

          {/* MAIN HEADLINE */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
            <span className="block text-slate-900 dark:text-white mb-2">
              آپشن‌<span className="text-amber-600 dark:text-amber-500">یار</span>
            </span>
            <span className="text-3xl md:text-5xl font-extrabold text-slate-600 dark:text-slate-400">
              شکارچی هوشمندِ
            </span>
            <br />
            {/* Gradient changed to Fire/Gold tones */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 dark:from-amber-400 dark:via-orange-300 dark:to-yellow-200 py-2 inline-block">
              سودهای نامتقارن
            </span>
          </h1>

          {/* SUB-HEADLINE / SLOGAN */}
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-6 font-bold">
            &quot;ریسک محدود، پاداش نامحدود&quot;
          </p>

          {/* Buttons - Swapped Blue for Amber */}
          <div className="flex mt-8 flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 group"
            >
              ورود به داشبورد
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link
              href="https://t.me/OptionYarBot"
              target="_blank"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              <Bot className="w-5 h-5 text-amber-500 group-hover:rotate-12 transition-transform" />
              تست رایگان ربات
            </Link>
          </div>

          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mt-12 leading-relaxed">
            ما با الهام از فلسفه نسیم طالب،

            <span className="font-bold text-amber-600 dark:text-amber-500">
              {' '}قوهای سیاه{' '}
            </span>
            
               بازار آپشن را شکار می‌کنیم. 
          </p>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-slate-50/50 dark:bg-black/20 border-y border-slate-200/50 dark:border-slate-800/50 z-10 relative backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">چرا معامله‌گران حرفه‌ای آپشن‌یار را انتخاب می‌کنند؟</h2>
            <p className="text-slate-600 dark:text-slate-400">
              ما پیچیدگی‌های بازار اختیار معامله را با تکنولوژی ترکیب کرده‌ایم تا شما ساده‌تر تصمیم بگیرید.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - AI (Slate/Blue-Grey) */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300 mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">تحلیل هوشمند AI</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                الگوریتم‌های ما تمام قراردادهای موجود در بازار را در کسری از ثانیه اسکن می‌کنند تا بهترین فرصت‌های خرید و فروش را شناسایی کنند.
              </p>
            </div>

            {/* Feature 2 - Signals (Amber/Gold) */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-sm hover:shadow-md hover:shadow-amber-500/10 transition-all group">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 fill-current" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">سیگنال‌های لحظه‌ای</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                فرصت‌ها در بازار آپشن به سرعت می‌سوزند. سیگنال‌های ما بدون تاخیر از طریق تلگرام و داشبورد به دست شما می‌رسد.
              </p>
            </div>

            {/* Feature 3 - Risk (Teal/Green) */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-500 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">مدیریت ریسک</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                علاوه بر نقطه ورود، ما حد ضرر و حد سود را نیز به شما پیشنهاد می‌دهیم تا سرمایه شما همیشه در امنیت باشد.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- TALEB / QUOTE SECTION (UPDATED Horizontal Layout) --- */}
      <section className="relative py-20 lg:py-32 overflow-hidden flex items-center z-10">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-20">

            {/* --- RIGHT SIDE: THE QUOTE (Text) --- */}
            <div className="w-full lg:w-6/12 text-right dir-rtl relative">

              {/* Large Quote Icon for style */}
              <Quote className="absolute -top-10 -right-8 w-24 h-24 text-amber-500/10 dark:text-amber-500/20 transform -scale-x-100" />

              <h2 className="relative z-10 text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-slate-800 dark:text-slate-100">
                <span className="text-slate-400 dark:text-slate-600">&rdquo;</span>
                باد شمع را خاموش می‌کند، اما
                <br className="hidden md:block" />
                <span className="text-amber-600 dark:text-amber-500 inline-block mt-2">
                  آتش را شعله‌ور می‌سازد.
                </span>
                <span className="text-slate-400 dark:text-slate-600">&rdquo;</span>
              </h2>

              <div className="mt-8 flex items-center gap-4">
                <div className="h-1 w-12 bg-amber-500 rounded-full" />
                <p className="text-xl font-medium text-slate-600 dark:text-slate-400">
                  ما می‌خواهیم <span className="text-amber-600 dark:text-amber-500 font-bold">آتش</span> باشیم.
                </p>
              </div>

              <p className="mt-4 mr-16 text-sm font-bold tracking-widest text-slate-400 uppercase">
                — نسیم نیکلاس طالب
              </p>
            </div>

            {/* --- LEFT SIDE: THE IMAGES --- */}
            <div className="w-full lg:w-5/12 relative flex justify-center items-center">
              <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]">

                <div className="absolute inset-0 z-10 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 ease-in-out">
                  <Image
                    src="/nasim.jpg"
                    alt="Nassim Nicholas Taleb"
                    fill
                    className="object-cover object-top"
                  />
                </div>

                <div className="absolute -bottom-10 -left-10 z-20 w-32 h-48 sm:w-40 sm:h-60 rounded-lg shadow-xl transform -rotate-6 border-2 border-white dark:border-slate-700 animate-float">
                  <Image
                    src="/black-swan-book-Nassim.jpg"
                    alt="The Black Swan"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                <div className="absolute -bottom-4 -right-10 z-20 w-32 h-48 sm:w-40 sm:h-60 rounded-lg shadow-xl transform rotate-12 border-2 border-white dark:border-slate-700 animate-float-delayed">
                  <Image
                    src="/antifragile.png"
                    alt="Antifragile"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/20 rounded-full blur-3xl -z-10 scale-110 animate-pulse" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- PRICING / CTA --- */}
      {/* Changed Background from Blue to Dark Slate to match "Black Swan" theme */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden z-10">

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        {/* Subtle grid on the dark background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">آماده شروع معاملات <span className="text-amber-500">هوشمند</span> هستید؟</h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
            همین حالا ثبت نام کنید و ۱۴ روز اشتراک رایگان پرمیوم دریافت کنید. بدون نیاز به کارت بانکی.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-xl hover:scale-105 transition-all"
            >
              شروع رایگان
            </Link>
            <Link
              href="https://t.me/OptionYarBot"
              target="_blank"
              className="px-8 py-4 bg-transparent border-2 border-slate-700 hover:border-amber-500/50 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-5 h-5 text-amber-500" />
              ارتباط با ربات
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" />
            اطلاعات شما کاملاً محفوظ است
          </p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 dark:bg-gray-950 border-t border-slate-200 dark:border-slate-900 pt-16 pb-8 z-10 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                {/* Logo Icon Background changed to Amber */}
                <div className="bg-amber-500 p-1.5 rounded-lg text-white">
                  <LineChart className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">آپشن‌یار</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                اولین پلتفرم جامع تحلیل و سیگنال‌دهی بازار اختیار معامله در ایران. ما به شما کمک می‌کنیم تا با دید باز معامله کنید.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-slate-900 dark:text-white">دسترسی سریع</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/dashboard" className="hover:text-amber-600 transition-colors">داشبورد</Link></li>
                <li><Link href="/login" className="hover:text-amber-600 transition-colors">ورود / ثبت نام</Link></li>
                <li><Link href="#" className="hover:text-amber-600 transition-colors">قوانین و مقررات</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-slate-900 dark:text-white">ارتباط با ما</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>پشتیبانی تلگرام: <span dir="ltr" className="font-mono text-slate-700 dark:text-slate-400">@OptionYarSupport</span></li>
                <li>ایمیل: info@optionyar.ir</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-900 pt-8 text-center text-sm text-slate-400">
            © ۱۴۰۴ آپشن‌یار. تمامی حقوق محفوظ است.
          </div>
        </div>
      </footer>
    </div>
  );
}
