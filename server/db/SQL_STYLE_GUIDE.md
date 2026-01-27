# SQL Style Guide

This document outlines the SQL style conventions used in this project.

## General Principles

1. **Fully Qualified Names**: Always use schema-qualified table names (e.g., `public.users` instead of `users`)
2. **CamelCase Identifiers**: Use camelCase for column names and other identifiers (e.g., `createdOn`, `deletedOn`)
3. **Quoted Identifiers**: Quote all identifiers with double quotes for consistency and to preserve camelCase
4. **Consistent Formatting**: Use consistent indentation and line breaks
5. **Readability**: Prioritize clarity over brevity
6. **Parameterized Queries**: Always use parameterized queries ($1, $2, etc.) to prevent SQL injection

## Formatting Rules

### Keywords
- Use uppercase for SQL keywords: `SELECT`, `FROM`, `WHERE`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`, etc.

### Identifiers and Naming
- **Table names**: lowercase, plural, fully qualified (e.g., `public.users`, `public.transactions`)
- **Column names**: camelCase, always quoted (e.g., `"id"`, `"name"`, `"createdOn"`, `"deletedOn"`)
- **Index names**: `idx_<table>_<column>` (e.g., `idx_users_name`)
- Use fully qualified names: `schema.table` (e.g., `public.users`)

### Quoting Identifiers
- **All identifiers must be quoted** with double quotes: `"columnName"`
- This ensures consistency and preserves camelCase naming
- Table names in schema qualification don't need quotes if lowercase: `public.users`
- But column names always use quotes: `"id"`, `"name"`, `"createdOn"`

### Indentation
- Use 2 or 4 spaces for indentation (be consistent)
- Indent sub-clauses (WHERE, JOIN, etc.)
- Align SELECT columns vertically when possible

### Line Breaks
- Put major clauses on separate lines
- Break long lines for readability
- Use line breaks before AND/OR in WHERE clauses

### Comments
- Use `--` for single-line comments
- Place comments above the code they describe
- Document complex queries

## Example

```sql
-- Get active users created in the last 30 days
SELECT 
    "id",
    "name",
    "role",
    "createdOn"
FROM public.users
WHERE "deletedOn" IS NULL
    AND "createdOn" > CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY "createdOn" DESC;
```

## Best Practices

1. Always use `public.` schema prefix for tables
2. Quote all column identifiers with double quotes: `"columnName"`
3. Use parameterized queries ($1, $2, etc.) instead of string concatenation
4. Include `"deletedOn" IS NULL` checks for soft-deleted records
5. Use `CURRENT_TIMESTAMP` for timestamp defaults
6. Add appropriate indexes for frequently queried columns
7. Use transactions for multi-step operations
8. Check for NULL values explicitly when needed

## PostgreSQL-Specific Notes

- **All identifiers should be quoted** for consistency: `"id"`, `"name"`, `"createdOn"`
- Quoted identifiers preserve exact case: `"createdOn"` stays as camelCase
- Unquoted identifiers are folded to lowercase in PostgreSQL
- Use double quotes (`"`) for identifiers, single quotes (`'`) for string literals
- Table names in schema qualification: `public.users` (lowercase, no quotes needed for schema.table)
