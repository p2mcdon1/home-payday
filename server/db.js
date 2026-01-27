const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'home_payday',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Initialize database schema
async function init() {
  try {
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('Database schema initialized successfully');
    
    // Create default admin user if it doesn't exist
    const adminCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@payday.com']
    );
    
    if (adminCheck.rows.length === 0) {
      // Store password in plain text (as requested)
      await pool.query(
        'INSERT INTO users (email, password_hash, role, name) VALUES ($1, $2, $3, $4)',
        ['admin@payday.com', 'admin123', 'admin', 'Admin User']
      );
      console.log('Default admin user created (email: admin@payday.com, password: admin123)');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Query helper
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  init,
};
