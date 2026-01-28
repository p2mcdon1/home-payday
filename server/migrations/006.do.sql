-- Migration: Add deniedByUserId field to efforts table
-- Version: 006

ALTER TABLE public.efforts
ADD COLUMN IF NOT EXISTS "deniedByUserId" UUID NULL REFERENCES public.users("id") ON DELETE RESTRICT;

-- Index for deniedByUserId in efforts
CREATE INDEX IF NOT EXISTS idx_efforts_denied_by_user_id ON public.efforts("deniedByUserId");
