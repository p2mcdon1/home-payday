-- Migration: Create chores table
-- Version: 006

CREATE TABLE IF NOT EXISTS public.chores (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NULL,
    "link" VARCHAR(256) NULL,
    "avatar" BYTEA NULL,
    "lifecycleId" UUID NOT NULL REFERENCES public.choreLifecycles("id") ON DELETE RESTRICT,
    "rateId" UUID NOT NULL REFERENCES public.choreRates("id") ON DELETE RESTRICT
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chores_name ON public.chores("name");
