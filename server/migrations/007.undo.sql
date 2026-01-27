-- Migration: Drop balances table
-- Version: 007

-- Drop foreign key constraint first
ALTER TABLE public.accounts
DROP CONSTRAINT IF EXISTS fk_accounts_last_balance_id;

DROP TABLE IF EXISTS public.balances;
