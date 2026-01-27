/**
 * User-related SQL queries
 * All queries use fully qualified table names (schema.table)
 * Following SQL Style Guide conventions
 * All identifiers use camelCase and are quoted for consistency
 */

module.exports = {
  // Check if user exists by name (not deleted)
  checkUserExists: `
    SELECT "id" 
    FROM public.users 
    WHERE "name" = $1 
      AND "deletedOn" IS NULL
  `,

  // Find user by name for login (not deleted and not locked)
  findUserForLogin: `
    SELECT 
      "id",
      "name",
      "password",
      "role"
    FROM public.users
    WHERE "name" = $1
      AND "deletedOn" IS NULL
      AND ("lockedUntil" IS NULL OR "lockedUntil" < CURRENT_TIMESTAMP)
  `,

  // Find user by ID (not deleted and not locked)
  findUserById: `
    SELECT 
      "id",
      "name",
      "role"
    FROM public.users
    WHERE "id" = $1
      AND "deletedOn" IS NULL
      AND ("lockedUntil" IS NULL OR "lockedUntil" < CURRENT_TIMESTAMP)
  `,

  // Create new user
  createUser: `
    INSERT INTO public.users ("name", "password", "role")
    VALUES ($1, $2, $3)
    RETURNING "id", "name", "role", "createdOn"
  `,

  // Get all users (not deleted)
  getAllUsers: `
    SELECT 
      "id",
      "name",
      "role",
      "createdOn",
      "deletedOn",
      "lockedUntil"
    FROM public.users
    WHERE "deletedOn" IS NULL
    ORDER BY "createdOn" DESC
  `,

  // Get user by ID
  getUserById: `
    SELECT 
      "id",
      "name",
      "role",
      "createdOn",
      "deletedOn",
      "lockedUntil"
    FROM public.users
    WHERE "id" = $1
      AND "deletedOn" IS NULL
  `,

  // Soft delete user
  softDeleteUser: `
    UPDATE public.users
    SET "deletedOn" = CURRENT_TIMESTAMP
    WHERE "id" = $1
      AND "deletedOn" IS NULL
  `,

  // Lock user account
  lockUser: `
    UPDATE public.users
    SET "lockedUntil" = $1
    WHERE "id" = $2
      AND "deletedOn" IS NULL
  `,

  // Unlock user account
  unlockUser: `
    UPDATE public.users
    SET "lockedUntil" = NULL
    WHERE "id" = $1
      AND "deletedOn" IS NULL
  `,

  // Update user password
  updatePassword: `
    UPDATE public.users
    SET "password" = $1
    WHERE "id" = $2
      AND "deletedOn" IS NULL
  `,

  // Update user role
  updateRole: `
    UPDATE public.users
    SET "role" = $1
    WHERE "id" = $2
      AND "deletedOn" IS NULL
  `,
};
