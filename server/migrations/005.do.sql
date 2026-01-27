-- Migration: Create choreRates table
-- Version: 005

CREATE TABLE IF NOT EXISTS public.choreRates (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "each" DOUBLE PRECISION NULL,
    "formula" VARCHAR(20) NULL,
    "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
