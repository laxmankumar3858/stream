// src/services/razorpayService.ts
// Handles: Razorpay order creation (via Razorpay API) + post-payment verification (via Supabase Edge Function)

import RazorpayCheckout, {
  RazorpayOptions,
  RazorpaySuccessResponse,
} from 'react-native-razorpay';

// ─── Config ────────────────────────────────────────────────────────────────
// Replace with your actual Razorpay Test Key ID (starts with rzp_test_)
const RAZORPAY_KEY_ID = 'rzp_test_Tfb1hmEGzBTK61';

// Your Supabase project URL
const SUPABASE_URL = 'https://lyxickdeidrjasdirppf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DiFhqz8EmDLXif8R4TOx-Q_j1uoTmzA';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface RazorpayOrderResponse {
  id: string;           // order_id from Razorpay
  amount: number;       // in paise (Rs 81 = 8100)
  currency: string;
}

export interface PaymentResult {
  success: boolean;
  newBalance: number;
}

// ─── Step 1: Create order on Razorpay ──────────────────────────────────────
// NOTE: In production, this should come from YOUR backend, not client-side.
// For now we're calling Razorpay Orders API directly (Test mode only).
// In production: move to a Supabase Edge Function to hide key_secret.
export const createRazorpayOrder = async (
  amountInRs: number,
): Promise<RazorpayOrderResponse> => {
  const amountInPaise = amountInRs * 100;

  // Razorpay Orders API requires Basic Auth: key_id:key_secret
  // ⚠️ For TEST use only. Move to server in production.
  const KEY_SECRET = 'DBJxNz1wljiI5y8ID5DLdGg3'; // Replace with your test key secret

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${KEY_SECRET}`)}`,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.description ?? 'Failed to create order');
  }

  return response.json() as Promise<RazorpayOrderResponse>;
};

// ─── Step 2: Open Razorpay Checkout ────────────────────────────────────────
export const openRazorpayCheckout = async (
  order: RazorpayOrderResponse,
  userEmail: string = '',
  userName: string = 'User',
): Promise<RazorpaySuccessResponse> => {
  const options: RazorpayOptions = {
    description: 'Stream Tokens',
    image: '', // optional: your app logo URL
    currency: 'INR',
    key: RAZORPAY_KEY_ID,
    amount: String(order.amount),
    order_id: order.id,
    name: 'Stream',
    prefill: {
      email: userEmail,
      contact: '9999999999', // dummy contact — hides the phone input step
      name: userName,
    },
    // Hide contact field so user doesn't see/edit it
    hidden: {
      contact: true,
    },
    readonly: {
      contact: true,
    },
    theme: { color: '#FF2A85' },
  } as RazorpayOptions;

  // This opens the Razorpay payment sheet
  return RazorpayCheckout.open(options);
};

// ─── Step 3: Verify payment + credit coins (via Supabase Edge Function) ────
export const verifyAndCreditCoins = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  installation_id: string,
  tokens_to_credit: number,
): Promise<number> => {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/razorpay-verify`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        installation_id,
        tokens_to_credit,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result?.error ?? 'Payment verification failed');
  }

  return result.new_balance as number;
};
