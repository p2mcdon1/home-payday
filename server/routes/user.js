const express = require('express');
const db = require('../db');
const accountQueries = require('../db/queries/accounts');
const choreQueries = require('../db/queries/chores');

const router = express.Router();

// Note: Authentication is handled in index.js

// Get current user's profile
router.get('/profile', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT "id", "name", "role", "createdOn"
       FROM public.users
       WHERE "id" = $1 AND "deletedOn" IS NULL`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get current user's balance
router.get('/balance', async (req, res) => {
  try {
    // Note: Balance functionality will be implemented when transactions are linked to users
    res.json({
      balance: 0,
      userId: req.user.id,
      name: req.user.name,
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Get current user's accounts with balances
router.get('/accounts', async (req, res) => {
  try {
    const result = await db.query(
      accountQueries.getAccountsByUserId,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Create new account for current user
router.post('/accounts', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Account name is required' });
    }

    const result = await db.query(
      accountQueries.createAccount,
      [name.trim(), req.user.id]
    );

    // Fetch the account with balance (will be 0)
    const accountResult = await db.query(
      accountQueries.getAccountById,
      [result.rows[0].id]
    );

    res.status(201).json(accountResult.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Account name already exists' });
    }
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Get current user's transaction history
router.get('/transactions', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // Get transactions for this user
    const result = await db.query(
      `SELECT t."id", t."amount", t."transactionType", t."description", t."createdAt",
              u."name" as "createdByName"
       FROM public.transactions t
       LEFT JOIN public.users u ON t."createdBy" = u."id"
       WHERE t."userId" = $1
       ORDER BY t."createdAt" DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), parseInt(offset)]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get available chores for current user
router.get('/chores', async (req, res) => {
  try {
    const result = await db.query(
      choreQueries.getAvailableChores,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching available chores:', error);
    res.status(500).json({ error: 'Failed to fetch available chores' });
  }
});

module.exports = router;
