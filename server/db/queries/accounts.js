/**
 * Account-related SQL queries
 * All queries use fully qualified table names (schema.table)
 * Following SQL Style Guide conventions
 * All identifiers use camelCase and are quoted for consistency
 */

module.exports = {
  // Get all accounts for a user (not deleted)
  // Includes current balance and whether there are unbalanced payments/withdrawals
  getAccountsByUserId: `
    SELECT 
      a."id",
      a."name",
      a."ownedByUserId",
      a."createdOn",
      a."deletedOn",
      a."lockedOn",
      a."lastBalanceId",
      COALESCE(b."amount", 0) as "balance",
      (
        EXISTS (
          SELECT 1
          FROM public.payments p
          WHERE p."payedToAccountId" = a."id"
            AND p."appliedToBalanceId" IS NULL
        )
        OR EXISTS (
          SELECT 1
          FROM public.withdrawals w
          WHERE w."accountId" = a."id"
            AND w."appliedToBalanceId" IS NULL
        )
      ) AS "hasUnbalancedActivity"
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

  // Get oldest account for a user (sorted by createdOn)
  getOldestAccountByUserId: `
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
    ORDER BY a."createdOn" ASC
    LIMIT 1
  `,
};
