// app/actions/payment.ts
'use server';

import { getSession } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { requestPayment } from "@/lib/zarrinpal";

export interface ActionState {
  success: boolean;
  message: string;
  url?: string;
}

const PLANS = {
  "1-month": { price: 100000, days: 30, name: "اشتراک ۱ ماهه" },
  "6-month": { price: 500000, days: 180, name: "اشتراک ۶ ماهه" },
  "1-year":  { price: 900000, days: 365, name: "اشتراک ۱ ساله" },
};

// ------------------------------------------------------------------
// FIX: Arguments reordered for .bind() compatibility
// 1. planKey (passed via bind)
// 2. prevState (passed by useFormState)
// 3. formData (passed by form submission)
// ------------------------------------------------------------------
export async function initiatePaymentAction(
  planKey: string,         
  prevState: ActionState,
  formData: FormData       
): Promise<ActionState> {

  const session = await getSession();
  if (!session?.userId) {
    return { success: false, message: "ابتدا باید وارد حساب کاربری خود شوید." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!user) {
    return { success: false, message: "کاربر یافت نشد." };
  }

  const plan = PLANS[planKey as keyof typeof PLANS];
  if (!plan) {
    return { success: false, message: "پلن انتخاب شده معتبر نیست." };
  }

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`;
  const userMobile = user.phoneNumber && user.phoneNumber.length >= 10 ? user.phoneNumber : undefined;

  const zpResponse = await requestPayment({
    amount: plan.price,
    description: `خرید ${plan.name}`,
    callbackUrl: callbackUrl,
    mobile: userMobile,
  });

  if (!zpResponse.success || !zpResponse.authority) {
    console.error("❌ Payment Failed. Details:", zpResponse.error);
    return { 
        success: false, 
        message: `خطا در اتصال به درگاه پرداخت: ${zpResponse.error || 'خطای نامشخص'}` 
    };
  }

  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: plan.price,
      description: plan.name,
      authority: zpResponse.authority,
      status: "PENDING",
    }
  });

  return { 
    success: true, 
    message: "در حال انتقال به درگاه پرداخت...", 
    url: zpResponse.url 
  };
}
