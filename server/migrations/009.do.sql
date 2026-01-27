-- Migration: Create withdrawals table
-- Version: 009

CREATE TABLE IF NOT EXISTS public.withdrawals (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "accountId" UUID NOT NULL REFERENCES public.accounts("id") ON DELETE RESTRICT,
    "loggedBy" UUID NOT NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NULL,
    "amount" DOUBLE PRECISION NOT NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_withdrawals_account_id ON public.withdrawals("accountId");
CREATE INDEX IF NOT EXISTS idx_withdrawals_logged_by ON public.withdrawals("loggedBy");
