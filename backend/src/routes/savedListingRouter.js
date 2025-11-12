/**
 * @fileoverview Saved Listings routes for C2C Marketplace
 * @module routes/savedListingRouter
 * @description API routes for saved/favorite listings functionality
 */

import express from 'express'
import { saveListing, unsaveListing, getSavedListings, checkIfSaved, getSaveCount } from '../controllers/savedListingControllers.js'
import { jwtWithRoleMiddleware } from '../middlewares/roleMiddleware.js'

const savedListingRouter = express.Router()

// ============================================
// AUTHENTICATED USER ROUTES
// ============================================

/**
 * POST /api/v1/saved-listings
 * Save (bookmark/favorite) a listing
 *
 * Body:
 * {
 *   "listingId": 1
 * }
 */
savedListingRouter.post("/", jwtWithRoleMiddleware, async (req, res) => {
  try {
    const { listingId } = req.body
    const userId = req.user.id

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ listing ID"
      })
    }

    const result = await saveListing(userId, parseInt(listingId))

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(201).json({
      success: true,
      message: "บันทึกประกาศเรียบร้อยแล้ว",
      data: {
        savedId: result.savedId,
        savedAt: result.savedAt,
        listingTitle: result.listingTitle
      }
    })

  } catch (error) {
    console.error("Save listing error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึกประกาศ"
    })
  }
})

/**
 * DELETE /api/v1/saved-listings/:listingId
 * Unsave (remove bookmark/unfavorite) a listing
 */
savedListingRouter.delete("/:listingId", jwtWithRoleMiddleware, async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId)
    const userId = req.user.id

    if (isNaN(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Listing ID ไม่ถูกต้อง"
      })
    }

    const result = await unsaveListing(userId, listingId)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: result.message
    })

  } catch (error) {
    console.error("Unsave listing error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบประกาศที่บันทึก"
    })
  }
})

/**
 * GET /api/v1/saved-listings
 * Get all saved listings for the authenticated user
 *
 * Query params:
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
savedListingRouter.get("/", jwtWithRoleMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    const result = await getSavedListings(userId, limit, offset)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลประกาศที่บันทึกเรียบร้อยแล้ว",
      data: result.savedListings,
      pagination: result.pagination
    })

  } catch (error) {
    console.error("Get saved listings error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลประกาศที่บันทึก"
    })
  }
})

/**
 * GET /api/v1/saved-listings/check/:listingId
 * Check if a listing is saved by the authenticated user
 */
savedListingRouter.get("/check/:listingId", jwtWithRoleMiddleware, async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId)
    const userId = req.user.id

    if (isNaN(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Listing ID ไม่ถูกต้อง"
      })
    }

    const result = await checkIfSaved(userId, listingId)

    return res.status(200).json({
      success: true,
      data: {
        isSaved: result.isSaved,
        savedAt: result.savedAt
      }
    })

  } catch (error) {
    console.error("Check if saved error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบสถานะ"
    })
  }
})

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /api/v1/saved-listings/count/:listingId
 * Get count of users who saved a specific listing (public)
 */
savedListingRouter.get("/count/:listingId", async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId)

    if (isNaN(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Listing ID ไม่ถูกต้อง"
      })
    }

    const result = await getSaveCount(listingId)

    return res.status(200).json({
      success: true,
      data: {
        listingId: listingId,
        saveCount: result.saveCount
      }
    })

  } catch (error) {
    console.error("Get save count error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล"
    })
  }
})

export default savedListingRouter
