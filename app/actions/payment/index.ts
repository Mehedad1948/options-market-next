'use server';

import { getSession } from "@/lib/auth"; // Adjust path to your auth
import { prisma } from '@/lib/prisma';   // Adjust path to your prisma
import { requestPayment } from "@/lib/zarrinpal";
import { redirect } from "next/navigation";

const PLANS = {
  "1-month": { price: 100000, days: 30, name: "اشتراک ۱ ماهه" },
  "6-month": { price: 500000, days: 180, name: "اشتراک ۶ ماهه" },
  "1-year":  { price: 900000, days: 365, name: "اشتراک ۱ ساله" },
};

export async function initiatePaymentAction(planKey: string) {
  // 1. Validate Session
  const session = await getSession();
  
  if (!session || !session.userId) {
    redirect("/login?returnUrl=/plans");
  }

  // 2. Fetch User
  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!user) redirect("/login");

  const plan = PLANS[planKey as keyof typeof PLANS];
  if (!plan) throw new Error("Plan not found");

  // 3. Prepare Data
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`;
  
  // Clean mobile number (Send undefined if empty to prevent validation error)
  const userMobile = user.phoneNumber && user.phoneNumber.length >= 10 
    ? user.phoneNumber 
    : undefined;

  // 4. Call ZarrinPal
  const zpResponse = await requestPayment({
    amount: plan.price,
    description: `خرید ${plan.name}`,
    callbackUrl: callbackUrl,
    mobile: userMobile,
  });

  // 5. Check Failure
  if (!zpResponse.success || !zpResponse.authority) {
    // This logs to your SERVER terminal. Check it to see the real error!
    console.error("❌ Payment Failed. Details:", zpResponse.error);
    throw new Error(`درگاه پرداخت: ${zpResponse.error}`);
  }

  // 6. Save DB Record
  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: plan.price,
      description: plan.name,
      authority: zpResponse.authority,
      status: "PENDING",
    }
  });

  // 7. Redirect
  if (zpResponse.url) {
     redirect(zpResponse.url);
  }
}
