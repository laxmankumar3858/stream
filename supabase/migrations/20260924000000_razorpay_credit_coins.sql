-- Migration: Add credit_coins RPC + payment_logs table
-- This function is called by the razorpay-verify Edge Function after signature verification

-- 1. Payment logs table (idempotency: prevent double-crediting same payment)
CREATE TABLE IF NOT EXISTS payment_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id   TEXT UNIQUE NOT NULL,          -- razorpay_payment_id (unique constraint prevents duplicate credits)
  order_id     TEXT NOT NULL,
  installation_id TEXT NOT NULL,
  tokens       INTEGER NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 2. credit_coins RPC
-- Called by Edge Function after signature is verified
-- Returns the new coin_balance
CREATE OR REPLACE FUNCTION credit_coins(
  p_installation_id TEXT,
  p_amount          INTEGER,
  p_payment_id      TEXT,
  p_order_id        TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Idempotency check: if payment already processed, just return current balance
  IF EXISTS (SELECT 1 FROM payment_logs WHERE payment_id = p_payment_id) THEN
    SELECT coin_balance INTO v_new_balance
    FROM users
    WHERE installation_id = p_installation_id;
    RETURN v_new_balance;
  END IF;

  -- Insert payment log first (prevents race conditions)
  INSERT INTO payment_logs (payment_id, order_id, installation_id, tokens)
  VALUES (p_payment_id, p_order_id, p_installation_id, p_amount);

  -- Credit coins to user
  UPDATE users
  SET coin_balance = coin_balance + p_amount
  WHERE installation_id = p_installation_id
  RETURNING coin_balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'User not found for installation_id: %', p_installation_id;
  END IF;

  RETURN v_new_balance;
END;
$$;
