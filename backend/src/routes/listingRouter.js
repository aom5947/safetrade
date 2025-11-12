/**
 * @fileoverview Listing routes for C2C Marketplace
 * @module routes/listingRouter
 */

import { Router } from "express"
import { jwtWithRoleMiddleware, requireSeller, requireAnyRole, requireAdmin } from "../middlewares/roleMiddleware.js"
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  updateListingStatus,
  getSellerListings,
  addListingImages,
  deleteListingImage
} from "../controllers/listingControllers.js"

const listingRouter = Router()

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * Get all listings with filters
 * GET /api/v1/listings
 * Query params: q, categoryId, minPrice, maxPrice, location, sort, page, limit
 */
listingRouter.get("/", async (req, res) => {
  try {
    const filters = {
      q: req.query.q,
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : null,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      location: req.query.location,
      sort: req.query.sort || 'newest',
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      status: req.query.status ? 'pending' : 'active'
    }

    const result = await getListings(filters)

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลประกาศสำเร็จ",
      ...result
    })
  } catch (error) {
    console.error("Get listings error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

/**
 * Get single listing by ID
 * GET /api/v1/listings/:id
 */
listingRouter.get("/:id", async (req, res) => {
  try {
    const listingId = parseInt(req.params.id)

    if (isNaN(listingId)) {
      return res.status(400).json({
        success: false,
        message: "รหัสประกาศไม่ถูกต้อง"
      })
    }

    const result = await getListingById(listingId)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลประกาศสำเร็จ",
      listing: result.listing
    })
  } catch (error) {
    console.error("Get listing error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

// ============================================
// SELLER ROUTES (requires seller role)
// ============================================

/**
 * Create new listing
 * POST /api/v1/listings
 * Body: { categoryId, title, description, price, location, locationLat, locationLng, expiresAt, images }
 */
listingRouter.post("/", jwtWithRoleMiddleware, requireSeller, async (req, res) => {
  try {
    const { categoryId, title, description, price, location, locationLat, locationLng, expiresAt, images } = req.body

    // Validation
    if (!title || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "ต้องระบุ title, description, และ price"
      })
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: "ราคาต้องมากกว่าหรือเท่ากับ 0"
      })
    }

    const listingData = {
      sellerId: req.user.id,
      categoryId: categoryId || null,
      title,
      description,
      price: parseFloat(price),
      location: location || null,
      locationLat: locationLat ? parseFloat(locationLat) : null,
      locationLng: locationLng ? parseFloat(locationLng) : null,
      expiresAt: expiresAt || null,
      images: images || []
    }

    const result = await createListing(listingData)



    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(201).json({
      success: true,
      message: "สร้างประกาศสำเร็จ",
      listingId: result.listingId
    })
  } catch (error) {
    console.error("Create listing error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

/**
 * Get seller's own listings
 * GET /api/v1/listings/my/listings
 */
listingRouter.get("/my/listings", jwtWithRoleMiddleware, requireSeller, async (req, res) => {
  try {
    const options = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20
    }

    const result = await getSellerListings(req.user.id, options)

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลประกาศของคุณสำเร็จ",
      ...result
    })
  } catch (error) {
    console.error("Get seller listings error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

/**
 * Update listing
 * PUT /api/v1/listings/:id
 * Body: { title, description, price, location, locationLat, locationLng, categoryId }
 */
listingRouter.put("/:id", jwtWithRoleMiddleware, requireSeller, async (req, res) => {
  try {
    const listingId = parseInt(req.params.id)
    const { title, description, price, location, locationLat, locationLng, categoryId } = req.body

    if (isNaN(listingId)) {
      return res.status(400).json({
        success: false,
        message: "รหัสประกาศไม่ถูกต้อง"
      })
    }

    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: "ราคาต้องมากกว่าหรือเท่ากับ 0"
      })
    }

    const updateData = {
      title,
      description,
      price: price ? parseFloat(price) : undefined,
      location,
      locationLat: locationLat ? parseFloat(locationLat) : undefined,
      locationLng: locationLng ? parseFloat(locationLng) : undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined
    }

    const result = await updateListing(listingId, req.user.id, updateData)

    console.log(result);


    if (!result.success) {
      return res.status(result.error === 'Unauthorized: You can only edit your own listings' ? 403 : 404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "อัพเดทประกาศสำเร็จ",
      listing: result.listing
    })
  } catch (error) {
    console.error("Update listing error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

/**
 * Update listing status
 * PATCH /api/v1/listings/:id/status
 * Body: { status }
 */
listingRouter.patch("/:id/status", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {
  try {
    const listingId = parseInt(req.params.id)

    const { status } = req.body

    if (isNaN(listingId)) {
      return res.status(400).json({
        success: false,
        message: "รหัสประกาศไม่ถูกต้อง"
      })
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "ต้องระบุสถานะ"
      })
    }

    const result = await updateListingStatus(listingId, req.user.id, status)

    if (!result.success) {
      return res.status(result.error === 'Unauthorized' ? 403 : 400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "อัพเดทสถานะสำเร็จ",
      listing: result.listing
    })
  } catch (error) {
    console.error("Update listing status error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

/**
 * Delete listing
 * DELETE /api/v1/listings/:id
 */
listingRouter.delete("/:id", jwtWithRoleMiddleware, requireAnyRole(['seller', 'admin', 'super_admin']), async (req, res) => {
  try {
    const listingId = parseInt(req.params.id)

    if (isNaN(listingId)) {
      return res.status(400).json({
        success: false,
        message: "รหัสประกาศไม่ถูกต้อง"
      })
    }

    const result = await deleteListing(listingId, req.user.id, req.user.role)

    if (!result.success) {
      return res.status(result.error === 'Unauthorized' ? 403 : 404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ลบประกาศสำเร็จ",
      listing: result.listing
    })
  } catch (error) {
    console.error("Delete listing error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

/**
 * Add images to listing
 * POST /api/v1/listings/:id/images
 * Body: { images: ["url1", "url2"] }
 */
listingRouter.post("/:id/images", jwtWithRoleMiddleware, requireSeller, async (req, res) => {
  try {
    const listingId = parseInt(req.params.id)
    const { images } = req.body

    if (isNaN(listingId)) {
      return res.status(400).json({
        success: false,
        message: "รหัสประกาศไม่ถูกต้อง"
      })
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ต้องระบุรูปภาพอย่างน้อย 1 รูป"
      })
    }

    const result = await addListingImages(listingId, req.user.id, images)

    if (!result.success) {
      return res.status(result.error === 'Unauthorized' ? 403 : 404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(201).json({
      success: true,
      message: "เพิ่มรูปภาพสำเร็จ",
      images: result.images
    })
  } catch (error) {
    console.error("Add listing images error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

/**
 * Delete listing image
 * DELETE /api/v1/listings/images/:imageId
 */
listingRouter.delete("/images/:imageId", jwtWithRoleMiddleware, requireSeller, async (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId)

    if (isNaN(imageId)) {
      return res.status(400).json({
        success: false,
        message: "รหัสรูปภาพไม่ถูกต้อง"
      })
    }

    const result = await deleteListingImage(imageId, req.user.id)

    if (!result.success) {
      return res.status(result.error === 'Unauthorized' ? 403 : 404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ลบรูปภาพสำเร็จ",
      image: result.image
    })
  } catch (error) {
    console.error("Delete listing image error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

export default listingRouter
