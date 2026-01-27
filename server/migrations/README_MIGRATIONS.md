# Database Migrations

This project uses a custom migration system that reads SQL files from the `migrations` directory.

## Setup

1. **Create the database** (if it doesn't exist):
   ```bash
   npm run db:create
   ```

2. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

## Migration Commands

- `npm run db:create` - Create the database if it doesn't exist
- `npm run db:migrate` - Run all pending migrations

## Creating a New Migration

Create SQL files in `server/migrations/` following this naming pattern:
- `XXX.do.sql` - Migration to apply (up)
- `XXX.undo.sql` - Migration to rollback (down) - optional

Where `XXX` is a 3-digit number (001, 002, 003, etc.)

Example:
- `003.do.sql` - Creates a new table
- `003.undo.sql` - Drops that table (optional, for rollback)

## Migration Files

Migrations are stored in `server/migrations/` and follow the pattern:
- `001.do.sql` / `001.undo.sql`
- `002.do.sql` / `002.undo.sql`
- etc.

Migrations run in numerical order based on the prefix number.

## Migration Tracking

Migrations are tracked in the `public.schemaversion` table, which is automatically created. This table stores:
- `version` - The migration version number
- `name` - The migration file name
- `run_at` - When the migration was executed

## Configuration

Migration configuration uses environment variables from `.env`:
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 5432)
- `DB_NAME` (default: home_payday)
- `DB_USER` (default: postgres)
- `DB_PASSWORD` (default: postgres)

## Best Practices

1. Always create both `.do.sql` and `.undo.sql` files (undo files are optional but recommended)
2. Use fully qualified table names (`public.table_name`)
3. Follow the SQL Style Guide in `server/db/SQL_STYLE_GUIDE.md`
4. Test migrations in development before production
5. Never modify existing migration files after they've been run in production
6. Use `IF NOT EXISTS` for idempotent migrations when possible
7. All identifiers should be quoted and use camelCase: `"id"`, `"createdOn"`, etc.

## Notes

- Migrations run in numerical order (001, 002, 003, etc.)
- The migration system tracks which migrations have been applied
- Rollback files (`.undo.sql`) are optional - they're not automatically used but can be run manually if needed
- All SQL should be fully qualified with schema names
- All column identifiers should be quoted: `"columnName"`
