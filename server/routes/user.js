const express = require('express');
const db = require('../db');

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

module.exports = router;
