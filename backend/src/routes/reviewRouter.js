/**
 * @fileoverview Review routes for C2C Marketplace
 * @module routes/reviewRouter
 * @description API routes for review and rating functionality
 */

import express from 'express'
import {
  createReview,
  getSellerReviews,
  getListingReviews,
  checkIfReviewed,
  markReviewAsSpam,
  deleteReview,
  getAllReviews
} from '../controllers/reviewControllers.js'
import { jwtWithRoleMiddleware, requireAdmin, optionalAuth } from '../middlewares/roleMiddleware.js'

const reviewRouter = express.Router()

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /api/v1/reviews/seller/:sellerId
 * Get all reviews for a specific seller
 *
 * Query params:
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
reviewRouter.get("/seller/:sellerId", async (req, res) => {
  try {
    const sellerId = parseInt(req.params.sellerId)
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    console.log('taseasdadsads');
    

    if (isNaN(sellerId)) {
      return res.status(400).json({
        success: false,
        message: "Seller ID ไม่ถูกต้อง"
      })
    }

    const result = await getSellerReviews(sellerId, limit, offset, false)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลรีวิวเรียบร้อยแล้ว",
      data: result.reviews,
      sellerRating: result.sellerRating,
      pagination: result.pagination
    })

  } catch (error) {
    console.error("Get seller reviews error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว"
    })
  }
})

/**
 * GET /api/v1/reviews/listing/:listingId
 * Get all reviews for a specific listing
 *
 * Query params:
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
reviewRouter.get("/listing/:listingId", async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId)
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    if (isNaN(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Listing ID ไม่ถูกต้อง"
      })
    }

    const result = await getListingReviews(listingId, limit, offset)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลรีวิวเรียบร้อยแล้ว",
      data: result.reviews,
      pagination: result.pagination
    })

  } catch (error) {
    console.error("Get listing reviews error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว"
    })
  }
})

// ============================================
// AUTHENTICATED USER ROUTES
// ============================================

/**
 * POST /api/v1/reviews
 * Create a review for a seller (based on listing)
 *
 * Body:
 * {
 *   "listingId": 1,
 *   "rating": 5,
 *   "comment": "ผู้ขายดีมาก สินค้าตรงตามรูป"
 * }
 */
reviewRouter.post("/", jwtWithRoleMiddleware, async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body
    const reviewerId = req.user.id

    // Validation
    if (!listingId || !rating) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ listingId และ rating"
      })
    }

    // Validate rating range
    const ratingNum = parseInt(rating)
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating ต้องเป็นตัวเลข 1-5"
      })
    }

    const result = await createReview({
      listingId: parseInt(listingId),
      reviewerId,
      rating: ratingNum,
      comment
    })

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(201).json({
      success: true,
      message: "สร้างรีวิวเรียบร้อยแล้ว",
      data: {
        reviewId: result.reviewId,
        createdAt: result.createdAt,
        newSellerRating: result.newSellerRating,
        newSellerRatingCount: result.newSellerRatingCount
      }
    })

  } catch (error) {
    console.error("Create review error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างรีวิว"
    })
  }
})

/**
 * GET /api/v1/reviews/check/:listingId
 * Check if authenticated user has reviewed a listing
 */
reviewRouter.get("/check/:listingId", optionalAuth, async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId)

    if (isNaN(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Listing ID ไม่ถูกต้อง"
      })
    }

    // ถ้าไม่มี user ให้ return ว่ายังไม่ได้รีวิว
    if (!req.user) {
      return res.status(200).json({
        success: true,
        data: {
          hasReviewed: false,
          review: null
        }
      })
    }

    const userId = req.user.id
    const result = await checkIfReviewed(listingId, userId)

    return res.status(200).json({
      success: true,
      data: {
        hasReviewed: result.hasReviewed,
        review: result.review
      }
    })
  } catch (error) {
    console.error("Check if reviewed error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบสถานะ"
    })
  }
})

/**
 * DELETE /api/v1/reviews/:reviewId
 * Delete a review (reviewer or admin only)
 */
reviewRouter.delete("/:reviewId", jwtWithRoleMiddleware, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId)
    const userId = req.user.id
    const userRole = req.user.role

    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Review ID ไม่ถูกต้อง"
      })
    }

    const result = await deleteReview(reviewId, userId, userRole)

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: result.message
    })

  } catch (error) {
    console.error("Delete review error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบรีวิว"
    })
  }
})

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * GET /api/v1/reviews/admin/all
 * Get all reviews with advanced filtering (admin only)
 *
 * Query params:
 * - limit: number (default 50)
 * - offset: number (default 0)
 * - includeSpam: boolean (default true)
 * - search: string (search in reviewer username, seller username, listing title, or comment)
 */
reviewRouter.get("/admin/all", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0
    const includeSpam = req.query.includeSpam !== 'false' // Default true for admin
    const searchTerm = req.query.search || null

    const result = await getAllReviews(limit, offset, includeSpam, searchTerm)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลรีวิวทั้งหมดสำเร็จ",
      data: result.reviews,
      statistics: result.statistics,
      pagination: result.pagination
    })

  } catch (error) {
    console.error("Get all reviews error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว"
    })
  }
})

/**
 * PATCH /api/v1/reviews/:reviewId/spam
 * Mark or unmark a review as spam (admin only)
 *
 * Body:
 * {
 *   "isSpam": true
 * }
 */
reviewRouter.patch("/:reviewId/spam", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId)
    const { isSpam } = req.body

    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Review ID ไม่ถูกต้อง"
      })
    }

    if (typeof isSpam !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "isSpam ต้องเป็น true หรือ false"
      })
    }

    const result = await markReviewAsSpam(reviewId, isSpam)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        newSellerRating: result.newSellerRating,
        newSellerRatingCount: result.newSellerRatingCount
      }
    })

  } catch (error) {
    console.error("Mark review as spam error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตรีวิว"
    })
  }
})

export default reviewRouter
