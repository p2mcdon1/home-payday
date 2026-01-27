const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const userQueries = require('./db/queries/users');

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
    // Read and execute users schema file
    const usersSchemaPath = path.join(__dirname, 'db', 'users.sql');
    const usersSchema = fs.readFileSync(usersSchemaPath, 'utf8');
    
    await pool.query(usersSchema);
    console.log('Users table schema initialized successfully');
    
    // Create default admin user if it doesn't exist
    const adminCheck = await pool.query(
      userQueries.checkUserExists,
      ['admin']
    );
    
    if (adminCheck.rows.length === 0) {
      // Store password in plain text (as requested)
      await pool.query(
        userQueries.createUser,
        ['admin', 'admin123', 'admin']
      );
      console.log('Default admin user created (name: admin, password: admin123)');
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
