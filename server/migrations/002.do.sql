-- Migration: Seed default admin user
-- Version: 002

-- Only insert if admin user doesn't exist
INSERT INTO public.users ("name", "password", "role")
SELECT 'admin', 'admin123', 'admin'
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE "name" = 'admin' 
      AND "deletedOn" IS NULL
);
