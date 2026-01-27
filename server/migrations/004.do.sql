-- Migration: Create choreLifecycles table
-- Version: 004

CREATE TABLE IF NOT EXISTS public.choreLifecycles (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "infinite" BOOLEAN NOT NULL DEFAULT false,
    "daily" BOOLEAN NOT NULL DEFAULT false,
    "daysOfWeekMask" INTEGER NULL,
    "maxPerDay" INTEGER NULL,
    "maxPerHour" INTEGER NULL
);
