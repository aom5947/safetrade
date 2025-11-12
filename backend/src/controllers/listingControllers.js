/**
 * @fileoverview Listing controllers for C2C Marketplace
 * @module controllers/listingControllers
 * @description Handles all listing-related operations
 */

import { pool, query } from "../libs/pool-query.js"

/**
 * Create a new listing
 * @param {Object} listingData - Listing data
 * @returns {Promise<Object>} Result with listing ID
 */
export const createListing = async (listingData) => {
  const {
    sellerId,
    categoryId,
    title,
    description,
    price,
    location,
    locationLat,
    locationLng,
    expiresAt,
    images = []
  } = listingData

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Create listing (status: 'pending' for admin check)
    const listingSql = `
      INSERT INTO listings
      (seller_id, category_id, title, description, price, location, location_lat, location_lng, status, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
      RETURNING listing_id
    `
    const listingParams = [sellerId, categoryId, title, description, price, location, locationLat, locationLng, expiresAt]
    const listingResult = await client.query(listingSql, listingParams)

    if (listingResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return { success: false, error: 'Failed to create listing' }
    }

    const listingId = listingResult.rows[0].listing_id

    // Insert images if provided
    if (images.length > 0) {
      const imageValues = images.map((url, index) => `(${listingId}, '${url}', ${index})`).join(',')
      const imageSql = `
        INSERT INTO listing_images (listing_id, image_url, display_order)
        VALUES ${imageValues}
      `
      await client.query(imageSql)
    }

    // Update seller's listing count
    await client.query('UPDATE users SET listing_count = listing_count + 1 WHERE user_id = $1', [sellerId])

    await client.query('COMMIT')

    return { success: true, listingId }
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating listing:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get all listings with filters and pagination
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Listings and count
 */
export const getListings = async (filters) => {
  const {
    q,
    categoryId,
    minPrice,
    maxPrice,
    location,
    sort = 'newest',
    page = 1,
    limit = 20,
    status = 'active'
    // status = 'active'
  } = filters

  try {
    let sql = `
      SELECT
        l.*,
        u.username as seller_username,
        u.first_name as seller_first_name,
        u.last_name as seller_last_name,
        u.avatar_url as seller_avatar,
        u.rating_average as seller_rating,
        c.name as category_name,
        c.slug as category_slug,
        (SELECT image_url FROM listing_images WHERE listing_id = l.listing_id ORDER BY display_order LIMIT 1) as thumbnail
      FROM listings l
      JOIN users u ON l.seller_id = u.user_id
      LEFT JOIN categories c ON l.category_id = c.category_id
      WHERE l.status = $1
    `

    const params = [status]
    let paramIndex = 2

    // Search by keyword
    if (q) {
      sql += ` AND (l.title ILIKE $${paramIndex} OR l.description ILIKE $${paramIndex})`
      params.push(`%${q}%`)
      paramIndex++
    }

    // Filter by category
    if (categoryId) {
      sql += ` AND l.category_id = $${paramIndex}`
      params.push(categoryId)
      paramIndex++
    }

    // Filter by price range
    if (minPrice) {
      sql += ` AND l.price >= $${paramIndex}`
      params.push(minPrice)
      paramIndex++
    }
    if (maxPrice) {
      sql += ` AND l.price <= $${paramIndex}`
      params.push(maxPrice)
      paramIndex++
    }

    // Filter by location
    if (location) {
      sql += ` AND l.location ILIKE $${paramIndex}`
      params.push(`%${location}%`)
      paramIndex++
    }

    // Sorting
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
      case 'newest':
      default:
        sql += ' ORDER BY l.created_at DESC'
    }

    // Pagination
    const offset = (page - 1) * limit
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await query(sql, params)

    // Get total count
    let countSql = 'SELECT COUNT(*) FROM listings l WHERE l.status = $1'
    const countParams = [status]
    let countIndex = 2

    if (q) {
      countSql += ` AND (l.title ILIKE $${countIndex} OR l.description ILIKE $${countIndex})`
      countParams.push(`%${q}%`)
      countIndex++
    }
    if (categoryId) {
      countSql += ` AND l.category_id = $${countIndex}`
      countParams.push(categoryId)
      countIndex++
    }
    if (minPrice) {
      countSql += ` AND l.price >= $${countIndex}`
      countParams.push(minPrice)
      countIndex++
    }
    if (maxPrice) {
      countSql += ` AND l.price <= $${countIndex}`
      countParams.push(maxPrice)
      countIndex++
    }
    if (location) {
      countSql += ` AND l.location ILIKE $${countIndex}`
      countParams.push(`%${location}%`)
    }

    const countResult = await query(countSql, countParams)
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
    console.error('Error getting listings:', error)
    throw error
  }
}

/**
 * Get single listing by ID
 * @param {number} listingId - Listing ID
 * @param {boolean} incrementView - Whether to increment view count
 * @returns {Promise<Object>} Listing details
 */
export const getListingById = async (listingId, incrementView = true) => {
  try {
    // Increment view count if requested
    if (incrementView) {
      await query('UPDATE listings SET view_count = view_count + 1 WHERE listing_id = $1', [listingId])
    }

    // Get listing details
    const sql = `
      SELECT
        l.*,
        u.user_id as seller_id,
        u.username as seller_username,
        u.first_name as seller_first_name,
        u.last_name as seller_last_name,
        u.avatar_url as seller_avatar,
        u.rating_average as seller_rating,
        u.rating_count as seller_rating_count,
        u.phone as seller_phone,
        c.name as category_name,
        c.slug as category_slug
      FROM listings l
      JOIN users u ON l.seller_id = u.user_id
      LEFT JOIN categories c ON l.category_id = c.category_id
      WHERE l.listing_id = $1
    `

    const result = await query(sql, [listingId])

    if (result.rowCount === 0) {
      return { success: false, error: 'Listing not found' }
    }

    const listing = result.rows[0]

    // Get images
    const imagesSql = 'SELECT image_url FROM listing_images WHERE listing_id = $1 ORDER BY display_order'
    const imagesResult = await query(imagesSql, [listingId])
    listing.images = imagesResult.rows.map(row => row.image_url)

    return { success: true, listing }
  } catch (error) {
    console.error('Error getting listing:', error)
    throw error
  }
}

/**
 * Update listing
 * @param {number} listingId - Listing ID
 * @param {number} sellerId - Seller ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Result
 */
export const updateListing = async (listingId, sellerId, updateData) => {
  const { title, description, price, location, locationLat, locationLng, categoryId } = updateData

  try {
    // Check ownership
    const checkSql = 'SELECT seller_id FROM listings WHERE listing_id = $1'
    const checkResult = await query(checkSql, [listingId])

    if (checkResult.rowCount === 0) {
      return { success: false, error: 'Listing not found' }
    }

    if (checkResult.rows[0].seller_id !== sellerId) {
      return { success: false, error: 'Unauthorized: You can only edit your own listings' }
    }

    // Update listing
    const sql = `
      UPDATE listings
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        location = COALESCE($4, location),
        location_lat = COALESCE($5, location_lat),
        location_lng = COALESCE($6, location_lng),
        category_id = COALESCE($7, category_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE listing_id = $8
      RETURNING *
    `

    const params = [title, description, price, location, locationLat, locationLng, categoryId, listingId]
    const result = await query(sql, params)

    return { success: true, listing: result.rows[0] }
  } catch (error) {
    console.error('Error updating listing:', error)
    throw error
  }
}

/**
 * Delete listing
 * @param {number} listingId - Listing ID
 * @param {number} userId - User ID (for authorization)
 * @param {string} userRole - User role
 * @returns {Promise<Object>} Result
 */
export const deleteListing = async (listingId, userId, userRole) => {
  try {
    // Check ownership or admin
    const checkSql = 'SELECT seller_id FROM listings WHERE listing_id = $1'
    const checkResult = await query(checkSql, [listingId])

    if (checkResult.rowCount === 0) {
      return { success: false, error: 'Listing not found' }
    }

    const isOwner = checkResult.rows[0].seller_id === userId
    const isAdmin = ['admin', 'super_admin'].includes(userRole)

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    // Delete listing (CASCADE will delete images, conversations, etc.)
    const sql = 'DELETE FROM listings WHERE listing_id = $1 RETURNING *'
    const result = await query(sql, [listingId])

    return { success: true, listing: result.rows[0] }
  } catch (error) {
    console.error('Error deleting listing:', error)
    throw error
  }
}

/**
 * แก้ใหม่
 * Update listing status
 * @param {number} listingId - Listing ID
 * @param {number} sellerId - Seller ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Result
 */
export const updateListingStatus = async (listingId, sellerId, status) => {
  const validStatuses = ['active', 'sold', 'expired', 'hidden']

  if (!validStatuses.includes(status)) {
    return { success: false, error: 'Invalid status' }
  }

  try {
    // Check ownership
    const checkSql = 'SELECT seller_id FROM listings WHERE listing_id = $1'
    const checkResult = await query(checkSql, [listingId])

    if (checkResult.rowCount === 0) {
      return { success: false, error: 'Listing not found' }
    }

    if (checkResult.rows[0].seller_id !== sellerId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update status
    const sql = 'UPDATE listings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE listing_id = $2 RETURNING *'
    const result = await query(sql, [status, listingId])

    return { success: true, listing: result.rows[0] }
  } catch (error) {
    console.error('Error updating listing status:', error)
    throw error
  }
}

/**
 * Get seller's listings
 * @param {number} sellerId - Seller ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Listings
 */
export const getSellerListings = async (sellerId, options = {}) => {
  const { page = 1, limit = 20 } = options

  try {
    const offset = (page - 1) * limit

    const sql = `
      SELECT
        l.*,
        c.name as category_name,
        (SELECT image_url FROM listing_images WHERE listing_id = l.listing_id ORDER BY display_order LIMIT 1) as thumbnail
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.category_id
      WHERE l.seller_id = $1
      ORDER BY l.created_at DESC
      LIMIT $2 OFFSET $3
    `

    const result = await query(sql, [sellerId, limit, offset])

    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM listings WHERE seller_id = $1', [sellerId])
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
    console.error('Error getting seller listings:', error)
    throw error
  }
}

/**
 * Add images to listing
 * @param {number} listingId - Listing ID
 * @param {number} sellerId - Seller ID
 * @param {Array<string>} imageUrls - Array of image URLs
 * @returns {Promise<Object>} Result
 */
export const addListingImages = async (listingId, sellerId, imageUrls) => {
  try {
    // Check ownership
    const checkSql = 'SELECT seller_id FROM listings WHERE listing_id = $1'
    const checkResult = await query(checkSql, [listingId])

    if (checkResult.rowCount === 0) {
      return { success: false, error: 'Listing not found' }
    }

    if (checkResult.rows[0].seller_id !== sellerId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get current max display order
    const maxOrderResult = await query(
      'SELECT COALESCE(MAX(display_order), -1) as max_order FROM listing_images WHERE listing_id = $1',
      [listingId]
    )
    let displayOrder = maxOrderResult.rows[0].max_order + 1

    // Insert images
    const values = imageUrls.map(url => `(${listingId}, '${url}', ${displayOrder++})`).join(',')
    const sql = `INSERT INTO listing_images (listing_id, image_url, display_order) VALUES ${values} RETURNING *`
    const result = await query(sql)

    return { success: true, images: result.rows }
  } catch (error) {
    console.error('Error adding listing images:', error)
    throw error
  }
}

/**
 * Delete listing image
 * @param {number} imageId - Image ID
 * @param {number} sellerId - Seller ID
 * @returns {Promise<Object>} Result
 */
export const deleteListingImage = async (imageId, sellerId) => {
  try {
    // Check ownership through listing
    const checkSql = `
      SELECT l.seller_id
      FROM listing_images li
      JOIN listings l ON li.listing_id = l.listing_id
      WHERE li.image_id = $1
    `
    const checkResult = await query(checkSql, [imageId])

    if (checkResult.rowCount === 0) {
      return { success: false, error: 'Image not found' }
    }

    if (checkResult.rows[0].seller_id !== sellerId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Delete image
    const sql = 'DELETE FROM listing_images WHERE image_id = $1 RETURNING *'
    const result = await query(sql, [imageId])

    return { success: true, image: result.rows[0] }
  } catch (error) {
    console.error('Error deleting listing image:', error)
    throw error
  }
}
