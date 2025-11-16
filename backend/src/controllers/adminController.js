/**
 * @fileoverview Admin controllers for C2C Marketplace
 * @module controllers/adminController
 * @description Handles all admin-related operations including user management and category management
 */

import { query } from "../libs/pool-query.js"

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Creates a new user account (admin operation)
 *
 * @async
 * @param {Object} params - User registration data
 * @param {string} params.email - User email (unique)
 * @param {string} params.password - Hashed password (bcrypt)
 * @param {string} params.username - Username (unique)
 * @param {string} params.first_name - User's first name
 * @param {string} params.last_name - User's last name
 * @param {string} params.user_role - User role ('buyer', 'seller', 'admin', 'super_admin')
 * @returns {Promise<Object>} Result object with success status and user ID
 * @returns {boolean} returns.success - Whether signup succeeded
 * @returns {number} [returns.id] - Created user ID
 * @returns {string} [returns.message] - Error message if failed
 *
 * @throws {Error} If database operation fails
 *
 * @description
 * Creates a new user account in the users table. Used for creating admin accounts.
 */
export const createUserAccount = async ({ email, password, username, first_name, last_name, user_role }) => {
  try {
    // Create user account
    const userSql = 'INSERT INTO users (email, password, username, first_name, last_name, user_role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id';
    const userParam = [email, password, username, first_name, last_name, user_role];
    const userResult = await query(userSql, userParam);

    if (userResult.rowCount === 0) {
      return { success: false, message: 'Failed to create user account' };
    }

    const userId = userResult.rows[0].user_id;

    console.log(`✅ Admin created user successfully: ID=${userId}, Role=${user_role}`);

    return {
      success: true,
      id: userId
    };

  } catch (error) {
    console.error("Error occurred during admin user creation:", error);
    throw error;
  }
}

/**
 * Delete user account (admin operation)
 *
 * @async
 * @param {Object} params - Delete parameters
 * @param {number} params.user_id - User ID to delete
 * @returns {Promise<Object>} Result object
 * @returns {boolean} returns.success - Whether deletion succeeded
 * @returns {Object} [returns.result] - Deleted user data
 * @returns {string} [returns.message] - Error message if failed
 *
 * @throws {Error} If database operation fails
 *
 * @description
 * Permanently deletes a user account from the database. Super admin only operation.
 */
export const deleteUserAccount = async ({ user_id }) => {
  const sql = 'DELETE FROM users WHERE user_id = $1 RETURNING *'
  const param = [user_id]

  try {
    const result = await query(sql, param)

    if (result.rowCount > 0) {
      console.log(`✅ Admin deleted user: ID=${user_id}`);
      return { success: true, result: result.rows[0] };
    }
    console.log("Delete user failed - no rows affected")
    return { success: false, message: 'Delete failed' };

  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// ============================================
// CATEGORY MANAGEMENT
// ============================================

/**
 * Create new category (admin only)
 *
 * @async
 * @param {Object} categoryData - Category data
 * @param {string} categoryData.name - Category name
 * @param {string} categoryData.slug - Category slug (unique URL-friendly identifier)
 * @param {string} [categoryData.icon] - Category icon (emoji or icon identifier)
 * @param {number} [categoryData.parentId] - Parent category ID for subcategories
 * @param {number} [categoryData.displayOrder] - Display order (default: 0)
 * @returns {Promise<Object>} Result object
 * @returns {boolean} returns.success - Whether creation succeeded
 * @returns {Object} [returns.category] - Created category data
 * @returns {string} [returns.error] - Error message if failed
 *
 * @throws {Error} If database operation fails
 *
 * @description
 * Creates a new category. Checks for slug uniqueness before creation.
 */
export const createCategory = async (categoryData) => {
  const { name, slug, icon, parentId, displayOrder } = categoryData

  try {
    // Check if slug already exists
    const checkSql = 'SELECT category_id FROM categories WHERE slug = $1'
    const checkResult = await query(checkSql, [slug])

    if (checkResult.rowCount > 0) {
      return { success: false, error: 'Slug already exists' }
    }

    const sql = `
      INSERT INTO categories (name, slug, icon, parent_id, display_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `
    const params = [name, slug, icon || null, parentId || null, displayOrder || 0]
    const result = await query(sql, params)

    console.log(`✅ Admin created category: ${name} (${slug})`);
    return { success: true, category: result.rows[0] }
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

/**
 * Update category (admin only)
 *
 * @async
 * @param {number} categoryId - Category ID
 * @param {Object} updateData - Data to update
 * @param {string} [updateData.name] - Category name
 * @param {string} [updateData.slug] - Category slug
 * @param {string} [updateData.icon] - Category icon
 * @param {number} [updateData.parentId] - Parent category ID (null for top-level category)
 * @param {number} [updateData.displayOrder] - Display order
 * @param {boolean} [updateData.isActive] - Active status
 * @returns {Promise<Object>} Result object
 * @returns {boolean} returns.success - Whether update succeeded
 * @returns {Object} [returns.category] - Updated category data
 * @returns {string} [returns.error] - Error message if failed
 *
 * @throws {Error} If database operation fails
 *
 * @description
 * Updates an existing category. Checks for slug uniqueness if slug is being updated.
 * Prevents setting self as parent or creating circular dependencies.
 */
export const updateCategory = async (categoryId, updateData) => {
  const { name, slug, icon, parentId, displayOrder, isActive } = updateData

  try {
    // If updating slug, check if it already exists
    if (slug) {
      const checkSql = 'SELECT category_id FROM categories WHERE slug = $1 AND category_id != $2'
      const checkResult = await query(checkSql, [slug, categoryId])

      if (checkResult.rowCount > 0) {
        return { success: false, error: 'Slug already exists' }
      }
    }

    // If updating parentId, validate it
    if (parentId !== undefined && parentId !== null) {
      // Check if parent exists
      const parentCheckSql = 'SELECT category_id FROM categories WHERE category_id = $1'
      const parentCheckResult = await query(parentCheckSql, [parentId])

      if (parentCheckResult.rowCount === 0) {
        return { success: false, error: 'Parent category not found' }
      }

      // Prevent setting self as parent
      if (parentId === categoryId) {
        return { success: false, error: 'Cannot set category as its own parent' }
      }

      // Check if the new parent is a child of this category (prevent circular dependency)
      const circularCheckSql = 'SELECT category_id FROM categories WHERE parent_id = $1'
      const circularCheckResult = await query(circularCheckSql, [categoryId])

      for (const child of circularCheckResult.rows) {
        if (child.category_id === parentId) {
          return { success: false, error: 'Cannot set a child category as parent (circular dependency)' }
        }
      }
    }

    const sql = `
      UPDATE categories
      SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        icon = COALESCE($3, icon),
        parent_id = $4,
        display_order = COALESCE($5, display_order),
        is_active = COALESCE($6, is_active)
      WHERE category_id = $7
      RETURNING *
    `
    const params = [
      name,
      slug,
      icon,
      parentId !== undefined ? parentId : undefined,
      displayOrder,
      isActive,
      categoryId
    ]
    const result = await query(sql, params)

    if (result.rowCount === 0) {
      return { success: false, error: 'Category not found' }
    }

    console.log(`✅ Admin updated category: ID=${categoryId}`);
    return { success: true, category: result.rows[0] }
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

/**
 * Delete category (admin only)
 *
 * @async
 * @param {number} categoryId - Category ID
 * @returns {Promise<Object>} Result object
 * @returns {boolean} returns.success - Whether deletion succeeded
 * @returns {Object} [returns.category] - Deleted category data
 * @returns {string} [returns.error] - Error message if failed
 *
 * @throws {Error} If database operation fails
 *
 * @description
 * Deletes a category. Prevents deletion if category has subcategories or active listings.
 */
export const deleteCategory = async (categoryId) => {
  try {
    // Check if category has subcategories
    const checkSql = 'SELECT COUNT(*) FROM categories WHERE parent_id = $1'
    const checkResult = await query(checkSql, [categoryId])

    if (parseInt(checkResult.rows[0].count) > 0) {
      return { success: false, error: 'Cannot delete category with subcategories' }
    }

    // Check if category has listings
    const listingSql = 'SELECT COUNT(*) FROM listings WHERE category_id = $1'
    const listingResult = await query(listingSql, [categoryId])

    if (parseInt(listingResult.rows[0].count) > 0) {
      return { success: false, error: 'Cannot delete category with listings. Set category_id to NULL for those listings first.' }
    }

    const sql = 'DELETE FROM categories WHERE category_id = $1 RETURNING *'
    const result = await query(sql, [categoryId])

    if (result.rowCount === 0) {
      return { success: false, error: 'Category not found' }
    }

    console.log(`✅ Admin deleted category: ID=${categoryId}`);
    return { success: true, category: result.rows[0] }
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

// export const getALlUsers = async () => {
//   const sql = `
//     SELECT user_id, username, email, first_name, last_name, user_role, status 
//     FROM users 
//     WHERE user_role NOT IN ('super_admin', 'admin');
//   `;

//   try {
//     const result = await query(sql)
//     if (result.rowCount === 0) {
//       return { success: false, error: 'Not found users' }
//     }

//     console.log(result);

//     return { success: true, data: result.rows }
//   } catch (error) {
//     console.error('Error getAllUser:', error)
//     throw error
//   }

// }

export const getAllUsers = async (searchTerm, userRole) => {
  let sql = `
    SELECT user_id, username, email, first_name, last_name, user_role, status 
    FROM users 
    WHERE 1=1
  `;

  const params = [];

  // ถ้าไม่ใช่ super_admin ให้กรอง admin และ super_admin ออก
  if (userRole !== 'super_admin') {
    sql += ` AND user_role NOT IN ('super_admin', 'admin')`;
  }

  // ถ้ามีการค้นหา
  if (searchTerm && searchTerm.trim() !== '') {
    sql += ` 
      AND (
        first_name ILIKE $1 OR
        last_name ILIKE $1 OR
        email ILIKE $1 OR
        username ILIKE $1 OR
        CAST(user_id AS TEXT) ILIKE $1
      )
    `;
    params.push(`%${searchTerm}%`);
  }

  sql += ` ORDER BY user_id DESC`;

  try {
    const result = await query(sql, params);

    if (result.rowCount === 0) {
      return { success: true, data: [] };
    }

    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Error getAllUsers:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId, newStatus) => {
  const sql = 'UPDATE users SET status = $2 WHERE user_id = $1 RETURNING user_id, status'
  const params = [userId, newStatus]

  try {
    const result = await query(sql, params)

    if (result.rowCount === 0) {
      return { success: false, error: 'User not found or no changes made' };
    }

    console.log(result);

    return {
      success: true,
      message: 'User status updated successfully',
      data: result.rows[0]
    };
  } catch (error) {
    console.error('Error to Update Status:', error)
    throw error
  }
}

/**
 * Update user profile by admin
 *
 * @async
 * @param {number} userId - User ID to update
 * @param {Object} updateData - Data to update
 * @param {string} [updateData.username] - Username
 * @param {string} [updateData.email] - Email
 * @param {string} [updateData.firstName] - First name
 * @param {string} [updateData.lastName] - Last name
 * @param {string} [updateData.phone] - Phone number
 * @param {string} [updateData.avatarUrl] - Avatar URL
 * @param {string} [updateData.status] - Account status (active, suspended, banned)
 * @param {string} [updateData.userRole] - User role (buyer, seller, admin)
 * @returns {Promise<Object>} Result object
 * @returns {boolean} returns.success - Whether update succeeded
 * @returns {Object} [returns.user] - Updated user data
 * @returns {string} [returns.error] - Error message if failed
 *
 * @throws {Error} If database operation fails
 *
 * @description
 * Updates user profile information. Admin can update any user's profile including role and status.
 * Validates email and username uniqueness if they are being updated.
 */
export const updateUserByAdmin = async (userId, updateData, adminRole) => {
  const { username, email, firstName, lastName, phone, avatarUrl, status, userRole } = updateData

  try {
    // Check if user exists
    const checkSql = 'SELECT user_id FROM users WHERE user_id = $1'
    const checkResult = await query(checkSql, [userId])

    if (checkResult.rowCount === 0) {
      return { success: false, error: 'User not found' }
    }

    // If updating email, check if it already exists
    if (email) {
      const emailCheckSql = 'SELECT user_id FROM users WHERE email = $1 AND user_id != $2'
      const emailCheckResult = await query(emailCheckSql, [email, userId])

      if (emailCheckResult.rowCount > 0) {
        return { success: false, error: 'Email already exists' }
      }
    }

    // If updating username, check if it already exists
    if (username) {
      const usernameCheckSql = 'SELECT user_id FROM users WHERE username = $1 AND user_id != $2'
      const usernameCheckResult = await query(usernameCheckSql, [username, userId])

      if (usernameCheckResult.rowCount > 0) {
        return { success: false, error: 'Username already exists' }
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['active', 'suspended', 'banned']
      if (!validStatuses.includes(status)) {
        return { success: false, error: 'Invalid status' }
      }
    }

    // Validate role if provided
    if (userRole) {
      let validRoles;

      if (adminRole === 'super_admin') {
        validRoles = ['buyer', 'seller', 'admin'];
      } else {
        validRoles = ['buyer', 'seller'];
      }

      if (!validRoles.includes(userRole)) {
        if (adminRole !== 'super_admin' && userRole === 'admin') {
          return { success: false, error: 'Only super admin can set user role to admin' };
        }
        return { success: false, error: 'Invalid user role' };
      }
    }

    // Build dynamic update query
    const updateFields = []
    const params = []
    let paramIndex = 1

    if (username !== undefined) {
      updateFields.push(`username = $${paramIndex}`)
      params.push(username)
      paramIndex++
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex}`)
      params.push(email)
      paramIndex++
    }
    if (firstName !== undefined) {
      updateFields.push(`first_name = $${paramIndex}`)
      params.push(firstName)
      paramIndex++
    }
    if (lastName !== undefined) {
      updateFields.push(`last_name = $${paramIndex}`)
      params.push(lastName)
      paramIndex++
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex}`)
      params.push(phone)
      paramIndex++
    }
    if (avatarUrl !== undefined) {
      updateFields.push(`avatar_url = $${paramIndex}`)
      params.push(avatarUrl)
      paramIndex++
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }
    if (userRole !== undefined) {
      updateFields.push(`user_role = $${paramIndex}`)
      params.push(userRole)
      paramIndex++
    }

    // Always update the timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP')

    if (updateFields.length === 1) {
      return { success: false, error: 'No fields to update' }
    }

    // Update user
    const sql = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING user_id, username, email, first_name, last_name, phone, avatar_url, user_role, status, created_at, updated_at
    `
    params.push(userId)

    const result = await query(sql, params)

    console.log(`✅ Admin updated user: ID=${userId}`);
    return { success: true, user: result.rows[0] }
  } catch (error) {
    console.error('Error updating user by admin:', error)
    throw error
  }
}