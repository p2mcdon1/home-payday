-- Rollback: Remove enabled field from chores table
-- Version: 004

ALTER TABLE public.chores
DROP COLUMN IF EXISTS "enabled";
