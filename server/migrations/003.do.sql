-- Migration: Create all application tables
-- Version: 003
-- Creates: accounts, choreLifecycles, choreRates, chores, balances, efforts, withdrawals, payments

-- 1. Create choreLifecycles table (no dependencies)
CREATE TABLE IF NOT EXISTS public.choreLifecycles (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "infinite" BOOLEAN NOT NULL DEFAULT false,
    "daily" BOOLEAN NOT NULL DEFAULT false,
    "daysOfWeekMask" INTEGER NULL,
    "maxPerDay" INTEGER NULL,
    "maxPerHour" INTEGER NULL
);

-- 2. Create choreRates table (no dependencies)
CREATE TABLE IF NOT EXISTS public.choreRates (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "each" DOUBLE PRECISION NULL,
    "formula" VARCHAR(20) NULL,
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create accounts table (depends on users)
CREATE TABLE IF NOT EXISTS public.accounts (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "ownedByUserId" UUID NOT NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedOn" TIMESTAMP NULL,
    "lockedOn" TIMESTAMP NULL,
    "avatar" BYTEA NULL,
    "lastBalanceId" UUID NULL
);

-- Indexes for accounts
CREATE INDEX IF NOT EXISTS idx_accounts_owned_by_user_id ON public.accounts("ownedByUserId");

-- Unique constraint on name per ownedByUserId for non-deleted accounts only
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_name_owned_by_user_unique 
ON public.accounts("name", "ownedByUserId") 
WHERE "deletedOn" IS NULL;

-- 4. Create chores table (depends on choreLifecycles and choreRates)
CREATE TABLE IF NOT EXISTS public.chores (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NULL,
    "link" VARCHAR(256) NULL,
    "avatar" BYTEA NULL,
    "lifecycleId" UUID NOT NULL REFERENCES public.choreLifecycles("id") ON DELETE RESTRICT,
    "rateId" UUID NOT NULL REFERENCES public.choreRates("id") ON DELETE RESTRICT
);

-- Indexes for chores
CREATE INDEX IF NOT EXISTS idx_chores_name ON public.chores("name");

-- 5. Create balances table (depends on accounts)
CREATE TABLE IF NOT EXISTS public.balances (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "accountId" UUID NOT NULL REFERENCES public.accounts("id") ON DELETE RESTRICT,
    "calculatedOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL
);

-- Indexes for balances
CREATE INDEX IF NOT EXISTS idx_balances_account_id ON public.balances("accountId");

-- Add foreign key constraint for lastBalanceId in accounts table
ALTER TABLE public.accounts
ADD CONSTRAINT fk_accounts_last_balance_id
FOREIGN KEY ("lastBalanceId") REFERENCES public.balances("id") ON DELETE RESTRICT;

-- 6. Create efforts table (depends on chores, users, balances)
CREATE TABLE IF NOT EXISTS public.efforts (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "choreId" UUID NOT NULL REFERENCES public.chores("id") ON DELETE RESTRICT,
    "loggedByUserId" UUID NOT NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "effortedOn" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedByUserId" UUID NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "completion" INTEGER NOT NULL CHECK ("completion" >= 0 AND "completion" <= 100),
    "notes" TEXT NULL,
    "lastModifiedOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efforts
CREATE INDEX IF NOT EXISTS idx_efforts_chore_id ON public.efforts("choreId");
CREATE INDEX IF NOT EXISTS idx_efforts_logged_by_user_id ON public.efforts("loggedByUserId");
CREATE INDEX IF NOT EXISTS idx_efforts_efforted_on ON public.efforts("effortedOn");

-- 7. Create withdrawals table (depends on accounts, users)
CREATE TABLE IF NOT EXISTS public.withdrawals (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "accountId" UUID NOT NULL REFERENCES public.accounts("id") ON DELETE RESTRICT,
    "loggedBy" UUID NOT NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NULL,
    "amount" DOUBLE PRECISION NOT NULL
);

-- Indexes for withdrawals
CREATE INDEX IF NOT EXISTS idx_withdrawals_account_id ON public.withdrawals("accountId");
CREATE INDEX IF NOT EXISTS idx_withdrawals_logged_by ON public.withdrawals("loggedBy");

-- 8. Create payments table (depends on efforts, accounts, users)
CREATE TABLE IF NOT EXISTS public.payments (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "effortId" UUID NOT NULL REFERENCES public.efforts("id") ON DELETE RESTRICT,
    "payedToAccountId" UUID NOT NULL REFERENCES public.accounts("id") ON DELETE RESTRICT,
    "payedByUserId" UUID NOT NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT NULL
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_effort_id ON public.payments("effortId");
CREATE INDEX IF NOT EXISTS idx_payments_payed_to_account_id ON public.payments("payedToAccountId");
CREATE INDEX IF NOT EXISTS idx_payments_payed_by_user_id ON public.payments("payedByUserId");
