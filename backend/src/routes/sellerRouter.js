/**
 * @fileoverview Seller routes for C2C Marketplace
 * @module routes/sellerRouter
 * @description API routes for seller profile and related data
 */

import express from 'express'
import { getSellerInfo, getSellerListings, getSellerStats } from '../controllers/sellerControllers.js'
import { getSellerReviews } from '../controllers/reviewControllers.js'

const sellerRouter = express.Router()

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /api/v1/sellers/:userId
 * Get seller information
 *
 * Returns:
 * - user_id: Seller's user ID
 * - username: Seller's username
 * - first_name: Seller's first name
 * - last_name: Seller's last name
 * - avatar_url: Seller's avatar URL
 * - rating_average: Average rating
 * - rating_count: Number of ratings
 * - trust_score: Trust score
 * - created_at: Account creation date
 * - listing_count: Number of active listings
 */
sellerRouter.get("/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "User ID ไม่ถูกต้อง"
      })
    }

    const result = await getSellerInfo(userId)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลผู้ขายสำเร็จ",
      data: result.seller
    })

  } catch (error) {
    console.error("Get seller info error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ขาย"
    })
  }
})

/**
 * GET /api/v1/sellers/:userId/listings
 * Get seller's product listings with search, filter, and pagination
 *
 * Query params:
 * - q: string (search in title and description)
 * - categoryId: number (filter by category)
 * - minPrice: number (minimum price filter)
 * - maxPrice: number (maximum price filter)
 * - status: string (active, sold, expired - default: active)
 * - sort: string (newest, oldest, price_asc, price_desc - default: newest)
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 */
sellerRouter.get("/:userId/listings", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "User ID ไม่ถูกต้อง"
      })
    }

    // Parse query parameters
    const options = {
      q: req.query.q,
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : null,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      status: req.query.status || 'active',
      sort: req.query.sort || 'newest',
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: Math.min(req.query.limit ? parseInt(req.query.limit) : 20, 100)
    }

    // Validate status
    const validStatuses = ['active', 'sold', 'expired', 'pending']
    if (options.status && !validStatuses.includes(options.status)) {
      return res.status(400).json({
        success: false,
        message: "Status ไม่ถูกต้อง (ต้องเป็น active, sold, expired, หรือ pending)"
      })
    }

    // Validate sort
    const validSorts = ['newest', 'oldest', 'price_asc', 'price_desc']
    if (options.sort && !validSorts.includes(options.sort)) {
      return res.status(400).json({
        success: false,
        message: "Sort ไม่ถูกต้อง (ต้องเป็น newest, oldest, price_asc, หรือ price_desc)"
      })
    }

    console.log(userId);
    

    const result = await getSellerListings(userId, options)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลประกาศของผู้ขายสำเร็จ",
      data: result.listings,
      pagination: result.pagination
    })

  } catch (error) {
    console.error("Get seller listings error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลประกาศ"
    })
  }
})

/**
 * GET /api/v1/sellers/:userId/reviews
 * Get seller's reviews
 *
 * Query params:
 * - limit: number (default: 50, max: 100)
 * - offset: number (default: 0)
 */
sellerRouter.get("/:userId/reviews", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "User ID ไม่ถูกต้อง"
      })
    }

    const limit = Math.min(parseInt(req.query.limit) || 50, 100)
    const offset = parseInt(req.query.offset) || 0

    const result = await getSellerReviews(userId, limit, offset, false)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลรีวิวของผู้ขายสำเร็จ",
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
 * GET /api/v1/sellers/:userId/stats
 * Get detailed seller statistics
 *
 * Returns:
 * - total_sales: Number of sold items
 * - total_revenue: Total revenue from sold items
 * - average_rating: Average seller rating
 * - total_reviews: Number of reviews
 * - active_listings: Number of active listings
 * - total_listings: Total number of all listings
 * - days_active: Number of days since account creation
 * - response_rate: Percentage of conversations responded to
 * - trust_score: Seller trust score
 */
sellerRouter.get("/:userId/stats", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "User ID ไม่ถูกต้อง"
      })
    }

    const result = await getSellerStats(userId)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลสถิติผู้ขายสำเร็จ",
      stats: result.stats
    })

  } catch (error) {
    console.error("Get seller stats error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติผู้ขาย"
    })
  }
})

export default sellerRouter
