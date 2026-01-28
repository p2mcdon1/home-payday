-- Rollback: Remove accountId field from efforts table
-- Version: 005

DROP INDEX IF EXISTS idx_efforts_account_id;

ALTER TABLE public.efforts
DROP COLUMN IF EXISTS "accountId";
