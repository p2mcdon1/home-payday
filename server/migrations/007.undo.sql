-- Rollback: Remove appliedToBalanceId from payments and withdrawals tables
-- Version: 007

-- Drop indexes first
DROP INDEX IF EXISTS idx_payments_applied_to_balance_id;
DROP INDEX IF EXISTS idx_withdrawals_applied_to_balance_id;

-- Drop columns
ALTER TABLE public.payments
DROP COLUMN IF EXISTS "appliedToBalanceId";

ALTER TABLE public.withdrawals
DROP COLUMN IF EXISTS "appliedToBalanceId";

