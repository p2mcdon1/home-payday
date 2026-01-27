-- Rollback: Remove default admin user
-- Version: 002

DELETE FROM public.users 
WHERE "name" = 'admin' 
  AND "password" = 'admin123' 
  AND "role" = 'admin';
