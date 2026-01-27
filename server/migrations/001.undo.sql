-- Rollback: Drop users table
-- Version: 001

-- Drop indexes first
DROP INDEX IF EXISTS public.idx_users_name;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_users_name_unique;

DROP TABLE IF EXISTS public.users CASCADE;
