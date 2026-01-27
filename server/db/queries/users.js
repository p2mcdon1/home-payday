/**
 * User-related SQL queries
 * All queries use fully qualified table names (schema.table)
 * Following SQL Style Guide conventions
 */

module.exports = {
  // Check if user exists by name (not deleted)
  checkUserExists: `
    SELECT id 
    FROM public.users 
    WHERE name = $1 
      AND deleted_on IS NULL
  `,

  // Find user by name for login (not deleted and not locked)
  findUserForLogin: `
    SELECT 
      id,
      name,
      password,
      role
    FROM public.users
    WHERE name = $1
      AND deleted_on IS NULL
      AND (locked_until IS NULL OR locked_until < CURRENT_TIMESTAMP)
  `,

  // Find user by ID (not deleted and not locked)
  findUserById: `
    SELECT 
      id,
      name,
      role
    FROM public.users
    WHERE id = $1
      AND deleted_on IS NULL
      AND (locked_until IS NULL OR locked_until < CURRENT_TIMESTAMP)
  `,

  // Create new user
  createUser: `
    INSERT INTO public.users (name, password, role)
    VALUES ($1, $2, $3)
    RETURNING id, name, role, created_on
  `,

  // Get all users (not deleted)
  getAllUsers: `
    SELECT 
      id,
      name,
      role,
      created_on,
      deleted_on,
      locked_until
    FROM public.users
    WHERE deleted_on IS NULL
    ORDER BY created_on DESC
  `,

  // Get user by ID
  getUserById: `
    SELECT 
      id,
      name,
      role,
      created_on,
      deleted_on,
      locked_until
    FROM public.users
    WHERE id = $1
      AND deleted_on IS NULL
  `,

  // Soft delete user
  softDeleteUser: `
    UPDATE public.users
    SET deleted_on = CURRENT_TIMESTAMP
    WHERE id = $1
      AND deleted_on IS NULL
  `,

  // Lock user account
  lockUser: `
    UPDATE public.users
    SET locked_until = $1
    WHERE id = $2
      AND deleted_on IS NULL
  `,

  // Unlock user account
  unlockUser: `
    UPDATE public.users
    SET locked_until = NULL
    WHERE id = $1
      AND deleted_on IS NULL
  `,

  // Update user password
  updatePassword: `
    UPDATE public.users
    SET password = $1
    WHERE id = $2
      AND deleted_on IS NULL
  `,

  // Update user role
  updateRole: `
    UPDATE public.users
    SET role = $1
    WHERE id = $2
      AND deleted_on IS NULL
  `,
};
