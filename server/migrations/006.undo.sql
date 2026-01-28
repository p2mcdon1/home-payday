-- Rollback: Remove deniedByUserId field from efforts table
-- Version: 006

DROP INDEX IF EXISTS idx_efforts_denied_by_user_id;

ALTER TABLE public.efforts
DROP COLUMN IF EXISTS "deniedByUserId";
