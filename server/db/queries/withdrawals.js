/**
 * Withdrawal-related SQL queries
 * All queries use fully qualified table names (schema.table)
 * Following SQL Style Guide conventions
 * All identifiers use camelCase and are quoted for consistency
 */

module.exports = {
  // Create new withdrawal
  createWithdrawal: `
    INSERT INTO public.withdrawals ("accountId", "loggedBy", "amount", "notes")
    VALUES ($1, $2, $3, $4)
    RETURNING "id", "accountId", "loggedBy", "amount", "notes", "createdOn"
  `,
};
