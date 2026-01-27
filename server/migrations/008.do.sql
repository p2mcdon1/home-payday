-- Migration: Create efforts table
-- Version: 008

CREATE TABLE IF NOT EXISTS public.efforts (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "choreId" UUID NOT NULL REFERENCES public.chores("id") ON DELETE RESTRICT,
    "loggedBy" UUID NOT NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "effortedOn" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" UUID NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "completion" INTEGER NOT NULL CHECK ("completion" >= 0 AND "completion" <= 100),
    "notes" TEXT NULL,
    "lastModifiedOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "balancedAs" UUID NULL REFERENCES public.balances("id") ON DELETE RESTRICT
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_efforts_chore_id ON public.efforts("choreId");
CREATE INDEX IF NOT EXISTS idx_efforts_logged_by ON public.efforts("loggedBy");
CREATE INDEX IF NOT EXISTS idx_efforts_efforted_on ON public.efforts("effortedOn");
