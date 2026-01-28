-- Migration: Add accountId field to efforts table
-- Version: 005

ALTER TABLE public.efforts
ADD COLUMN IF NOT EXISTS "accountId" UUID NULL REFERENCES public.accounts("id") ON DELETE RESTRICT;

-- Index for accountId in efforts
CREATE INDEX IF NOT EXISTS idx_efforts_account_id ON public.efforts("accountId");
