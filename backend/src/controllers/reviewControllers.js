/**
 * @fileoverview Review controllers for C2C Marketplace
 * @module controllers/reviewControllers
 * @description Handles review and rating functionality for sellers
 */

import { pool, query } from "../libs/pool-query.js"

/**
 * Create a review for a seller (based on listing interaction)
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.listingId - ID of the listing
 * @param {number} reviewData.reviewerId - ID of the reviewer (buyer)
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} [reviewData.comment] - Optional comment
 * @returns {Promise<Object>} Result with review ID
 */
export const createReview = async (reviewData) => {
  const { listingId, reviewerId, rating, comment } = reviewData

  const client = await pool.connect()

  try {
    // Start transaction
    await client.query('BEGIN')

    // Get listing info and seller ID
    const listingResult = await client.query(
      'SELECT listing_id, seller_id, title FROM listings WHERE listing_id = $1',
      [listingId]
    )

    if (listingResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return { success: false, error: 'ไม่พบประกาศนี้' }
    }

    const listing = listingResult.rows[0]
    const sellerId = listing.seller_id

    // Check if reviewer is not the seller
    if (reviewerId === sellerId) {
      await client.query('ROLLBACK')
      return { success: false, error: 'คุณไม่สามารถรีวิวประกาศของตัวเองได้' }
    }

    // Check if already reviewed this listing
    const existingReview = await client.query(
      'SELECT review_id FROM reviews WHERE listing_id = $1 AND reviewer_id = $2',
      [listingId, reviewerId]
    )

    if (existingReview.rowCount > 0) {
      await client.query('ROLLBACK')
      return { success: false, error: 'คุณได้รีวิวประกาศนี้ไปแล้ว' }
    }

    // Insert review
    const reviewSql = `
      INSERT INTO reviews (listing_id, reviewer_id, reviewed_user_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING review_id, created_at
    `
    const reviewResult = await client.query(reviewSql, [
      listingId,
      reviewerId,
      sellerId,
      rating,
      comment || null
    ])

    if (reviewResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return { success: false, error: 'ไม่สามารถสร้างรีวิวได้' }
    }

    const reviewId = reviewResult.rows[0].review_id
    const createdAt = reviewResult.rows[0].created_at

    // Recalculate seller's rating
    const ratingStats = await client.query(
      `SELECT
         AVG(rating) as avg_rating,
         COUNT(*) as review_count
       FROM reviews
       WHERE reviewed_user_id = $1 AND is_spam = FALSE`,
      [sellerId]
    )

    const avgRating = parseFloat(ratingStats.rows[0].avg_rating) || 0
    const reviewCount = parseInt(ratingStats.rows[0].review_count) || 0

    // Update seller's rating
    await client.query(
      'UPDATE users SET rating_average = $1, rating_count = $2 WHERE user_id = $3',
      [avgRating.toFixed(2), reviewCount, sellerId]
    )

    // Commit transaction
    await client.query('COMMIT')

    console.log(`✅ Review created: ${reviewId} for seller ${sellerId}`)

    return {
      success: true,
      reviewId,
      createdAt,
      newSellerRating: avgRating.toFixed(2),
      newSellerRatingCount: reviewCount
    }

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error in createReview:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get all reviews for a seller
 * @param {number} sellerId - ID of the seller
 * @param {number} [limit=50] - Number of reviews to return
 * @param {number} [offset=0] - Offset for pagination
 * @param {boolean} [includeSpam=false] - Include spam reviews
 * @returns {Promise<Object>} Result with reviews list
 */
export const getSellerReviews = async (sellerId, limit = 50, offset = 0, includeSpam = false) => {
  try {
    const spamFilter = includeSpam ? '' : 'AND r.is_spam = FALSE'

    const sql = `
      SELECT
        r.review_id,
        r.rating,
        r.comment,
        r.is_spam,
        r.created_at,
        l.listing_id,
        l.title as listing_title,
        u.user_id as reviewer_id,
        u.username as reviewer_username,
        u.first_name as reviewer_first_name,
        u.last_name as reviewer_last_name,
        u.avatar_url as reviewer_avatar
      FROM reviews r
      JOIN listings l ON r.listing_id = l.listing_id
      JOIN users u ON r.reviewer_id = u.user_id
      WHERE r.reviewed_user_id = $1 ${spamFilter}
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `
    const result = await query(sql, [sellerId, limit, offset])

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM reviews
      WHERE reviewed_user_id = $1 ${spamFilter}
    `
    const countResult = await query(countSql, [sellerId])
    const totalCount = parseInt(countResult.rows[0].total)

    // Get seller's current rating
    const sellerResult = await query(
      'SELECT rating_average, rating_count FROM users WHERE user_id = $1',
      [sellerId]
    )

    return {
      success: true,
      reviews: result.rows,
      sellerRating: {
        average: parseFloat(sellerResult.rows[0]?.rating_average) || 0,
        count: parseInt(sellerResult.rows[0]?.rating_count) || 0
      },
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: (offset + limit) < totalCount
      }
    }

  } catch (error) {
    console.error('Error in getSellerReviews:', error)
    throw error
  }
}

/**
 * Get reviews for a specific listing
 * @param {number} listingId - ID of the listing
 * @param {number} [limit=50] - Number of reviews to return
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Object>} Result with reviews list
 */
export const getListingReviews = async (listingId, limit = 50, offset = 0) => {
  try {
    const sql = `
      SELECT
        r.review_id,
        r.rating,
        r.comment,
        r.created_at,
        u.user_id as reviewer_id,
        u.username as reviewer_username,
        u.first_name as reviewer_first_name,
        u.last_name as reviewer_last_name,
        u.avatar_url as reviewer_avatar
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.user_id
      WHERE r.listing_id = $1 AND r.is_spam = FALSE
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `
    const result = await query(sql, [listingId, limit, offset])

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM reviews WHERE listing_id = $1 AND is_spam = FALSE',
      [listingId]
    )
    const totalCount = parseInt(countResult.rows[0].total)

    return {
      success: true,
      reviews: result.rows,
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: (offset + limit) < totalCount
      }
    }

  } catch (error) {
    console.error('Error in getListingReviews:', error)
    throw error
  }
}

/**
 * Check if user has reviewed a listing
 * @param {number} listingId - ID of the listing
 * @param {number} userId - ID of the user
 * @returns {Promise<Object>} Result indicating if user has reviewed
 */
export const checkIfReviewed = async (listingId, userId) => {
  try {
    const result = await query(
      'SELECT review_id, rating, comment, created_at FROM reviews WHERE listing_id = $1 AND reviewer_id = $2',
      [listingId, userId]
    )

    return {
      success: true,
      hasReviewed: result.rowCount > 0,
      review: result.rowCount > 0 ? result.rows[0] : null
    }

  } catch (error) {
    console.error('Error in checkIfReviewed:', error)
    throw error
  }
}

/**
 * Mark a review as spam (admin only)
 * @param {number} reviewId - ID of the review
 * @param {boolean} isSpam - Whether to mark as spam or not
 * @returns {Promise<Object>} Result of update operation
 */
export const markReviewAsSpam = async (reviewId, isSpam = true) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Get review info
    const reviewResult = await client.query(
      'SELECT reviewed_user_id FROM reviews WHERE review_id = $1',
      [reviewId]
    )

    if (reviewResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return { success: false, error: 'ไม่พบรีวิวนี้' }
    }

    const sellerId = reviewResult.rows[0].reviewed_user_id

    // Update review spam status
    await client.query(
      'UPDATE reviews SET is_spam = $1 WHERE review_id = $2',
      [isSpam, reviewId]
    )

    // Recalculate seller's rating (excluding spam)
    const ratingStats = await client.query(
      `SELECT
         AVG(rating) as avg_rating,
         COUNT(*) as review_count
       FROM reviews
       WHERE reviewed_user_id = $1 AND is_spam = FALSE`,
      [sellerId]
    )

    const avgRating = parseFloat(ratingStats.rows[0].avg_rating) || 0
    const reviewCount = parseInt(ratingStats.rows[0].review_count) || 0

    // Update seller's rating
    await client.query(
      'UPDATE users SET rating_average = $1, rating_count = $2 WHERE user_id = $3',
      [avgRating.toFixed(2), reviewCount, sellerId]
    )

    await client.query('COMMIT')

    console.log(`✅ Review ${reviewId} marked as spam: ${isSpam}`)

    return {
      success: true,
      message: isSpam ? 'ทำเครื่องหมายรีวิวเป็นสแปมแล้ว' : 'ยกเลิกการทำเครื่องหมายสแปมแล้ว',
      newSellerRating: avgRating.toFixed(2),
      newSellerRatingCount: reviewCount
    }

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error in markReviewAsSpam:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Delete a review (reviewer or admin only)
 * @param {number} reviewId - ID of the review
 * @param {number} userId - ID of the user attempting to delete
 * @param {string} userRole - Role of the user
 * @returns {Promise<Object>} Result of delete operation
 */
export const deleteReview = async (reviewId, userId, userRole) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Get review info
    const reviewResult = await client.query(
      'SELECT reviewer_id, reviewed_user_id FROM reviews WHERE review_id = $1',
      [reviewId]
    )

    if (reviewResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return { success: false, error: 'ไม่พบรีวิวนี้' }
    }

    const review = reviewResult.rows[0]

    // Check authorization: only reviewer or admin can delete
    if (review.reviewer_id !== userId && !['admin', 'super_admin'].includes(userRole)) {
      await client.query('ROLLBACK')
      return { success: false, error: 'คุณไม่มีสิทธิ์ลบรีวิวนี้' }
    }

    const sellerId = review.reviewed_user_id

    // Delete review
    await client.query('DELETE FROM reviews WHERE review_id = $1', [reviewId])

    // Recalculate seller's rating
    const ratingStats = await client.query(
      `SELECT
         AVG(rating) as avg_rating,
         COUNT(*) as review_count
       FROM reviews
       WHERE reviewed_user_id = $1 AND is_spam = FALSE`,
      [sellerId]
    )

    const avgRating = parseFloat(ratingStats.rows[0].avg_rating) || 0
    const reviewCount = parseInt(ratingStats.rows[0].review_count) || 0

    // Update seller's rating
    await client.query(
      'UPDATE users SET rating_average = $1, rating_count = $2 WHERE user_id = $3',
      [avgRating.toFixed(2), reviewCount, sellerId]
    )

    await client.query('COMMIT')

    console.log(`✅ Review ${reviewId} deleted by user ${userId}`)

    return {
      success: true,
      message: 'ลบรีวิวเรียบร้อยแล้ว'
    }

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error in deleteReview:', error)
    throw error
  } finally {
    client.release()
  }
}
