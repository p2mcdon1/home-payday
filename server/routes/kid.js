const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const userQueries = require('../db/queries/users');
const accountQueries = require('../db/queries/accounts');
const choreQueries = require('../db/queries/chores');
const effortQueries = require('../db/queries/efforts');
const balanceUtils = require('../utils/balance');
const avatarUtils = require('../utils/avatar');

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

// Update current user's profile name
router.put('/profile',
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, avatar } = req.body;

      // Check if name is already taken by another user
      const existingUser = await db.query(
        userQueries.checkUserExists,
        [name.trim()]
      );

      if (existingUser.rows.length > 0 && existingUser.rows[0].id !== req.user.id) {
        return res.status(400).json({ error: 'Name is already taken' });
      }

      // Update the name
      const result = await db.query(
        userQueries.updateName,
        [name.trim(), req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      // Update avatar if provided
      if (avatar !== undefined) {
        let avatarBase64 = null;
        if (avatar) {
          try {
            avatarBase64 = await avatarUtils.processAvatarData(avatar);
          } catch (error) {
            return res.status(400).json({ error: error.message });
          }
        }
        
        const avatarResult = await db.query(
          userQueries.updateAvatar,
          [avatarBase64, req.user.id]
        );
        
        if (avatarResult.rows.length > 0) {
          result.rows[0].avatar = avatarResult.rows[0].avatar;
        }
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

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
    const { name, avatar } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Account name is required' });
    }

    // Process avatar if provided
    let avatarBase64 = null;
    if (avatar) {
      try {
        avatarBase64 = await avatarUtils.processAvatarData(avatar);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    const result = await db.query(
      accountQueries.createAccount,
      [name.trim(), req.user.id, avatarBase64]
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

// Log effort/work for current user
router.post('/efforts', async (req, res) => {
  try {
    const { choreId, completion = 100, notes, accountId, effortedOn } = req.body;

    if (!choreId) {
      return res.status(400).json({ error: 'Chore ID is required' });
    }

    if (completion < 0 || completion > 100) {
      return res.status(400).json({ error: 'Completion must be between 0 and 100' });
    }

    // Validate accountId belongs to user if provided
    if (accountId) {
      const accountCheck = await db.query(
        accountQueries.getAccountById,
        [accountId]
      );
      if (accountCheck.rows.length === 0 || accountCheck.rows[0].ownedByUserId !== req.user.id) {
        return res.status(400).json({ error: 'Invalid account ID' });
      }
    }

    const result = await db.query(
      effortQueries.createEffort,
      [
        choreId,
        req.user.id,
        effortedOn || new Date(),
        completion,
        notes || null,
        accountId || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating effort:', error);
    res.status(500).json({ error: 'Failed to create effort' });
  }
});

// Get pending payments for current user
router.get('/pending-payments', async (req, res) => {
  try {
    const result = await db.query(
      effortQueries.getPendingPayments,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
});

// Get transactions for a specific account
router.get('/accounts/:id/transactions', async (req, res) => {
  try {
    const accountId = req.params.id;

    // Verify account belongs to current user
    const accountResult = await db.query(
      accountQueries.getAccountById,
      [accountId]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (accountResult.rows[0].ownedByUserId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have access to this account' });
    }

    const result = await db.query(
      accountQueries.getAccountTransactions,
      [accountId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching account transactions:', error);
    res.status(500).json({ error: 'Failed to fetch account transactions' });
  }
});

// Note: Update balance endpoint removed - balances are now updated automatically
// when adults approve efforts or when withdrawals are created

module.exports = router;
