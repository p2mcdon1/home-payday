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
      ENCODE(a."avatar", 'base64') as "avatar",
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
    INSERT INTO public.accounts ("name", "ownedByUserId", "avatar")
    VALUES ($1, $2, CASE WHEN ($3::text) IS NULL THEN NULL ELSE DECODE($3::text, 'base64') END)
    RETURNING "id", "name", "ownedByUserId", "createdOn", ENCODE("avatar", 'base64') as "avatar"
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
      COALESCE(b."amount", 0) as "balance",
      ENCODE(a."avatar", 'base64') as "avatar"
    FROM public.accounts a
    LEFT JOIN public.balances b ON a."lastBalanceId" = b."id"
    WHERE a."id" = $1
      AND a."deletedOn" IS NULL
  `,

  // Update account avatar
  updateAccountAvatar: `
    UPDATE public.accounts
    SET "avatar" = CASE WHEN ($1::text) IS NULL THEN NULL ELSE DECODE($1::text, 'base64') END
    WHERE "id" = $2
      AND "deletedOn" IS NULL
    RETURNING "id", "name", ENCODE("avatar", 'base64') as "avatar"
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

  // Get all transactions for an account (payments, withdrawals, pending efforts, denied efforts)
  getAccountTransactions: `
    SELECT 
      'payment' as "type",
      p."id"::TEXT,
      p."amount",
      p."createdOn" as "timestamp",
      NULL::UUID as "choreId",
      c."name" as "choreName",
      'Done' as "status",
      NULL::TEXT as "loggedByName",
      NULL::TEXT as "deniedByName",
      NULL::TEXT as "notes"
    FROM public.payments p
    JOIN public.efforts e ON p."effortId" = e."id"
    JOIN public.chores c ON e."choreId" = c."id"
    WHERE p."payedToAccountId" = $1
    
    UNION ALL
    
    SELECT 
      'withdrawal' as "type",
      w."id"::TEXT,
      w."amount",
      w."createdOn" as "timestamp",
      NULL::UUID as "choreId",
      NULL::TEXT as "choreName",
      CASE 
        WHEN w."appliedToBalanceId" IS NULL THEN 'Pending'
        ELSE 'Done'
      END as "status",
      u."name" as "loggedByName",
      NULL::TEXT as "deniedByName",
      w."notes"
    FROM public.withdrawals w
    LEFT JOIN public.users u ON w."loggedBy" = u."id"
    WHERE w."accountId" = $1
    
    UNION ALL
    
    SELECT 
      'pending-effort' as "type",
      e."id"::TEXT,
      NULL::DOUBLE PRECISION as "amount",
      e."createdOn" as "timestamp",
      e."choreId",
      c."name" as "choreName",
      'Pending' as "status",
      NULL::TEXT as "loggedByName",
      NULL::TEXT as "deniedByName",
      NULL::TEXT as "notes"
    FROM public.efforts e
    JOIN public.chores c ON e."choreId" = c."id"
    LEFT JOIN public.payments p ON e."id" = p."effortId"
    WHERE e."accountId" = $1
      AND p."id" IS NULL
      AND e."deniedByUserId" IS NULL
    
    UNION ALL
    
    SELECT 
      'denied-effort' as "type",
      e."id"::TEXT,
      NULL::DOUBLE PRECISION as "amount",
      e."createdOn" as "timestamp",
      e."choreId",
      c."name" as "choreName",
      'Denied' as "status",
      NULL::TEXT as "loggedByName",
      u."name" as "deniedByName",
      NULL::TEXT as "notes"
    FROM public.efforts e
    JOIN public.chores c ON e."choreId" = c."id"
    LEFT JOIN public.users u ON e."deniedByUserId" = u."id"
    WHERE e."accountId" = $1
      AND e."deniedByUserId" IS NOT NULL
    
    ORDER BY "timestamp" DESC
  `,
};
