-- Migration: Add appliedToBalanceId to payments and withdrawals tables
-- Version: 007

-- 1. Add appliedToBalanceId to payments (nullable FK to balances)
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS "appliedToBalanceId" UUID NULL REFERENCES public.balances("id") ON DELETE RESTRICT;

-- Index for appliedToBalanceId in payments
CREATE INDEX IF NOT EXISTS idx_payments_applied_to_balance_id ON public.payments("appliedToBalanceId");

-- 2. Add appliedToBalanceId to withdrawals (nullable FK to balances)
ALTER TABLE public.withdrawals
ADD COLUMN IF NOT EXISTS "appliedToBalanceId" UUID NULL REFERENCES public.balances("id") ON DELETE RESTRICT;

-- Index for appliedToBalanceId in withdrawals
CREATE INDEX IF NOT EXISTS idx_withdrawals_applied_to_balance_id ON public.withdrawals("appliedToBalanceId");

