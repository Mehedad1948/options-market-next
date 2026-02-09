// app/profile/profile-form.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom';
import { updateProfile } from './actions';
import { User, Bell, Shield, Smartphone, Save, Info, Loader2, LogOut, Receipt, CheckCircle2, Clock, AlertCircle, Calendar, CreditCard, Hash } from 'lucide-react';
import { useState, useTransition } from 'react';
import { logoutAction, } from '@/lib/auth';
import { Modal } from '../components/ui/modal';

// Define Payment Type
interface Payment {
  id: string;
  amount: number;
  description: string | null;
  status: string;
  createdAt: string;
  authority: string | null;
  refId: string | null;
}

interface UserData {
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  telegramId: string | null;
  role: string;
  subscriptionExpiresAt: Date | null;
  notifyTelegram: boolean;
  notifyWeb: boolean;
  payments?: Payment[]; // Added optional payments array
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
    >
      {pending ? 'در حال ذخیره...' : (
        <>
          <Save className="w-5 h-5" />
          ذخیره تغییرات
        </>
      )}
    </button>
  );
}

function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };
  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-black/20 border border-slate-700 hover:border-rose-500"
    >
      {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /><span>در حال خروج...</span></> :
        <><LogOut className="w-5 h-5" /><span>خروج از حساب</span></>}
    </button>
  );
}

// --- NEW COMPONENT: PAYMENT HISTORY ITEM ---
function PaymentItem({ payment, onClick }: { payment: Payment, onClick: () => void }) {
  const date = new Date(payment.createdAt).toLocaleDateString('fa-IR');

  // Status styling
  let statusColor = "text-slate-500 bg-slate-100 dark:bg-slate-800";
  let statusText = payment.status;

  if (payment.status === 'SUCCESS') {
    statusColor = "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20";
    statusText = "موفق";
  } else if (payment.status === 'PENDING') {
    statusColor = "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20";
    statusText = "در انتظار";
  } else if (payment.status === 'FAILED') {
    statusColor = "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20";
    statusText = "ناموفق";
  }

  return (
    <div
      onClick={onClick}
      className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-amber-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColor}`}>
          {payment.status === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
        </div>
        <div>
          <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">
            {Number(payment.amount).toLocaleString('fa-IR')} تومان
          </div>
          <div className="text-xs text-slate-500 mt-1">{payment.description || 'افزایش اعتبار'}</div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-xs tracking-wider text-slate-500 mb-1">{date}</div>
        <div className={`text-xs px-2 py-0.5 rounded-md inline-block ${statusColor} font-medium`}>
          {statusText}
        </div>
      </div>
    </div>
  );
}

export default function ProfileForm({ user }: { user: UserData }) {
  const [state, formAction] = useFormState(updateProfile, null);
  const [notifyTg, setNotifyTg] = useState(user.notifyTelegram);
  const [notifyWeb, setnotifyWeb] = useState(user.notifyWeb);

  // Modal State
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  console.log('🐞🐞', selectedPayment, user);

  return (
    <>
      <form action={formAction} className="space-y-8">
        {state?.message && (
          <div className={`p-4 rounded-xl text-center font-medium ${state.success ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
            {state.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* --- LEFT COLUMN --- */}
          <div className="space-y-6">
            {/* 1. PERSONAL INFO */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <User className="w-5 h-5 text-amber-500" />
                اطلاعات شخصی
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">نام</label>
                  <input name="firstName" defaultValue={user.firstName || ''} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors" placeholder="نام" />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">نام خانوادگی</label>
                  <input name="lastName" defaultValue={user.lastName || ''} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors" placeholder="نام خانوادگی" />
                </div>
              </div>
            </div>

            {/* 2. NOTIFICATIONS */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Bell className="w-5 h-5 text-amber-500" />
                تنظیمات اعلان‌ها
              </h3>
              <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div><div className="font-medium">اطلاع‌رسانی تلگرام</div></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="notifyTelegram" checked={notifyTg} onChange={() => setNotifyTg(!notifyTg)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-4">
                <div><div className="font-medium">اطلاع‌رسانی اپلیکیشن</div></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="notifyWeb" checked={notifyWeb} onChange={() => setnotifyWeb(!notifyWeb)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="space-y-6">

            {/* 3. ACCOUNT INFO (READ ONLY) */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/50">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Shield className="w-5 h-5 text-slate-400" />
                اطلاعات حساب
              </h3>
              <div className="space-y-5">
                <ReadOnlyField dir='ltr' label="شماره موبایل" value={user.phoneNumber || '---'} icon={<Smartphone className="w-4 h-4" />} />
                <ReadOnlyField label="وضعیت اشتراک" value={user.subscriptionExpiresAt ? `انقضا: ${new Date(user.subscriptionExpiresAt).toLocaleDateString('fa-IR')}` : 'اشتراک فعال ندارید'} badge={!!user.subscriptionExpiresAt} />
              </div>
            </div>

            {/* 4. PAYMENT HISTORY (NEW SECTION) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Receipt className="w-5 h-5 text-amber-500" />
                تاریخچه پرداخت‌ها
              </h3>

              <div className="space-y-3 max-h-100 overflow-y-auto">
                {user.payments && user.payments.length > 0 ? (
                  user.payments.map((payment) => (
                    <PaymentItem
                      key={payment.id}
                      payment={payment}
                      onClick={() => setSelectedPayment(payment)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    هنوز پرداختی ثبت نشده است.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="pt-6 gap-4 border-t border-slate-200 dark:border-slate-800 flex justify-between">
          <SubmitButton />
          <LogoutButton />
        </div>
      </form>

      {/* --- PAYMENT DETAIL MODAL --- */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="جزئیات تراکنش"
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* Header Amount */}
            <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-sm text-slate-500 mb-1">مبلغ پرداختی</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {Number(selectedPayment.amount).toLocaleString('fa-IR')} <span className="text-sm font-normal text-slate-500">تومان</span>
              </div>

              {/* FIXED COLOR LOGIC HERE */}
              <div className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-medium 
      ${selectedPayment.status === 'SUCCESS'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : selectedPayment.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                }`}>
                {selectedPayment.status === 'SUCCESS' ? 'پرداخت موفق' :
                  selectedPayment.status === 'PENDING' ? 'در انتظار' :
                    'پرداخت ناموفق'}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4">
              <DetailRow
                icon={<Info className="w-4 h-4" />}
                label="شرح"
                value={selectedPayment.description || '---'}
              />
              {/* ... rest of the rows ... */}
              <DetailRow
                icon={<Calendar className="w-4 h-4" />}
                label="تاریخ و ساعت"
                value={new Date(selectedPayment.createdAt).toLocaleString('fa-IR')}
                isLtr
              />
              <DetailRow
                icon={<Hash className="w-4 h-4" />}
                label="شماره پیگیری (RefID)"
                value={selectedPayment.refId || '---'}
                isMono
              />
              <DetailRow
                icon={<CreditCard className="w-4 h-4" />}
                label="کد ارجاع (Authority)"
                value={selectedPayment.authority || '---'}
                isMono
                className="text-xs break-all"
              />
            </div>

            {selectedPayment.status === 'PENDING' && (
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg text-xs text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>این تراکنش هنوز نهایی نشده است. اگر مبلغ از حساب شما کسر شده است، معمولا تا ۷۲ ساعت آینده به حساب شما بازخواهد گشت.</p>
              </div>
            )}
          </div>

        )}
      </Modal>
    </>
  );
}

// Helper for Modal Details
function DetailRow({ label, value, icon, isMono, isLtr, className }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`font-medium text-slate-800 dark:text-slate-200 ${isMono ? 'font-mono' : ''} ${isLtr ? 'text-left' : 'text-right'} ${className}`}>
        {value}
      </div>
    </div>
  )
}

function ReadOnlyField({ label, value, icon, isMono, badge, dir }: any) {
  return (
    <div className="flex flex-col gap-1 opacity-80 cursor-not-allowed">
      <span className="text-xs text-slate-500 font-medium ml-1">{label}</span>
      <div dir={dir || 'rtl'} className="flex items-center justify-between bg-slate-200/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl">
        <span className={`text-slate-700 dark:text-slate-300 ${isMono ? 'font-mono' : ''} ${badge ? 'text-amber-600 dark:text-amber-500 font-bold' : ''}`}>
          {value}
        </span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
    </div>
  )
}
