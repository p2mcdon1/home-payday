-- Migration: Create users table
-- Version: 001

CREATE TABLE IF NOT EXISTS public.users (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "role" VARCHAR(50) NOT NULL CHECK ("role" IN ('admin', 'user')),
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedOn" TIMESTAMP NULL,
    "lockedUntil" TIMESTAMP NULL,
    "avatar" BYTEA NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users("name");
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users("role");

-- Unique constraint on name for non-deleted users only
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_name_unique ON public.users("name") WHERE "deletedOn" IS NULL;
