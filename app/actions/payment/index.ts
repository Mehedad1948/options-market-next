'use server';

import { getSession } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { requestPayment } from "@/lib/zarrinpal";
import { redirect } from "next/navigation";

// Define Plans strictly on the server to prevent price tampering
const PLANS = {
  "1-month": { price: 100000, days: 30, name: "اشتراک ۱ ماهه" },
  "6-month": { price: 500000, days: 180, name: "اشتراک ۶ ماهه" },
  "1-year":  { price: 900000, days: 365, name: "اشتراک ۱ ساله" },
};

export async function initiatePaymentAction(planKey: string) {
  // 1. Validate Session
  const session = await getSession();
  
  // Your session payload is { userId: string, ... }, not { user: { ... } }
  if (!session || !session.userId) {
    redirect("/login?returnUrl=/plans");
  }

  // 2. FETCH FULL USER DATA FROM DATABASE
  // We need this to get the phoneNumber/mobile and ensure user exists
  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!user) {
    // Edge case: Session exists but user was deleted
    redirect("/login");
  }

  const plan = PLANS[planKey as keyof typeof PLANS];
  if (!plan) throw new Error("Invalid Plan");

  // 3. Request Authority from ZarrinPal
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`;
  
  // Use 'user.phoneNumber' from database. 
  // (Assuming your schema uses 'phoneNumber', if it is 'mobile' change it here)
  const userMobile = user.phoneNumber || ""; 

  const zpResponse = await requestPayment({
    amount: plan.price,
    description: `خرید ${plan.name} - کاربر ${userMobile}`,
    callbackUrl: callbackUrl,
    mobile: userMobile,
    // email: user.email // Optional: Add if you have email in schema
  });

  if (!zpResponse.success || !zpResponse.authority) {
    console.error("ZarrinPal Error:", zpResponse.error);
    throw new Error("Payment Gateway Error");
  }

  // 4. Save Pending Payment to DB
  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: plan.price,
      description: plan.name,
      authority: zpResponse.authority,
      status: "PENDING",
    }
  });

  // 5. Redirect User to Bank
  if (zpResponse.url) {
     redirect(zpResponse.url);
  }
 
}
