'use client';

import { Gift, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '../providers/user-context';

// Helper Logic
function getDaysRemaining(expiryDate: Date | null | string): number {
  if (!expiryDate) return 0;
  // Handle both Date object and ISO string (from JSON serialization)
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  if (diffTime <= 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function UserSubscriptionGauge() {
  const user = useUser();

  // If not logged in, render nothing
  if (!user) return null;

  const daysLeft = getDaysRemaining(user.subscriptionExpiresAt);

  return (
    <div className='mb-16 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700'>
      {/* Text Info */}
      <div className='z-10 text-center md:text-right'>
        <h2 className='text-2xl font-bold mb-2'>
          سلام {user.firstName || 'همراه عزیز'}،
        </h2>
        <p className='text-slate-500 dark:text-slate-400'>
          {daysLeft > 0
            ? 'اشتراک شما فعال است. از شکار فرصت‌ها لذت ببرید.'
            : 'اشتراک شما به پایان رسیده است. برای ادامه تمدید کنید.'}
        </p>
      </div>

      {/* CURVED GAUGE INDICATOR */}
      <div className='relative w-48 h-24 flex justify-center items-end'>
        <div className='absolute bottom-0 text-center'>
          <span className='text-4xl font-bold text-slate-800 dark:text-white block -mb-1'>
            {daysLeft.toLocaleString('fa-IR')}
          </span>
          <span className='text-xs text-slate-500 font-bold uppercase tracking-wider'>
            روز باقی‌مانده
          </span>
        </div>
      </div>
    </div>
  );
}

export function PromotionalHeader() {
  const user = useUser();

  return (
    <div className='text-center mb-12'>
      <h1 className='text-4xl font-bold mb-4 text-slate-900 dark:text-white'>
        سرمایه‌گذاری روی <span className='text-amber-500'>بینش</span>
      </h1>

      {/* Show only if NOT logged in */}
      {!user && (
        <div className='inline-flex items-center gap-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 px-6 py-3 rounded-full mt-4 animate-pulse-slow'>
          <Gift className='w-5 h-5 text-amber-600 dark:text-amber-500' />
          <span className='text-amber-800 dark:text-amber-200 font-medium'>
            تازه واردید؟{' '}
            <span className='font-bold underline decoration-amber-500/50 underline-offset-4'>
              ۱۴ روز اشتراک رایگان
            </span>{' '}
            بعد از ثبت نام اولیه
          </span>
        </div>
      )}
    </div>
  );
}

export function NavigationFooter() {
  const user = useUser();
  const linkTarget = user ? '/' : '/dashboard';
  const linkText = user ? 'بازگشت صفحه اصلی' : 'بازگشت به داشبورد';

  return (
    <div className='mt-16 text-center text-slate-500 text-sm'>
      <Link
        href={linkTarget}
        className='inline-flex items-center gap-2 mt-4 text-amber-600 hover:text-amber-700 font-medium'
      >
        <ArrowLeft className='w-4 h-4' />
        {linkText}
      </Link>
    </div>
  );
}

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { initiatePaymentAction, ActionState } from '../actions/payment';

// --- A NEW, HOOK-AWARE BUY BUTTON ---
function SubmitButton({
  text,
  isPopular,
}: {
  text: string;
  isPopular: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type='submit'
      disabled={pending}
      className={`w-full cursor-pointer relative z-10 py-4 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2
      ${
        isPopular
          ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-lg shadow-amber-500/25'
          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
      }
      disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      {pending ? (
        <>
          <Loader2 className='w-5 h-5 animate-spin' />
          <span>لطفا صبر کنید...</span>
        </>
      ) : (
        text
      )}
    </button>
  );
}

// --- THE FORM WRAPPER ---
interface PlanFormWrapperProps {
  planKey: string;
  buttonText: string;
  isPopular?: boolean;
}

export function PlanFormWrapper({
  planKey,
  buttonText,
  isPopular = false,
}: PlanFormWrapperProps) {
  const initialState: ActionState = { success: false, message: '' };

  // Bind the planKey to the server action
  const initiatePaymentWithPlan = initiatePaymentAction.bind(null, planKey);
  const [state, formAction] = useFormState(
    initiatePaymentWithPlan,
    initialState,
  );

  useEffect(() => {
    if (state.success && state.url) {
      toast.success(state.message);
      // Redirect on success
      window.location.href = state.url;
    } else if (!state.success && state.message) {
      console.log('🍎🍎🍎', state);

      // Show toast on error
      toast.error('خطا دراتصال به درگاه پرداخت');
    }
  }, [state]);

  return (
    <form action={formAction}>
      <SubmitButton text={buttonText} isPopular={isPopular} />
    </form>
  );
}
