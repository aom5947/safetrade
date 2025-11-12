/**
 * @fileoverview Guest Contact routes for C2C Marketplace
 * @module routes/guestContactRouter
 * @description API routes for guest contact form submissions
 */

import express from 'express'
import { submitGuestContact, getListingContacts, getSellerContacts } from '../controllers/guestContactControllers.js'
import { jwtWithRoleMiddleware, requireSeller } from '../middlewares/roleMiddleware.js'

const guestContactRouter = express.Router()

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * POST /api/v1/guest-contacts
 * Submit a guest contact form for a listing
 *
 * Body:
 * {
 *   "listingId": 1,
 *   "contactName": "John Doe",
 *   "contactPhone": "081-234-5678",
 *   "contactEmail": "john@example.com",
 *   "message": "สนใจสินค้า ราคาต่อได้ไหมคะ"
 * }
 */
guestContactRouter.post("/", async (req, res) => {
  try {
    const { listingId, contactName, contactPhone, contactEmail, message } = req.body

    // Validation
    if (!listingId || !contactName || !contactPhone || !contactEmail) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน: listingId, contactName, contactPhone, contactEmail"
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({
        success: false,
        message: "รูปแบบอีเมลไม่ถูกต้อง"
      })
    }

    // Validate phone format (basic Thai phone validation)
    const phoneRegex = /^[0-9\-\s]{9,}$/
    if (!phoneRegex.test(contactPhone)) {
      return res.status(400).json({
        success: false,
        message: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง"
      })
    }

    const result = await submitGuestContact({
      listingId: parseInt(listingId),
      contactName,
      contactPhone,
      contactEmail,
      message
    })

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(201).json({
      success: true,
      message: "ส่งข้อความติดต่อเรียบร้อยแล้ว ผู้ขายจะติดต่อกลับเร็วๆ นี้",
      data: {
        contactId: result.contactId,
        contactedAt: result.contactedAt,
        listingTitle: result.listingTitle
      }
    })

  } catch (error) {
    console.error("Submit guest contact error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งข้อความติดต่อ"
    })
  }
})

// ============================================
// SELLER ROUTES (require authentication)
// ============================================

/**
 * GET /api/v1/guest-contacts/listing/:listingId
 * Get all guest contacts for a specific listing (seller only)
 *
 * Query params:
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
guestContactRouter.get("/listing/:listingId", jwtWithRoleMiddleware, requireSeller, async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId)
    const sellerId = req.user.id
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    if (isNaN(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Listing ID ไม่ถูกต้อง"
      })
    }

    const result = await getListingContacts(listingId, sellerId, limit, offset)

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลการติดต่อเรียบร้อยแล้ว",
      data: result.contacts,
      pagination: result.pagination
    })

  } catch (error) {
    console.error("Get listing contacts error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลการติดต่อ"
    })
  }
})

/**
 * GET /api/v1/guest-contacts/my-contacts
 * Get all guest contacts for all of seller's listings
 *
 * Query params:
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
guestContactRouter.get("/my-contacts", jwtWithRoleMiddleware, requireSeller, async (req, res) => {
  try {
    const sellerId = req.user.id
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    const result = await getSellerContacts(sellerId, limit, offset)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลการติดต่อทั้งหมดเรียบร้อยแล้ว",
      data: result.contacts,
      pagination: result.pagination
    })

  } catch (error) {
    console.error("Get seller contacts error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลการติดต่อ"
    })
  }
})

export default guestContactRouter
