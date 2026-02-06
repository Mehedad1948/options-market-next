// lib/zarrinpal.ts
const ZARINPAL_MERCHANT_ID = process.env.ZARRINPAL_MERCHANT_ID || "41414141-4141-4141-4141-414141414141"; 

// Auto-detect environment
const IS_SANDBOX = process.env.NODE_ENV === "development"; 

const BASE_URL = IS_SANDBOX 
  ? "https://sandbox.zarinpal.com/pg/v4/payment" 
  : "https://api.zarinpal.com/pg/v4/payment";

const GATEWAY_URL = IS_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/StartPay"
  : "https://www.zarinpal.com/pg/StartPay";

interface PaymentRequest {
  amount: number; // Input in Tomans
  callbackUrl: string;
  description: string;
  email?: string;
  mobile?: string;
}

export async function requestPayment(data: PaymentRequest) {
  try {
    console.log("🔌 Initiating ZarrinPal Request...", {
      url: `${BASE_URL}/request.json`,
      merchant_id: ZARINPAL_MERCHANT_ID,
      amountToman: data.amount
    });

    const response = await fetch(`${BASE_URL}/request.json`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount: data.amount * 10, // CONVERT TOMAN TO RIAL (Required)
        callback_url: data.callbackUrl,
        description: data.description,
        metadata: { 
          email: data.email || "", 
          mobile: data.mobile || "" 
        }
      }),
      cache: 'no-store'
    });

    const result = await response.json();
    
    // Log the raw response to see specific error codes (like -9, -10, etc.)
    console.log("📡 ZarrinPal Response:", JSON.stringify(result, null, 2));

    // Check for success (Code 100)
    if (result.data && result.data.code === 100) {
      return {
        success: true,
        authority: result.data.authority,
        url: `${GATEWAY_URL}/${result.data.authority}`
      };
    }

    // Return specific error message
    const errorMsg = result.errors ? JSON.stringify(result.errors) : "Unknown Error";
    return { success: false, error: errorMsg };

  } catch (error) {
    console.error("💥 ZarrinPal Network Error:", error);
    return { success: false, error: "Network/Connection Error" };
  }
}

export async function verifyPayment(authority: string, amountToman: number) {
  try {
    const response = await fetch(`${BASE_URL}/verify.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount: amountToman * 10, // Convert to Rial
        authority: authority
      }),
      cache: 'no-store'
    });

    const result = await response.json();

    if (result.data && (result.data.code === 100 || result.data.code === 101)) {
      return {
        success: true,
        refId: result.data.ref_id
      };
    }
    return { success: false };
  } catch (error) {
    console.error("Verify Error:", error);
    return { success: false };
  }
}
