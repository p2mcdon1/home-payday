-- Migration: Create balances table
-- Version: 007

CREATE TABLE IF NOT EXISTS public.balances (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "accountId" UUID NOT NULL REFERENCES public.accounts("id") ON DELETE RESTRICT,
    "calculatedOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_balances_account_id ON public.balances("accountId");

-- Add foreign key constraint for lastBalanceId in accounts table
ALTER TABLE public.accounts
ADD CONSTRAINT fk_accounts_last_balance_id
FOREIGN KEY ("lastBalanceId") REFERENCES public.balances("id") ON DELETE RESTRICT;
