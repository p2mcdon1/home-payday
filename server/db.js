const { Pool } = require('pg');
const dotenv = require('dotenv');
const userQueries = require('./db/queries/users');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'home_payday',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Initialize database connection
// Note: Schema creation should be done via migrations (npm run db:migrate)
async function init() {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Database connection established');
    console.log('Note: Run "npm run db:migrate" to set up schema');
  } catch (error) {
    console.error('Database connection error:', error);
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
