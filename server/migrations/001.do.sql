-- Migration: Complete database schema
-- Version: 001
-- Consolidated migration with adult/kid terminology

-- 1. Create users table (renamed to reflect adult/kid roles)
CREATE TABLE IF NOT EXISTS public.users (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "role" VARCHAR(50) NOT NULL CHECK ("role" IN ('adult', 'kid')),
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedOn" TIMESTAMP NULL,
    "lockedUntil" TIMESTAMP NULL,
    "avatar" BYTEA NULL
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users("name");
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users("role");

-- Unique constraint on name for non-deleted users only
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_name_unique ON public.users("name") WHERE "deletedOn" IS NULL;

-- 2. Seed default adult user
INSERT INTO public.users ("name", "password", "role")
SELECT 'adult', 'adult123', 'adult'
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE "name" = 'adult' 
      AND "deletedOn" IS NULL
);

-- 3. Create choreLifecycles table
CREATE TABLE IF NOT EXISTS public.choreLifecycles (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "infinite" BOOLEAN NOT NULL DEFAULT false,
    "daily" BOOLEAN NOT NULL DEFAULT false,
    "daysOfWeekMask" INTEGER NULL,
    "maxPerDay" INTEGER NULL,
    "maxPerHour" INTEGER NULL
);

-- 4. Create choreRates table
CREATE TABLE IF NOT EXISTS public.choreRates (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "each" DOUBLE PRECISION NULL,
    "formula" VARCHAR(20) NULL,
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create accounts table (depends on users)
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

-- 6. Create chores table (depends on choreLifecycles and choreRates)
CREATE TABLE IF NOT EXISTS public.chores (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NULL,
    "link" VARCHAR(256) NULL,
    "avatar" BYTEA NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lifecycleId" UUID NOT NULL REFERENCES public.choreLifecycles("id") ON DELETE RESTRICT,
    "rateId" UUID NOT NULL REFERENCES public.choreRates("id") ON DELETE RESTRICT
);

-- Indexes for chores
CREATE INDEX IF NOT EXISTS idx_chores_name ON public.chores("name");

-- 7. Create balances table (depends on accounts)
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

-- 8. Create efforts table (depends on chores, users)
CREATE TABLE IF NOT EXISTS public.efforts (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "choreId" UUID NOT NULL REFERENCES public.chores("id") ON DELETE RESTRICT,
    "loggedByUserId" UUID NOT NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "effortedOn" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedByUserId" UUID NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "deniedByUserId" UUID NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "completion" INTEGER NOT NULL CHECK ("completion" >= 0 AND "completion" <= 100),
    "notes" TEXT NULL,
    "lastModifiedOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "accountId" UUID NULL REFERENCES public.accounts("id") ON DELETE RESTRICT
);

-- Indexes for efforts
CREATE INDEX IF NOT EXISTS idx_efforts_chore_id ON public.efforts("choreId");
CREATE INDEX IF NOT EXISTS idx_efforts_logged_by_user_id ON public.efforts("loggedByUserId");
CREATE INDEX IF NOT EXISTS idx_efforts_efforted_on ON public.efforts("effortedOn");
CREATE INDEX IF NOT EXISTS idx_efforts_account_id ON public.efforts("accountId");
CREATE INDEX IF NOT EXISTS idx_efforts_denied_by_user_id ON public.efforts("deniedByUserId");

-- 9. Create withdrawals table (depends on accounts, users)
CREATE TABLE IF NOT EXISTS public.withdrawals (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "accountId" UUID NOT NULL REFERENCES public.accounts("id") ON DELETE RESTRICT,
    "loggedBy" UUID NOT NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "appliedToBalanceId" UUID NULL REFERENCES public.balances("id") ON DELETE RESTRICT
);

-- Indexes for withdrawals
CREATE INDEX IF NOT EXISTS idx_withdrawals_account_id ON public.withdrawals("accountId");
CREATE INDEX IF NOT EXISTS idx_withdrawals_logged_by ON public.withdrawals("loggedBy");
CREATE INDEX IF NOT EXISTS idx_withdrawals_applied_to_balance_id ON public.withdrawals("appliedToBalanceId");

-- 10. Create payments table (depends on efforts, accounts, users)
CREATE TABLE IF NOT EXISTS public.payments (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "effortId" UUID NOT NULL REFERENCES public.efforts("id") ON DELETE RESTRICT,
    "payedToAccountId" UUID NOT NULL REFERENCES public.accounts("id") ON DELETE RESTRICT,
    "payedByUserId" UUID NOT NULL REFERENCES public.users("id") ON DELETE RESTRICT,
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT NULL,
    "appliedToBalanceId" UUID NULL REFERENCES public.balances("id") ON DELETE RESTRICT
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_effort_id ON public.payments("effortId");
CREATE INDEX IF NOT EXISTS idx_payments_payed_to_account_id ON public.payments("payedToAccountId");
CREATE INDEX IF NOT EXISTS idx_payments_payed_by_user_id ON public.payments("payedByUserId");
CREATE INDEX IF NOT EXISTS idx_payments_applied_to_balance_id ON public.payments("appliedToBalanceId");
