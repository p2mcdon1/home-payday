/**
 * Account-related SQL queries
 * All queries use fully qualified table names (schema.table)
 * Following SQL Style Guide conventions
 * All identifiers use camelCase and are quoted for consistency
 */

module.exports = {
  // Get all accounts for a user (not deleted)
  getAccountsByUserId: `
    SELECT 
      a."id",
      a."name",
      a."ownedByUserId",
      a."createdOn",
      a."deletedOn",
      a."lockedOn",
      a."lastBalanceId",
      COALESCE(b."amount", 0) as "balance"
    FROM public.accounts a
    LEFT JOIN public.balances b ON a."lastBalanceId" = b."id"
    WHERE a."ownedByUserId" = $1
      AND a."deletedOn" IS NULL
    ORDER BY a."createdOn" DESC
  `,

  // Create new account
  createAccount: `
    INSERT INTO public.accounts ("name", "ownedByUserId")
    VALUES ($1, $2)
    RETURNING "id", "name", "ownedByUserId", "createdOn"
  `,

  // Get account by ID (not deleted)
  getAccountById: `
    SELECT 
      a."id",
      a."name",
      a."ownedByUserId",
      a."createdOn",
      a."deletedOn",
      a."lockedOn",
      a."lastBalanceId",
      COALESCE(b."amount", 0) as "balance"
    FROM public.accounts a
    LEFT JOIN public.balances b ON a."lastBalanceId" = b."id"
    WHERE a."id" = $1
      AND a."deletedOn" IS NULL
  `,
};
