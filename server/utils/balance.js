/**
 * Balance update utility functions
 * Handles transactional balance updates for accounts
 */

const db = require('../db');

/**
 * Update balance for a specific account
 * Aggregates all unbalanced payments and withdrawals, creates a new balance record,
 * and marks all transactions as applied to that balance.
 * 
 * @param {string} accountId - The account ID to update
 * @param {object} client - Optional database client (for use within existing transactions)
 * @returns {Promise<object>} - The created balance record
 */
async function updateAccountBalance(accountId, client = null) {
  const useExternalClient = !!client;
  
  if (!client) {
    client = await db.pool.connect();
  }

  try {
    if (!useExternalClient) {
      await client.query('BEGIN');
    }

    // Get current account balance from lastBalanceId
    const accountResult = await client.query(
      `
        SELECT a."lastBalanceId", COALESCE(b."amount", 0) as "currentBalance"
        FROM public.accounts a
        LEFT JOIN public.balances b ON a."lastBalanceId" = b."id"
        WHERE a."id" = $1
      `,
      [accountId]
    );

    if (accountResult.rows.length === 0) {
      if (!useExternalClient) {
        await client.query('ROLLBACK');
        client.release();
      }
      throw new Error('Account not found');
    }

    const currentBalance = Number(accountResult.rows[0].currentBalance) || 0;

    // Get unbalanced payments for this account
    const paymentsResult = await client.query(
      `
        SELECT "id", "amount"
        FROM public.payments
        WHERE "payedToAccountId" = $1
          AND "appliedToBalanceId" IS NULL
      `,
      [accountId]
    );

    // Get unbalanced withdrawals for this account
    const withdrawalsResult = await client.query(
      `
        SELECT "id", "amount"
        FROM public.withdrawals
        WHERE "accountId" = $1
          AND "appliedToBalanceId" IS NULL
      `,
      [accountId]
    );

    // If no unbalanced transactions, return null (no balance update needed)
    if (paymentsResult.rows.length === 0 && withdrawalsResult.rows.length === 0) {
      if (!useExternalClient) {
        await client.query('ROLLBACK');
        client.release();
      }
      return null;
    }

    // Calculate new balance: current balance + sum of payments - sum of withdrawals
    let pendingAmount = 0;

    for (const row of paymentsResult.rows) {
      pendingAmount += Number(row.amount) || 0;
    }

    for (const row of withdrawalsResult.rows) {
      pendingAmount -= Number(row.amount) || 0;
    }

    const netAmount = currentBalance + pendingAmount;

    // Create new balance record
    const balanceResult = await client.query(
      `
        INSERT INTO public.balances ("accountId", "amount")
        VALUES ($1, $2)
        RETURNING "id", "accountId", "amount", "calculatedOn"
      `,
      [accountId, netAmount]
    );

    const balanceId = balanceResult.rows[0].id;

    // Update account with new lastBalanceId
    await client.query(
      `
        UPDATE public.accounts
        SET "lastBalanceId" = $2
        WHERE "id" = $1
      `,
      [accountId, balanceId]
    );

    // Mark payments as applied to this balance
    await client.query(
      `
        UPDATE public.payments
        SET "appliedToBalanceId" = $2
        WHERE "payedToAccountId" = $1
          AND "appliedToBalanceId" IS NULL
      `,
      [accountId, balanceId]
    );

    // Mark withdrawals as applied to this balance
    await client.query(
      `
        UPDATE public.withdrawals
        SET "appliedToBalanceId" = $2
        WHERE "accountId" = $1
          AND "appliedToBalanceId" IS NULL
      `,
      [accountId, balanceId]
    );

    if (!useExternalClient) {
      await client.query('COMMIT');
      client.release();
    }

    return balanceResult.rows[0];
  } catch (error) {
    if (!useExternalClient) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error during transaction rollback:', rollbackError);
      }
      client.release();
    }
    throw error;
  }
}

module.exports = {
  updateAccountBalance,
};
