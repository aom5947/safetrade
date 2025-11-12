/**
 * @fileoverview Category routes for C2C Marketplace
 * @module routes/categoryRouter
 */

import { Router } from "express"
import {
  getAllCategories,
  getCategoryBySlug,
  getListingsByCategory
} from "../controllers/categoryControllers.js"

const categoryRouter = Router()

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * Get all categories
 * GET /api/v1/categories
 */
categoryRouter.get("/", async (req, res) => {
  try {
    const result = await getAllCategories(false)

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลหมวดหมู่สำเร็จ",
      categories: result.categories,
      flat: result.flat
    })
  } catch (error) {
    console.error("Get categories error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

/**
 * Get category by slug
 * GET /api/v1/categories/:slug
 */
categoryRouter.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params

    const result = await getCategoryBySlug(slug)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลหมวดหมู่สำเร็จ",
      category: result.category
    })
  } catch (error) {
    console.error("Get category error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

/**
 * Get listings by category slug
 * GET /api/v1/categories/:slug/listings
 */
categoryRouter.get("/:slug/listings", async (req, res) => {
  try {
    const { slug } = req.params
    const includeSub = req.query.include_sub === "true" // 👈 เพิ่มตรงนี้

    const options = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      sort: req.query.sort || 'newest',
      includeSub
    }

    const result = await getListingsByCategory(slug, options)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลประกาศสำเร็จ",
      ...result
    })
  } catch (error) {
    console.error("Get listings by category error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

export default categoryRouter
