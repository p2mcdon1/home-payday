const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

// Note: Authentication and admin check are handled in index.js

// Get all employees
router.get('/employees', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.id, e.employee_id, e.name, e.email, e.current_balance, 
              e.created_at, u.id as user_id
       FROM employees e
       LEFT JOIN users u ON e.user_id = u.id
       ORDER BY e.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Create employee
router.post('/employees',
  [
    body('employee_id').trim().notEmpty(),
    body('name').trim().notEmpty(),
    body('email').optional().isEmail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { employee_id, name, email, user_id } = req.body;

      const result = await db.query(
        `INSERT INTO employees (employee_id, name, email, user_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, employee_id, name, email, current_balance, created_at`,
        [employee_id, name, email || null, user_id || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Employee ID already exists' });
      }
      console.error('Error creating employee:', error);
      res.status(500).json({ error: 'Failed to create employee' });
    }
  }
);

// Get employee by ID
router.get('/employees/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.id, e.employee_id, e.name, e.email, e.current_balance, 
              e.created_at, e.updated_at, u.id as user_id
       FROM employees e
       LEFT JOIN users u ON e.user_id = u.id
       WHERE e.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Update employee
router.put('/employees/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, user_id } = req.body;
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }
      if (email !== undefined) {
        updates.push(`email = $${paramCount++}`);
        values.push(email);
      }
      if (user_id !== undefined) {
        updates.push(`user_id = $${paramCount++}`);
        values.push(user_id);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(req.params.id);
      const result = await db.query(
        `UPDATE employees 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount}
         RETURNING id, employee_id, name, email, current_balance, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ error: 'Failed to update employee' });
    }
  }
);

// Add earnings to employee
router.post('/employees/:id/earn',
  [
    body('amount').isFloat({ min: 0.01 }),
    body('description').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, description } = req.body;
      const employeeId = req.params.id;
      const createdBy = req.user.id;

      // Verify employee exists
      const employeeCheck = await db.query(
        'SELECT id FROM employees WHERE id = $1',
        [employeeId]
      );

      if (employeeCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Create transaction
      const result = await db.query(
        `INSERT INTO transactions (employee_id, amount, transaction_type, description, created_by)
         VALUES ($1, $2, 'earn', $3, $4)
         RETURNING id, employee_id, amount, transaction_type, description, created_at`,
        [employeeId, amount, description || null, createdBy]
      );

      // Get updated balance
      const balanceResult = await db.query(
        'SELECT current_balance FROM employees WHERE id = $1',
        [employeeId]
      );

      res.status(201).json({
        transaction: result.rows[0],
        new_balance: balanceResult.rows[0].current_balance,
      });
    } catch (error) {
      console.error('Error adding earnings:', error);
      res.status(500).json({ error: 'Failed to add earnings' });
    }
  }
);

// Deduct money from employee
router.post('/employees/:id/deduct',
  [
    body('amount').isFloat({ min: 0.01 }),
    body('description').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, description } = req.body;
      const employeeId = req.params.id;
      const createdBy = req.user.id;

      // Verify employee exists and has sufficient balance
      const employeeCheck = await db.query(
        'SELECT id, current_balance FROM employees WHERE id = $1',
        [employeeId]
      );

      if (employeeCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const currentBalance = parseFloat(employeeCheck.rows[0].current_balance);
      if (currentBalance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Create transaction
      const result = await db.query(
        `INSERT INTO transactions (employee_id, amount, transaction_type, description, created_by)
         VALUES ($1, $2, 'deduct', $3, $4)
         RETURNING id, employee_id, amount, transaction_type, description, created_at`,
        [employeeId, amount, description || null, createdBy]
      );

      // Get updated balance
      const balanceResult = await db.query(
        'SELECT current_balance FROM employees WHERE id = $1',
        [employeeId]
      );

      res.status(201).json({
        transaction: result.rows[0],
        new_balance: balanceResult.rows[0].current_balance,
      });
    } catch (error) {
      console.error('Error deducting money:', error);
      res.status(500).json({ error: 'Failed to deduct money' });
    }
  }
);

// Process payment (deduct from balance)
router.post('/employees/:id/payment',
  [
    body('amount').isFloat({ min: 0.01 }),
    body('description').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, description } = req.body;
      const employeeId = req.params.id;
      const createdBy = req.user.id;

      // Verify employee exists and has sufficient balance
      const employeeCheck = await db.query(
        'SELECT id, current_balance FROM employees WHERE id = $1',
        [employeeId]
      );

      if (employeeCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const currentBalance = parseFloat(employeeCheck.rows[0].current_balance);
      if (currentBalance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Create transaction
      const result = await db.query(
        `INSERT INTO transactions (employee_id, amount, transaction_type, description, created_by)
         VALUES ($1, $2, 'payment', $3, $4)
         RETURNING id, employee_id, amount, transaction_type, description, created_at`,
        [employeeId, amount, description || null, createdBy]
      );

      // Get updated balance
      const balanceResult = await db.query(
        'SELECT current_balance FROM employees WHERE id = $1',
        [employeeId]
      );

      res.status(201).json({
        transaction: result.rows[0],
        new_balance: balanceResult.rows[0].current_balance,
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  }
);

// Get all transactions
router.get('/transactions', async (req, res) => {
  try {
    const { employee_id, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT t.id, t.amount, t.transaction_type, t.description, t.created_at,
             e.id as employee_id, e.employee_id as employee_code, e.name as employee_name,
             u.name as created_by_name
      FROM transactions t
      JOIN employees e ON t.employee_id = e.id
      LEFT JOIN users u ON t.created_by = u.id
    `;
    
    const params = [];
    if (employee_id) {
      query += ' WHERE t.employee_id = $1';
      params.push(employee_id);
    }
    
    query += ' ORDER BY t.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;
