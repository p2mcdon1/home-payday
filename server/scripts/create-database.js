/**
 * Script to create the database if it doesn't exist
 * Connects to the default 'postgres' database to create the application database
 */

const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

async function createDatabase() {
  // Connect to default postgres database to create our database
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await adminClient.connect();
    console.log('Connected to PostgreSQL server');

    const dbName = process.env.DB_NAME || 'home_payday';

    // Check if database exists
    const result = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length > 0) {
      console.log(`Database '${dbName}' already exists`);
    } else {
      // Create database
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully`);
    }

    await adminClient.end();
  } catch (error) {
    console.error('Error creating database:', error);
    await adminClient.end();
    process.exit(1);
  }
}

createDatabase();
