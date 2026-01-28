-- Migration: Add enabled field to chores table
-- Version: 004

ALTER TABLE public.chores
ADD COLUMN IF NOT EXISTS "enabled" BOOLEAN NOT NULL DEFAULT true;
