/**
 * Effort-related SQL queries
 * All queries use fully qualified table names (schema.table)
 * Following SQL Style Guide conventions
 * All identifiers use camelCase and are quoted for consistency
 */

module.exports = {
  // Create new effort
  createEffort: `
    INSERT INTO public.efforts ("choreId", "loggedByUserId", "effortedOn", "completion", "notes", "accountId")
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING "id", "choreId", "loggedByUserId", "effortedOn", "completion", "notes", "accountId", "createdOn"
  `,

  // Get pending payments for a user (efforts without corresponding payments)
  getPendingPayments: `
    SELECT 
      e."id",
      e."choreId",
      e."effortedOn",
      e."completion",
      e."notes",
      e."accountId",
      e."createdOn",
      c."name" as "choreName",
      c."description" as "choreDescription",
      cr."each",
      cr."formula",
      a."name" as "accountName"
    FROM public.efforts e
    JOIN public.chores c ON e."choreId" = c."id"
    JOIN public.choreRates cr ON c."rateId" = cr."id"
    LEFT JOIN public.accounts a ON e."accountId" = a."id"
    LEFT JOIN public.payments p ON e."id" = p."effortId"
    WHERE e."loggedByUserId" = $1
      AND p."id" IS NULL
    ORDER BY e."effortedOn" DESC
  `,
};
