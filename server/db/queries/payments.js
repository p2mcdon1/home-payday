/**
 * Payment-related SQL queries
 * All queries use fully qualified table names (schema.table)
 * Following SQL Style Guide conventions
 * All identifiers use camelCase and are quoted for consistency
 */

module.exports = {
  // Create new payment
  createPayment: `
    INSERT INTO public.payments ("effortId", "payedToAccountId", "payedByUserId", "amount", "notes")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING "id", "effortId", "payedToAccountId", "payedByUserId", "amount", "notes", "createdOn"
  `,
};
