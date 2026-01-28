/**
 * Chore-related SQL queries
 * All queries use fully qualified table names (schema.table)
 * Following SQL Style Guide conventions
 * All identifiers use camelCase and are quoted for consistency
 */

module.exports = {
  // Get all chores (not deleted)
  getAllChores: `
    SELECT 
      c."id",
      c."name",
      c."description",
      c."link",
      c."enabled",
      cl."id" as "lifecycleId",
      cl."infinite",
      cl."daily",
      cl."daysOfWeekMask",
      cl."maxPerDay",
      cl."maxPerHour",
      cr."id" as "rateId",
      cr."each",
      cr."formula"
    FROM public.chores c
    JOIN public.choreLifecycles cl ON c."lifecycleId" = cl."id"
    JOIN public.choreRates cr ON c."rateId" = cr."id"
    ORDER BY c."name"
  `,

  // Get chore by ID
  getChoreById: `
    SELECT 
      c."id",
      c."name",
      c."description",
      c."link",
      c."enabled",
      c."lifecycleId",
      c."rateId"
    FROM public.chores c
    WHERE c."id" = $1
  `,

  // Create new chore
  createChore: `
    INSERT INTO public.chores ("name", "description", "link", "enabled", "lifecycleId", "rateId")
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING "id", "name", "description", "link", "enabled", "lifecycleId", "rateId"
  `,

  // Update chore
  updateChore: `
    UPDATE public.chores
    SET "name" = $2,
        "description" = $3,
        "link" = $4,
        "enabled" = $5,
        "lifecycleId" = $6,
        "rateId" = $7
    WHERE "id" = $1
    RETURNING "id", "name", "description", "link", "enabled", "lifecycleId", "rateId"
  `,

  // Delete chore (soft delete - if we add deletedOn later)
  // For now, we'll use hard delete if needed
  deleteChore: `
    DELETE FROM public.chores
    WHERE "id" = $1
  `,

  // Get all chore lifecycles
  getAllLifecycles: `
    SELECT 
      "id",
      "infinite",
      "daily",
      "daysOfWeekMask",
      "maxPerDay",
      "maxPerHour"
    FROM public.choreLifecycles
    ORDER BY "infinite" DESC, "daily" DESC
  `,

  // Get lifecycle by ID
  getLifecycleById: `
    SELECT 
      "id",
      "infinite",
      "daily",
      "daysOfWeekMask",
      "maxPerDay",
      "maxPerHour"
    FROM public.choreLifecycles
    WHERE "id" = $1
  `,

  // Create new lifecycle
  createLifecycle: `
    INSERT INTO public.choreLifecycles ("infinite", "daily", "daysOfWeekMask", "maxPerDay", "maxPerHour")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING "id", "infinite", "daily", "daysOfWeekMask", "maxPerDay", "maxPerHour"
  `,

  // Update lifecycle
  updateLifecycle: `
    UPDATE public.choreLifecycles
    SET "infinite" = $2,
        "daily" = $3,
        "daysOfWeekMask" = $4,
        "maxPerDay" = $5,
        "maxPerHour" = $6
    WHERE "id" = $1
    RETURNING "id", "infinite", "daily", "daysOfWeekMask", "maxPerDay", "maxPerHour"
  `,

  // Delete lifecycle
  deleteLifecycle: `
    DELETE FROM public.choreLifecycles
    WHERE "id" = $1
  `,

  // Get all chore rates
  getAllRates: `
    SELECT 
      "id",
      "each",
      "formula",
      "createdOn",
      "lastModifiedOn"
    FROM public.choreRates
    ORDER BY "createdOn" DESC
  `,

  // Get rate by ID
  getRateById: `
    SELECT 
      "id",
      "each",
      "formula",
      "createdOn",
      "lastModifiedOn"
    FROM public.choreRates
    WHERE "id" = $1
  `,

  // Create new rate
  createRate: `
    INSERT INTO public.choreRates ("each", "formula")
    VALUES ($1, $2)
    RETURNING "id", "each", "formula", "createdOn", "lastModifiedOn"
  `,

  // Update rate
  updateRate: `
    UPDATE public.choreRates
    SET "each" = $2,
        "formula" = $3,
        "lastModifiedOn" = CURRENT_TIMESTAMP
    WHERE "id" = $1
    RETURNING "id", "each", "formula", "createdOn", "lastModifiedOn"
  `,

  // Delete rate
  deleteRate: `
    DELETE FROM public.choreRates
    WHERE "id" = $1
  `,

  // Get available chores for a user based on current day and lifecycle rules
  // This query checks:
  // 1. Chore is enabled
  // 2. Lifecycle matches current day (infinite, daily, or day mask)
  // 3. Effort limits (maxPerDay, maxPerHour) are not exceeded
  getAvailableChores: `
    WITH current_day_of_week AS (
      SELECT EXTRACT(DOW FROM CURRENT_TIMESTAMP)::INTEGER as "dayOfWeek"
    ),
    today_efforts AS (
      SELECT 
        e."choreId",
        COUNT(*) FILTER (WHERE DATE(e."effortedOn") = CURRENT_DATE) as "effortsToday",
        COUNT(*) FILTER (
          WHERE DATE(e."effortedOn") = CURRENT_DATE 
          AND EXTRACT(HOUR FROM e."effortedOn") = EXTRACT(HOUR FROM CURRENT_TIMESTAMP)
        ) as "effortsThisHour"
      FROM public.efforts e
      WHERE e."loggedByUserId" = $1
      GROUP BY e."choreId"
    )
    SELECT 
      c."id",
      c."name",
      c."description",
      c."link",
      cl."id" as "lifecycleId",
      cl."infinite",
      cl."daily",
      cl."daysOfWeekMask",
      cl."maxPerDay",
      cl."maxPerHour",
      cr."id" as "rateId",
      cr."each",
      cr."formula",
      COALESCE(te."effortsToday", 0) as "effortsToday",
      COALESCE(te."effortsThisHour", 0) as "effortsThisHour"
    FROM public.chores c
    JOIN public.choreLifecycles cl ON c."lifecycleId" = cl."id"
    JOIN public.choreRates cr ON c."rateId" = cr."id"
    CROSS JOIN current_day_of_week cdow
    LEFT JOIN today_efforts te ON c."id" = te."choreId"
    WHERE c."enabled" = true
      AND (
        -- Infinite chores are always available
        cl."infinite" = true
        -- Daily chores are always available
        OR cl."daily" = true
        -- Check if current day is enabled in the mask
        -- DOW: Sunday=0, Monday=1, ..., Saturday=6
        -- Mask: Sunday=1 (2^0), Monday=2 (2^1), ..., Saturday=64 (2^6)
        OR (
          cl."daysOfWeekMask" IS NOT NULL 
          AND (cl."daysOfWeekMask" & CAST(POWER(2, cdow."dayOfWeek") AS INTEGER)) != 0
        )
      )
      -- Check maxPerDay limit
      AND (cl."maxPerDay" IS NULL OR COALESCE(te."effortsToday", 0) < cl."maxPerDay")
      -- Check maxPerHour limit
      AND (cl."maxPerHour" IS NULL OR COALESCE(te."effortsThisHour", 0) < cl."maxPerHour")
    ORDER BY c."name"
  `,
};
