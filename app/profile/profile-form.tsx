/* eslint-disable @typescript-eslint/no-explicit-any */
// app/profile/profile-form.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom';
import { updateProfile } from './actions';
import { User, Bell, Shield, Smartphone, Save, Info } from 'lucide-react';
import { useState } from 'react';

// Define the shape of data passed from the server
interface UserData {
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  telegramId: string | null; // Passed as string to avoid serialization issues
  role: string;
  subscriptionExpiresAt: Date | null;
  notifyTelegram: boolean;
  notifyWeb: boolean;
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

export default function ProfileForm({ user }: { user: UserData }) {
  const [state, formAction] = useFormState(updateProfile, null);
  
  // Local state for toggles to give instant visual feedback
  const [notifyTg, setNotifyTg] = useState(user.notifyTelegram);
  const [notifyWeb, setnotifyWeb] = useState(user.notifyWeb);

  return (
    <form action={formAction} className="space-y-8">
      
      {/* SUCCESS/ERROR MESSAGE */}
      {state?.message && (
        <div className={`p-4 rounded-xl text-center font-medium ${state.success ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- LEFT COLUMN: EDITABLE FIELDS --- */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <User className="w-5 h-5 text-amber-500" />
              اطلاعات شخصی (قابل ویرایش)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">نام</label>
                <input 
                  name="firstName"
                  defaultValue={user.firstName || ''}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="نام خود را وارد کنید"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">نام خانوادگی</label>
                <input 
                  name="lastName"
                  defaultValue={user.lastName || ''}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="نام خانوادگی خود را وارد کنید"
                />
              </div>
            </div>
          </div>

          {/* NOTIFICATION SETTINGS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <Bell className="w-5 h-5 text-amber-500" />
              تنظیمات اعلان‌ها
            </h3>

            {/* Telegram Toggle */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <div className="font-medium">اطلاع‌رسانی تلگرام</div>
                <div className="text-xs text-slate-500">دریافت سیگنال‌ها در ربات تلگرام</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="notifyTelegram" 
                  checked={notifyTg}
                  onChange={() => setNotifyTg(!notifyTg)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* App Toggle */}
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="font-medium">اطلاع‌رسانی اپلیکیشن</div>
                <div className="text-xs text-slate-500">دریافت اعلان درون برنامه‌ای (وب)</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="notifyWeb" 
                  checked={notifyWeb}
                  onChange={() => setnotifyWeb(!notifyWeb)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: READ ONLY FIELDS --- */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/50">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Shield className="w-5 h-5 text-slate-400" />
              اطلاعات حساب (غیرقابل تغییر)
            </h3>
            
            <div className="space-y-5">
              <ReadOnlyField 
              dir='ltr'
                label="شماره موبایل" 
                value={user.phoneNumber || '---'} 
                icon={<Smartphone className="w-4 h-4" />}
              />
              
              {/* <ReadOnlyField 
                label="شناسه کاربری تلگرام" 
                value={user.telegramId || 'متصل نشده'} 
                isMono 
              /> */}
              
              <ReadOnlyField 
                label="وضعیت اشتراک" 
                value={user.subscriptionExpiresAt 
                  ? `انقضا: ${new Date(user.subscriptionExpiresAt).toLocaleDateString('fa-IR')}` 
                  : 'اشتراک فعال ندارید'}
                badge={!!user.subscriptionExpiresAt}
              />

              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2 mt-4">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>برای تغییر شماره موبایل یا حساب تلگرام، لطفا با پشتیبانی تماس بگیرید. این اطلاعات به دلایل امنیتی قفل شده‌اند.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

// Helper component for Read-Only fields
function ReadOnlyField({ label, value, icon, isMono, badge, dir }: any) {
  return (
    <div className="flex flex-col gap-1 opacity-80 cursor-not-allowed">
      <span className="text-xs text-slate-500 font-medium ml-1">{label}</span>
      <div  dir={dir || 'rtl'} className="flex items-center justify-between bg-slate-200/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl">
        <span className={`text-slate-700 dark:text-slate-300 ${isMono ? 'font-mono' : ''} ${badge ? 'text-amber-600 dark:text-amber-500 font-bold' : ''}`} 
       >
          {value}
        </span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
    </div>
  )
}
