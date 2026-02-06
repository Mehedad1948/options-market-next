const ZARINPAL_MERCHANT_ID = "41414141-4141-4141-4141-414141414141"; // Sandbox Test ID

// Toggle this to false when going to production
const IS_SANDBOX = true; 

const BASE_URL = IS_SANDBOX 
  ? "https://sandbox.zarinpal.com/pg/v4/payment" 
  : "https://api.zarinpal.com/pg/v4/payment";

const GATEWAY_URL = IS_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/StartPay"
  : "https://www.zarinpal.com/pg/StartPay";

interface PaymentRequest {
  amount: number; // In Tomans
  callbackUrl: string;
  description: string;
  email?: string;
  mobile?: string;
}

export async function requestPayment(data: PaymentRequest) {
  try {
    const response = await fetch(`${BASE_URL}/request.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount: data.amount, // ZarinPal V4 usually takes Toman if configured, but check docs. Usually Rials. 
        currency: "IRT", // Using Toman
        callback_url: data.callbackUrl,
        description: data.description,
        metadata: { email: data.email, mobile: data.mobile }
      }),
      cache: 'no-store'
    });

    const result = await response.json();
    
    if (result.data && result.data.code === 100) {
      return {
        success: true,
        authority: result.data.authority,
        url: `${GATEWAY_URL}/${result.data.authority}`
      };
    }
    return { success: false, error: "Failed to initiate payment" };
  } catch (error) {
    console.error("ZarinPal Request Error:", error);
    return { success: false, error: "Connection error" };
  }
}

export async function verifyPayment(authority: string, amount: number) {
  try {
    const response = await fetch(`${BASE_URL}/verify.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount: amount,
        authority: authority
      }),
      cache: 'no-store'
    });

    const result = await response.json();

    // Code 100 = Success, Code 101 = Verified (Double verification)
    if (result.data && (result.data.code === 100 || result.data.code === 101)) {
      return {
        success: true,
        refId: result.data.ref_id
      };
    }
    return { success: false };
  } catch (error) {
    console.error("ZarinPal Verify Error:", error);
    return { success: false };
  }
}
