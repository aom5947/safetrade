/**
 * @fileoverview Seller controllers for C2C Marketplace
 * @module controllers/sellerControllers
 * @description Handles seller profile and related data retrieval
 */

import { query } from "../libs/pool-query.js"

/**
 * Get seller information by user ID
 * @param {number} userId - ID of the seller
 * @returns {Promise<Object>} Result with seller information
 */
export const getSellerInfo = async (userId) => {
  try {
    const sql = `
      SELECT
        u.user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url,
        u.rating_average,
        u.rating_count,
        u.trust_score,
        u.created_at,
        COUNT(DISTINCT l.listing_id) as listing_count
      FROM users u
      LEFT JOIN listings l ON u.user_id = l.seller_id AND l.status = 'active'
      WHERE u.user_id = $1 AND u.user_role = 'seller'
      GROUP BY u.user_id
    `
    const result = await query(sql, [userId])

    if (result.rowCount === 0) {
      return { success: false, error: 'ไม่พบผู้ขายรายนี้' }
    }

    return {
      success: true,
      seller: result.rows[0]
    }

  } catch (error) {
    console.error('Error in getSellerInfo:', error)
    throw error
  }
}

/**
 * Get detailed seller statistics
 * @param {number} sellerId - ID of the seller
 * @returns {Promise<Object>} Result with detailed statistics
 */
export const getSellerStats = async (sellerId) => {
  try {
    // Get basic seller info with listing counts
    const sellerSql = `
      SELECT
        u.user_id,
        u.username,
        u.rating_average,
        u.rating_count,
        u.trust_score,
        u.created_at,
        COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.listing_id END) as active_listings,
        COUNT(DISTINCT CASE WHEN l.status = 'sold' THEN l.listing_id END) as sold_count,
        COUNT(DISTINCT l.listing_id) as total_listings
      FROM users u
      LEFT JOIN listings l ON u.user_id = l.seller_id
      WHERE u.user_id = $1 AND u.user_role = 'seller'
      GROUP BY u.user_id
    `
    const sellerResult = await query(sellerSql, [sellerId])

    if (sellerResult.rowCount === 0) {
      return { success: false, error: 'ไม่พบผู้ขายรายนี้' }
    }

    const seller = sellerResult.rows[0]

    // Calculate total revenue from sold listings
    const revenueSql = `
      SELECT COALESCE(SUM(price), 0) as total_revenue
      FROM listings
      WHERE seller_id = $1 AND status = 'sold'
    `
    const revenueResult = await query(revenueSql, [sellerId])
    const totalRevenue = parseFloat(revenueResult.rows[0].total_revenue) || 0

    // Calculate days active
    const createdAt = new Date(seller.created_at)
    const now = new Date()
    const daysActive = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))

    // Get response rate and time (if messaging system is active)
    // For now, we'll use placeholder values or calculate based on conversations
    const responseMetricsSql = `
      SELECT
        COUNT(DISTINCT c.conversation_id) as total_conversations,
        COUNT(DISTINCT CASE WHEN m.sender_id = $1 THEN c.conversation_id END) as responded_conversations
      FROM conversations c
      LEFT JOIN messages m ON c.conversation_id = m.conversation_id
      WHERE c.seller_id = $1
    `
    const responseResult = await query(responseMetricsSql, [sellerId])
    const responseMetrics = responseResult.rows[0]

    const totalConversations = parseInt(responseMetrics.total_conversations) || 0
    const respondedConversations = parseInt(responseMetrics.responded_conversations) || 0
    const responseRate = totalConversations > 0
      ? Math.round((respondedConversations / totalConversations) * 100)
      : 0

    // Build stats object
    const stats = {
      total_sales: parseInt(seller.sold_count) || 0,
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      average_rating: parseFloat(seller.rating_average) || 0,
      total_reviews: parseInt(seller.rating_count) || 0,
      active_listings: parseInt(seller.active_listings) || 0,
      total_listings: parseInt(seller.total_listings) || 0,
      days_active: daysActive,
      response_rate: responseRate,
      trust_score: parseFloat(seller.trust_score) || 0
    }

    return {
      success: true,
      stats
    }

  } catch (error) {
    console.error('Error in getSellerStats:', error)
    throw error
  }
}

/**
 * Get seller's product listings with search, filter, and pagination
 * @param {number} sellerId - ID of the seller
 * @param {Object} options - Query options
 * @param {string} [options.q] - Search query
 * @param {number} [options.categoryId] - Filter by category ID
 * @param {number} [options.minPrice] - Minimum price filter
 * @param {number} [options.maxPrice] - Maximum price filter
 * @param {string} [options.status] - Filter by listing status (active, sold, expired)
 * @param {string} [options.sort] - Sort order (newest, price_asc, price_desc)
 * @param {number} [options.page] - Page number (default: 1)
 * @param {number} [options.limit] - Items per page (default: 20)
 * @returns {Promise<Object>} Result with listings and pagination
 */
export const getSellerListings = async (sellerId, options = {}) => {
  try {
    const {
      q = null,
      categoryId = null,
      minPrice = null,
      maxPrice = null,
      status = 'active',
      sort = 'newest',
      page = 1,
      limit = 20
    } = options

    const offset = (page - 1) * limit
    const params = [sellerId]
    let paramIndex = 2

    // Build WHERE conditions
    let whereConditions = ['l.seller_id = $1']

    // Search query
    if (q) {
      params.push(`%${q}%`)
      whereConditions.push(`(l.title ILIKE $${paramIndex} OR l.description ILIKE $${paramIndex})`)
      paramIndex++
    }

    // Category filter
    if (categoryId) {
      params.push(categoryId)
      whereConditions.push(`l.category_id = $${paramIndex}`)
      paramIndex++
    }

    // Price filters
    if (minPrice !== null) {
      params.push(minPrice)
      whereConditions.push(`l.price >= $${paramIndex}`)
      paramIndex++
    }

    if (maxPrice !== null) {
      params.push(maxPrice)
      whereConditions.push(`l.price <= $${paramIndex}`)
      paramIndex++
    }

    // Status filter
    if (status) {
      params.push(status)
      whereConditions.push(`l.status = $${paramIndex}`)
      paramIndex++
    }

    const whereClause = whereConditions.join(' AND ')

    // Sort order
    let orderBy = 'l.created_at DESC'
    switch (sort) {
      case 'price_asc':
        orderBy = 'l.price ASC, l.created_at DESC'
        break
      case 'price_desc':
        orderBy = 'l.price DESC, l.created_at DESC'
        break
      case 'oldest':
        orderBy = 'l.created_at ASC'
        break
      default:
        orderBy = 'l.created_at DESC'
    }

    // Get listings
    const sql = `
      SELECT
        l.listing_id,
        l.seller_id,
        l.category_id,
        l.title,
        l.description,
        l.price,
        l.location,
        l.location_lat,
        l.location_lng,
        l.status,
        l.view_count,
        l.created_at,
        l.updated_at,
        l.expires_at,
        c.name as category_name,
        c.icon as category_icon,
        COALESCE(
          json_agg(
            json_build_object(
              'image_id', li.image_id,
              'image_url', li.image_url,
              'display_order', li.display_order
            ) ORDER BY li.display_order
          ) FILTER (WHERE li.image_id IS NOT NULL),
          '[]'
        ) as images
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.category_id
      LEFT JOIN listing_images li ON l.listing_id = li.listing_id
      WHERE ${whereClause}
      GROUP BY l.listing_id, c.name, c.icon
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    params.push(limit, offset)

    const result = await query(sql, params)

    // Get total count
    const countSql = `
      SELECT COUNT(DISTINCT l.listing_id) as total
      FROM listings l
      WHERE ${whereClause}
    `
    const countParams = params.slice(0, paramIndex - 1)
    const countResult = await query(countSql, countParams)
    const totalCount = parseInt(countResult.rows[0].total)

    return {
      success: true,
      listings: result.rows,
      pagination: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page < Math.ceil(totalCount / limit)
      }
    }

  } catch (error) {
    console.error('Error in getSellerListings:', error)
    throw error
  }
}
