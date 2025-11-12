/**
 * @fileoverview Category controllers for C2C Marketplace
 * @module controllers/categoryControllers
 */

import { query } from "../libs/pool-query.js"

/**
 * Get all categories with hierarchical structure
 * @param {boolean} includeInactive - Include inactive categories
 * @returns {Promise<Object>} Categories
 */
export const getAllCategories = async (includeInactive = false) => {
  try {
    let sql = `
      SELECT
        category_id,
        name,
        slug,
        icon,
        parent_id,
        display_order,
        is_active
      FROM categories
    `

    if (!includeInactive) {
      sql += ' WHERE is_active = TRUE'
    }

    sql += ' ORDER BY display_order ASC, name ASC'

    const result = await query(sql)

    // Organize into hierarchical structure
    const categories = result.rows
    const categoryMap = {}
    const rootCategories = []

    // Create map of all categories
    categories.forEach(cat => {
      categoryMap[cat.category_id] = { ...cat, subcategories: [] }
    })

    // Build hierarchy
    categories.forEach(cat => {
      if (cat.parent_id === null) {
        rootCategories.push(categoryMap[cat.category_id])
      } else {
        if (categoryMap[cat.parent_id]) {
          categoryMap[cat.parent_id].subcategories.push(categoryMap[cat.category_id])
        }
      }
    })

    return {
      success: true,
      categories: rootCategories,
      flat: categories
    }
  } catch (error) {
    console.error('Error getting categories:', error)
    throw error
  }
}

/**
 * Get category by slug with subcategories
 * @param {string} slug - Category slug
 * @returns {Promise<Object>} Category details
 */
export const getCategoryBySlug = async (slug) => {
  try {
    const sql = 'SELECT * FROM categories WHERE slug = $1'
    const result = await query(sql, [slug])

    if (result.rowCount === 0) {
      return { success: false, error: 'Category not found' }
    }

    const category = result.rows[0]

    // Get subcategories
    const subSql = 'SELECT * FROM categories WHERE parent_id = $1 AND is_active = TRUE ORDER BY display_order ASC'
    const subResult = await query(subSql, [category.category_id])

    category.subcategories = subResult.rows

    // Get listing count
    const countSql = 'SELECT COUNT(*) FROM listings WHERE category_id = $1 AND status = $2'
    const countResult = await query(countSql, [category.category_id, 'active'])
    category.listing_count = parseInt(countResult.rows[0].count)


    return { success: true, category }
  } catch (error) {
    console.error('Error getting category by slug:', error)
    throw error
  }
}

/**
 * Create new category (admin only)
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} Created category
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

    return { success: true, category: result.rows[0] }
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

/**
 * Update category (admin only)
 * @param {number} categoryId - Category ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated category
 */
export const updateCategory = async (categoryId, updateData) => {
  const { name, slug, icon, displayOrder, isActive } = updateData

  try {
    // If updating slug, check if it already exists
    if (slug) {
      const checkSql = 'SELECT category_id FROM categories WHERE slug = $1 AND category_id != $2'
      const checkResult = await query(checkSql, [slug, categoryId])

      if (checkResult.rowCount > 0) {
        return { success: false, error: 'Slug already exists' }
      }
    }

    const sql = `
      UPDATE categories
      SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        icon = COALESCE($3, icon),
        display_order = COALESCE($4, display_order),
        is_active = COALESCE($5, is_active)
      WHERE category_id = $6
      RETURNING *
    `
    const params = [name, slug, icon, displayOrder, isActive, categoryId]
    const result = await query(sql, params)

    if (result.rowCount === 0) {
      return { success: false, error: 'Category not found' }
    }

    return { success: true, category: result.rows[0] }
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

/**
 * Delete category (admin only)
 * @param {number} categoryId - Category ID
 * @returns {Promise<Object>} Result
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

    return { success: true, category: result.rows[0] }
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

export const getListingsByCategory = async (slug, options = {}) => {
  const { page = 1, limit = 20, sort = 'newest', includeSub = false } = options

  try {
    // 1️⃣ หา category หลักจาก slug
    const catSql = 'SELECT category_id FROM categories WHERE slug = $1'
    const catResult = await query(catSql, [slug])

    if (catResult.rowCount === 0) {
      return { success: false, error: 'Category not found' }
    }

    const categoryId = catResult.rows[0].category_id

    // 2️⃣ หา id ของหมวดย่อย (ถ้ามี includeSub)
    let categoryIds = [categoryId]
    if (includeSub) {
      const subSql = 'SELECT category_id FROM categories WHERE parent_id = $1'
      const subResult = await query(subSql, [categoryId])
      if (subResult.rowCount > 0) {
        const subIds = subResult.rows.map(row => row.category_id)
        categoryIds = [...categoryIds, ...subIds]
      }
    }

    // 3️⃣ สร้าง query หลัก
    let sql = `
      SELECT
        l.*,
        u.username AS seller_username,
        u.first_name AS seller_first_name,
        u.rating_average AS seller_rating,
        c.name AS category_name,
        (SELECT image_url FROM listing_images WHERE listing_id = l.listing_id ORDER BY display_order LIMIT 1) AS thumbnail
      FROM listings l
      JOIN users u ON l.seller_id = u.user_id
      LEFT JOIN categories c ON l.category_id = c.category_id
      WHERE l.status = 'active'
        AND l.category_id = ANY($1)
    `

    // 4️⃣ เพิ่มการ sort
    switch (sort) {
      case 'price_low':
        sql += ' ORDER BY l.price ASC'
        break
      case 'price_high':
        sql += ' ORDER BY l.price DESC'
        break
      case 'most_viewed':
        sql += ' ORDER BY l.view_count DESC'
        break
      default:
        sql += ' ORDER BY l.created_at DESC'
    }

    // 5️⃣ pagination
    const offset = (page - 1) * limit
    sql += ' LIMIT $2 OFFSET $3'

    const result = await query(sql, [categoryIds, limit, offset])

    // 6️⃣ นับจำนวนทั้งหมด
    const countSql = `
      SELECT COUNT(*) 
      FROM listings 
      WHERE status = 'active' 
      AND category_id = ANY($1)
    `
    const countResult = await query(countSql, [categoryIds])
    const totalCount = parseInt(countResult.rows[0].count)

    return {
      success: true,
      listings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    }
  } catch (error) {
    console.error('Error getting listings by category:', error)
    throw error
  }
}

