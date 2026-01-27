/**
 * Run database migrations
 * Reads SQL files from migrations directory and executes them in order
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'home_payday',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Create migrations tracking table if it doesn't exist
async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.schemaversion (
      version INTEGER PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      md5 VARCHAR(32),
      run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Get list of migration files
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.do.sql'))
    .sort(); // Sort to ensure correct order
  
  return files.map(file => {
    const version = parseInt(file.match(/^(\d+)/)[1]);
    return {
      version,
      name: file,
      path: path.join(migrationsDir, file),
    };
  });
}

// Check if migration has been run
async function hasMigrationRun(version) {
  const result = await pool.query(
    'SELECT version FROM public.schemaversion WHERE version = $1',
    [version]
  );
  return result.rows.length > 0;
}

// Record migration as run
async function recordMigration(version, name) {
  await pool.query(
    'INSERT INTO public.schemaversion (version, name) VALUES ($1, $2)',
    [version, name]
  );
}

// Run a single migration file
async function runMigration(migration) {
  const sql = fs.readFileSync(migration.path, 'utf8');
  
  // Run migration in a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await recordMigration(migration.version, migration.name);
    await client.query('COMMIT');
    console.log(`  ✓ ${migration.name}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get migration files
    const migrations = getMigrationFiles();
    
    if (migrations.length === 0) {
      console.log('No migration files found');
      await pool.end();
      process.exit(0);
    }
    
    // Check which migrations need to run
    const pendingMigrations = [];
    for (const migration of migrations) {
      const hasRun = await hasMigrationRun(migration.version);
      if (!hasRun) {
        pendingMigrations.push(migration);
      }
    }
    
    if (pendingMigrations.length === 0) {
      console.log('No migrations to run. Database is up to date.');
      await pool.end();
      process.exit(0);
    }
    
    console.log(`Found ${pendingMigrations.length} pending migration(s):`);
    
    // Run pending migrations
    for (const migration of pendingMigrations) {
      await runMigration(migration);
    }
    
    console.log(`\nSuccessfully applied ${pendingMigrations.length} migration(s)`);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigrations();
