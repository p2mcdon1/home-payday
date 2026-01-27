-- Migration: Drop all application tables
-- Version: 003

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.withdrawals CASCADE;
DROP TABLE IF EXISTS public.efforts CASCADE;
DROP TABLE IF EXISTS public.balances CASCADE;
DROP TABLE IF EXISTS public.chores CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.choreRates CASCADE;
DROP TABLE IF EXISTS public.choreLifecycles CASCADE;
