// supabase/functions/razorpay-verify/index.ts
// Deploy: supabase functions deploy razorpay-verify

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HMAC-SHA256 using native Web Crypto API (no external imports needed)
async function computeHmacSha256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      installation_id,
      tokens_to_credit,
    } = await req.json();

    // 1. Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !installation_id || !tokens_to_credit) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 2. Verify Razorpay signature using Web Crypto API
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keySecret) {
      throw new Error('RAZORPAY_KEY_SECRET env variable not set');
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = await computeHmacSha256(keySecret, body);

    if (expectedSignature !== razorpay_signature) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 3. Credit coins in DB
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase.rpc('credit_coins', {
      p_installation_id: installation_id,
      p_amount: tokens_to_credit,
      p_payment_id: razorpay_payment_id,
      p_order_id: razorpay_order_id,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, new_balance: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('razorpay-verify error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
