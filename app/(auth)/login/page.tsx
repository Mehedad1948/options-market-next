/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Suspense, useState } from 'react'; // Suspense required for useSearchParams/nuqs
import { useRouter } from 'next/navigation';
import { useQueryState, parseAsString } from 'nuqs';
import { Phone, Lock, Loader2, Bot, MessageSquareText, ArrowRight } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  
  // --- NUQS STATE MANAGEMENT ---
  const [step, setStep] = useQueryState('step', parseAsString.withDefault('phone'));
  const [phoneParam, setPhoneParam] = useQueryState('phone', parseAsString.withDefault(''));
  const [methodParam, setMethodParam] = useQueryState('method', parseAsString.withDefault('telegram'));

  // --- LOCAL FORM STATE ---
  // We sync local state with URL params when submitting
  const [inputPhone, setInputPhone] = useState(phoneParam);
  const [otp, setOtp] = useState('');
  const [localMethod, setLocalMethod] = useState<'telegram' | 'sms'>(methodParam as 'telegram' | 'sms');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBotHelp, setShowBotHelp] = useState(false);

  // --- ACTION: REQUEST OTP ---
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowBotHelp(false);

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ 
          phoneNumber: inputPhone,
          method: localMethod 
        }),
      });
      const data = await res.json();

      if (res.status === 404) {
         setError(data.message);
         if (localMethod === 'telegram') setShowBotHelp(true);
         return;
      }

      if (!res.ok) throw new Error(data.error);

      // UPDATE URL STATE -> Changes View
      await setPhoneParam(data.identifier);
      await setMethodParam(localMethod);
      await setStep('verify');
      
    } catch (err: any) {
      setError(err.message || 'خطا در برقراری ارتباط');
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION: VERIFY OTP ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ identifier: phoneParam, code: otp }),
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

  // --- ACTION: BACK ---
  const goBack = () => {
    setStep('phone');
    setError('');
    setOtp('');
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 transition-all duration-300">
      
      {/* Header */}
      <div className="text-center mb-8 relative">
        {step === 'verify' && (
          <button onClick={goBack} className="absolute right-0 top-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          ورود به سامانه
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {step === 'phone' 
            ? 'روش دریافت کد را انتخاب کنید'
            : `کد ارسال شده به ${methodParam === 'sms' ? 'پیامک' : 'تلگرام'} را وارد کنید`
          }
        </p>
      </div>

      {/* Global Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-300 text-sm rounded-xl text-center animate-pulse-short">
          <p>{error}</p>
          {showBotHelp && (
            <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
              <a 
                href={`https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}`}
                target="_blank" 
                rel="noreferrer"
                className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Bot className="w-4 h-4" />
                <span>ورود به ربات تلگرام</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* VIEW 1: PHONE & METHOD */}
      {step === 'phone' ? (
        <form onSubmit={handleRequestOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          
          {/* Method Tabs */}
          <div className="grid grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setLocalMethod('telegram')}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                localMethod === 'telegram' 
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bot className="w-4 h-4" />
              تلگرام
            </button>
            <button
              type="button"
              onClick={() => setLocalMethod('sms')}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                localMethod === 'sms' 
                  ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              پیامک
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              شماره موبایل
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
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
            className={`w-full text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${
              localMethod === 'telegram' 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' 
                : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'دریافت کد تایید'}
          </button>
        </form>
      ) : (
        /* VIEW 2: OTP INPUT */
        <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
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
            onClick={goBack}
            className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            اصلاح شماره موبایل
          </button>
        </form>
      )}
    </div>
  );
}

// Wrapper for Suspense boundary (Required by nuqs)
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4" dir="rtl">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-gray-400" />}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}