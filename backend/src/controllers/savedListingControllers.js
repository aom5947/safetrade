/**
 * @fileoverview Saved Listings controllers for C2C Marketplace
 * @module controllers/savedListingControllers
 * @description Handles saved/favorite listings functionality
 */

import { query } from "../libs/pool-query.js"

/**
 * Save (bookmark/favorite) a listing
 * @param {number} userId - ID of the user
 * @param {number} listingId - ID of the listing to save
 * @returns {Promise<Object>} Result with saved listing data
 */
export const saveListing = async (userId, listingId) => {
  try {
    
    // Check if listing exists and is active
    const listingCheckSql = 'SELECT listing_id, title, status FROM listings WHERE listing_id = $1'
    const listingCheck = await query(listingCheckSql, [listingId])

    if (listingCheck.rowCount === 0) {
      return { success: false, error: 'ไม่พบประกาศนี้' }
    }

    const listing = listingCheck.rows[0]

    // Check if already saved
    const existingCheck = await query(
      'SELECT saved_id FROM saved_listings WHERE user_id = $1 AND listing_id = $2',
      [userId, listingId]
    )

    if (existingCheck.rowCount > 0) {
      return { success: false, error: 'คุณได้บันทึกประกาศนี้ไว้แล้ว' }
    }

    // Save the listing
    const sql = `
      INSERT INTO saved_listings (user_id, listing_id)
      VALUES ($1, $2)
      RETURNING saved_id, saved_at
    `
    const result = await query(sql, [userId, listingId])

    if (result.rowCount === 0) {
      return { success: false, error: 'ไม่สามารถบันทึกประกาศได้' }
    }

    console.log(`✅ User ${userId} saved listing ${listingId}`)

    return {
      success: true,
      savedId: result.rows[0].saved_id,
      savedAt: result.rows[0].saved_at,
      listingTitle: listing.title
    }

  } catch (error) {
    console.error('Error in saveListing:', error)
    throw error
  }
}

/**
 * Unsave (remove bookmark/unfavorite) a listing
 * @param {number} userId - ID of the user
 * @param {number} listingId - ID of the listing to unsave
 * @returns {Promise<Object>} Result of unsave operation
 */
export const unsaveListing = async (userId, listingId) => {
  try {
    const sql = `
      DELETE FROM saved_listings
      WHERE user_id = $1 AND listing_id = $2
      RETURNING saved_id
    `
    const result = await query(sql, [userId, listingId])

    if (result.rowCount === 0) {
      return { success: false, error: 'คุณยังไม่ได้บันทึกประกาศนี้' }
    }

    console.log(`✅ User ${userId} unsaved listing ${listingId}`)

    return {
      success: true,
      message: 'ลบประกาศที่บันทึกออกเรียบร้อยแล้ว'
    }

  } catch (error) {
    console.error('Error in unsaveListing:', error)
    throw error
  }
}

/**
 * Get all saved listings for a user
 * @param {number} userId - ID of the user
 * @param {number} [limit=50] - Number of listings to return
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Object>} Result with saved listings
 */
export const getSavedListings = async (userId, limit = 50, offset = 0) => {
  try {
    const sql = `
      SELECT
        sl.saved_id,
        sl.saved_at,
        l.listing_id,
        l.title,
        l.description,
        l.price,
        l.location,
        l.status,
        l.view_count,
        l.created_at,
        u.user_id as seller_id,
        u.username as seller_username,
        u.first_name as seller_first_name,
        u.last_name as seller_last_name,
        c.name as category_name,
        c.slug as category_slug,
        (
          SELECT image_url
          FROM listing_images
          WHERE listing_id = l.listing_id
          ORDER BY display_order
          LIMIT 1
        ) as thumbnail
      FROM saved_listings sl
      JOIN listings l ON sl.listing_id = l.listing_id
      JOIN users u ON l.seller_id = u.user_id
      LEFT JOIN categories c ON l.category_id = c.category_id
      WHERE sl.user_id = $1
      ORDER BY sl.saved_at DESC
      LIMIT $2 OFFSET $3
    `
    const result = await query(sql, [userId, limit, offset])

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM saved_listings WHERE user_id = $1',
      [userId]
    )
    const totalCount = parseInt(countResult.rows[0].total)

    return {
      success: true,
      savedListings: result.rows,
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: (offset + limit) < totalCount
      }
    }

  } catch (error) {
    console.error('Error in getSavedListings:', error)
    throw error
  }
}

/**
 * Check if a listing is saved by a user
 * @param {number} userId - ID of the user
 * @param {number} listingId - ID of the listing
 * @returns {Promise<Object>} Result indicating if listing is saved
 */
export const checkIfSaved = async (userId, listingId) => {
  try {
    const sql = `
      SELECT saved_id, saved_at
      FROM saved_listings
      WHERE user_id = $1 AND listing_id = $2
    `
    const result = await query(sql, [userId, listingId])

    return {
      success: true,
      isSaved: result.rowCount > 0,
      savedAt: result.rowCount > 0 ? result.rows[0].saved_at : null
    }

  } catch (error) {
    console.error('Error in checkIfSaved:', error)
    throw error
  }
}

/**
 * Get count of users who saved a specific listing
 * @param {number} listingId - ID of the listing
 * @returns {Promise<Object>} Result with save count
 */
export const getSaveCount = async (listingId) => {
  try {
    const result = await query(
      'SELECT COUNT(*) as save_count FROM saved_listings WHERE listing_id = $1',
      [listingId]
    )

    return {
      success: true,
      saveCount: parseInt(result.rows[0].save_count)
    }

  } catch (error) {
    console.error('Error in getSaveCount:', error)
    throw error
  }
}
