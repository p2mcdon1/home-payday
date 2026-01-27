-- Migration: Create accounts table
-- Version: 003

CREATE TABLE IF NOT EXISTS public.accounts (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "ownerUserId" UUID NOT NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedOn" TIMESTAMP NULL,
    "lockedOn" TIMESTAMP NULL,
    "avatar" BYTEA NULL,
    "lastBalanceId" UUID NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_accounts_owner_user_id ON public.accounts("ownerUserId");
