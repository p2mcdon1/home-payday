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
      "role",
      ENCODE("avatar", 'base64') as "avatar"
    FROM public.users
    WHERE "id" = $1
      AND "deletedOn" IS NULL
      AND ("lockedUntil" IS NULL OR "lockedUntil" < CURRENT_TIMESTAMP)
  `,

  // Create new user
  createUser: `
    INSERT INTO public.users ("name", "password", "role", "avatar")
    VALUES ($1, $2, $3, CASE WHEN ($4::text) IS NULL THEN NULL ELSE DECODE($4::text, 'base64') END)
    RETURNING "id", "name", "role", "createdOn", ENCODE("avatar", 'base64') as "avatar"
  `,

  // Get all users (not deleted)
  getAllUsers: `
    SELECT 
      "id",
      "name",
      "role",
      "createdOn",
      "deletedOn",
      "lockedUntil",
      ENCODE("avatar", 'base64') as "avatar"
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
      "lockedUntil",
      ENCODE("avatar", 'base64') as "avatar"
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

  // Update user name
  updateName: `
    UPDATE public.users
    SET "name" = $1
    WHERE "id" = $2
      AND "deletedOn" IS NULL
    RETURNING "id", "name", "role", "createdOn", ENCODE("avatar", 'base64') as "avatar"
  `,

  // Update user avatar
  updateAvatar: `
    UPDATE public.users
    SET "avatar" = CASE WHEN ($1::text) IS NULL THEN NULL ELSE DECODE($1::text, 'base64') END
    WHERE "id" = $2
      AND "deletedOn" IS NULL
    RETURNING "id", "name", "role", ENCODE("avatar", 'base64') as "avatar"
  `,
};
