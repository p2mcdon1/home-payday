# SQL Style Guide

This document outlines the SQL style conventions used in this project.

## General Principles

1. **Fully Qualified Names**: Always use schema-qualified table names (e.g., `public.users` instead of `users`)
2. **Consistent Formatting**: Use consistent indentation and line breaks
3. **Readability**: Prioritize clarity over brevity
4. **Parameterized Queries**: Always use parameterized queries ($1, $2, etc.) to prevent SQL injection

## Formatting Rules

### Keywords
- Use uppercase for SQL keywords: `SELECT`, `FROM`, `WHERE`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`, etc.
- Use lowercase for identifiers (table names, column names) unless quoted

### Indentation
- Use 2 or 4 spaces for indentation (be consistent)
- Indent sub-clauses (WHERE, JOIN, etc.)
- Align SELECT columns vertically when possible

### Line Breaks
- Put major clauses on separate lines
- Break long lines for readability
- Use line breaks before AND/OR in WHERE clauses

### Naming Conventions
- Table names: lowercase, plural (e.g., `users`, `transactions`)
- Column names: lowercase, snake_case (e.g., `created_on`, `user_id`)
- Index names: `idx_<table>_<column>` (e.g., `idx_users_name`)
- Use fully qualified names: `schema.table` (e.g., `public.users`)

### Comments
- Use `--` for single-line comments
- Place comments above the code they describe
- Document complex queries

## Example

```sql
-- Get active users created in the last 30 days
SELECT 
    id,
    name,
    role,
    created_on
FROM public.users
WHERE deleted_on IS NULL
    AND created_on > CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY created_on DESC;
```

## Best Practices

1. Always use `public.` schema prefix for tables
2. Use parameterized queries ($1, $2, etc.) instead of string concatenation
3. Include `deleted_on IS NULL` checks for soft-deleted records
4. Use `CURRENT_TIMESTAMP` for timestamp defaults
5. Add appropriate indexes for frequently queried columns
6. Use transactions for multi-step operations
7. Check for NULL values explicitly when needed
