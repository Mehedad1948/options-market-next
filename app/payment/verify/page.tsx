import { verifyPayment } from "@/lib/zarrinpal";
import Link from "next/link";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import RevalidatePathClient from '@/app/components/utils/revalidatePathClient';

// PLANS MAPPING (Should match actions.ts logic)
const PLAN_DAYS = {
  "اشتراک ۱ ماهه": 30,
  "اشتراک ۶ ماهه": 180,
  "اشتراک ۱ ساله": 365,
};

export default async function VerifyPage({ searchParams }: { searchParams: { Authority: string; Status: string } }) {
  const { Authority, Status } = await searchParams;



  // 1. Basic Validation
  if (!Authority || Status !== "OK") {
    return <ResultView success={false} message="پرداخت توسط کاربر لغو شد یا ناموفق بود." />;
  }

  // 2. Find Pending Payment
  const payment = await prisma.payment.findUnique({
    where: { authority: Authority },
    include: { user: true }
  });

  if (!payment) return <ResultView success={false} message="تراکنش یافت نشد." />;
  if (payment.status === "SUCCESS") return <ResultView success={true} message="این تراکنش قبلاً ثبت شده است." refId={payment.refId || ""} />;

  // 3. Verify with ZarrinPal
  const verification = await verifyPayment(Authority, payment.amount);

  if (verification.success) {
    // 4. Update Database (Success)

    // Calculate new expiry date
    const currentExpiry = payment.user.subscriptionExpiresAt
      ? new Date(payment.user.subscriptionExpiresAt)
      : new Date();

    // If expired, start from now. If active, add to existing.
    const startDate = currentExpiry > new Date() ? currentExpiry : new Date();

    // Determine days based on description (simple mapping)
    const daysToAdd = PLAN_DAYS[payment.description as keyof typeof PLAN_DAYS] || 30;

    startDate.setDate(startDate.getDate() + daysToAdd);

    // Transaction
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", refId: verification.refId?.toString() }
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: { subscriptionExpiresAt: startDate }
      })
    ]);

    revalidatePath('/', 'layout');

    return <ResultView success={true} message="اشتراک شما با موفقیت فعال شد." refId={verification.refId?.toString() || ""} />;
  } else {
    // 4. Update Database (Failed)
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" }
    });
    return <ResultView success={false} message="تایید تراکنش از سمت بانک ناموفق بود." />;
  }
}

// --- UI COMPONENT ---
function ResultView({ success, message, refId }: { success: boolean; message: string; refId?: string }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      {success && <RevalidatePathClient path={'/'} type='layout' />}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${success ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          }`}>
          {success ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
        </div>

        <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
          {success ? "پرداخت موفق" : "پرداخت ناموفق"}
        </h1>

        <p className="text-slate-500 mb-6">{message}</p>

        {success && refId && (
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-6">
            <span className="text-xs text-slate-500 block mb-1">کد پیگیری تراکنش</span>
            <span className="font-mono font-bold text-lg">{refId}</span>
          </div>
        )}

        <Link
          href="/dashboard"
          className="block w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-xl transition-colors"
        >
          بازگشت به داشبورد
        </Link>
      </div>
    </div>
  );
}
