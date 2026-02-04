/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, Loader2, ExternalLink, Bot } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState(''); // To store clean phone from API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBotHelp, setShowBotHelp] = useState(false); // To toggle help message

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowBotHelp(false);

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();

      // Handle "User Not Found" (Hasn't clicked Dashboard button in bot)
      if (res.status === 404) {
         setError(data.message);
         setShowBotHelp(true);
         return;
      }

      if (!res.ok) throw new Error(data.error);

      setNormalizedPhone(data.identifier);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'خطا در برقراری ارتباط');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ identifier: normalizedPhone, code: otp }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'کد نادرست است');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 " dir="rtl">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            ورود به سامانه
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {step === 'phone' 
              ? 'شماره موبایل خود را وارد کنید'
              : 'کد ارسال شده به تلگرام را وارد کنید'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-300 text-sm rounded-xl text-center">
            <p>{error}</p>
            
            {showBotHelp && (
              <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                <p className="text-xs mb-3 text-gray-600 dark:text-gray-400">
                  برای فعال‌سازی، وارد ربات شوید و دکمه <b>«فعال‌سازی داشبورد»</b> را بزنید.
                </p>
                <a 
                  href={`https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                >
                  <Bot className="w-4 h-4" />
                  <span>ورود به ربات تلگرام</span>
                </a>
              </div>
            )}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                شماره موبایل
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0912..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left ltr font-mono dark:text-white"
                  dir="ltr"
                />
                <Phone className="w-5 h-5 absolute right-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'دریافت کد تایید'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                کد تایید
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none transition-all text-center tracking-[0.5em] text-xl font-bold font-mono dark:text-white"
                  dir="ltr"
                  autoFocus
                  maxLength={6}
                />
                <Lock className="w-5 h-5 absolute right-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ورود'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              اصلاح شماره موبایل
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
