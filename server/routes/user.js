const express = require('express');
const db = require('../db');

const router = express.Router();

// Note: Authentication is handled in index.js

// Get current user's employee profile
router.get('/profile', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.id, e.employee_id, e.name, e.email, e.current_balance, 
              e.created_at, e.updated_at
       FROM employees e
       WHERE e.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee profile not found' });
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
    const result = await db.query(
      `SELECT e.current_balance, e.employee_id, e.name
       FROM employees e
       WHERE e.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    res.json({
      balance: result.rows[0].current_balance,
      employee_id: result.rows[0].employee_id,
      name: result.rows[0].name,
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

    // First get employee ID
    const employeeResult = await db.query(
      'SELECT id FROM employees WHERE user_id = $1',
      [req.user.id]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const employeeId = employeeResult.rows[0].id;

    // Get transactions
    const result = await db.query(
      `SELECT t.id, t.amount, t.transaction_type, t.description, t.created_at,
              u.name as created_by_name
       FROM transactions t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.employee_id = $1
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`,
      [employeeId, parseInt(limit), parseInt(offset)]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;
