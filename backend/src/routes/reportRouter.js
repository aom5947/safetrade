/**
 * @fileoverview Report routes for C2C Marketplace
 * @module routes/reportRouter
 * @description API routes for reporting inappropriate content
 */

import express from 'express'
import {
  submitReport,
  getAllReports,
  getReportDetails,
  updateReportStatus,
  getReportStatistics
} from '../controllers/reportControllers.js'
import { jwtWithRoleMiddleware, requireAdmin } from '../middlewares/roleMiddleware.js'

const reportRouter = express.Router()

// ============================================
// PUBLIC/AUTHENTICATED ROUTES
// ============================================

/**
 * POST /api/v1/reports
 * Submit a report for inappropriate content
 * Can be used by authenticated users or anonymous (guest)
 *
 * Body:
 * {
 *   "reportedType": "listing",  // 'listing', 'user', or 'review'
 *   "reportedId": 123,
 *   "reason": "เนื้อหาไม่เหมาะสม"
 * }
 */
reportRouter.post("/", async (req, res) => {
  try {
    const { reportedType, reportedId, reason } = req.body

    // Validation
    if (!reportedType || !reportedId || !reason) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน: reportedType, reportedId, reason"
      })
    }

    // Validate reported type
    const validTypes = ['listing', 'user', 'review']
    if (!validTypes.includes(reportedType)) {
      return res.status(400).json({
        success: false,
        message: "reportedType ต้องเป็น 'listing', 'user', หรือ 'review'"
      })
    }

    // Check if user is authenticated (get reporter ID if available)
    // We'll use a middleware that doesn't require authentication
    // Extract token if present, but don't fail if not
    let reporterId = null
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
      try {
        const jwt = await import('jsonwebtoken')
        const payload = jwt.default.verify(token, process.env.JWT_SECRET)
        reporterId = payload.id
      } catch (error) {
        // Token invalid or expired, continue as anonymous
        reporterId = null
      }
    }

    const result = await submitReport({
      reporterId,
      reportedType,
      reportedId: parseInt(reportedId),
      reason
    })

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(201).json({
      success: true,
      message: "ส่งรายงานเรียบร้อยแล้ว ทีมงานจะตรวจสอบเร็วๆ นี้",
      data: {
        reportId: result.reportId,
        createdAt: result.createdAt
      }
    })

  } catch (error) {
    console.error("Submit report error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งรายงาน"
    })
  }
})

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * GET /api/v1/reports
 * Get all reports with optional filters (admin only)
 *
 * Query params:
 * - type: string ('listing', 'user', 'review')
 * - status: string ('pending', 'reviewing', 'resolved', 'rejected')
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
reportRouter.get("/", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {
  try {
    const filterType = req.query.type || null
    const filterStatus = req.query.status || null
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    // Validate filters if provided
    if (filterType && !['listing', 'user', 'review'].includes(filterType)) {
      return res.status(400).json({
        success: false,
        message: "type ต้องเป็น 'listing', 'user', หรือ 'review'"
      })
    }

    if (filterStatus && !['pending', 'reviewing', 'resolved', 'rejected'].includes(filterStatus)) {
      return res.status(400).json({
        success: false,
        message: "status ต้องเป็น 'pending', 'reviewing', 'resolved', หรือ 'rejected'"
      })
    }

    const result = await getAllReports(filterType, filterStatus, limit, offset)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลรายงานเรียบร้อยแล้ว",
      data: result.reports,
      pagination: result.pagination
    })

  } catch (error) {
    console.error("Get reports error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน"
    })
  }
})

/**
 * GET /api/v1/reports/statistics
 * Get report statistics (admin only)
 */
reportRouter.get("/statistics", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {
  try {
    const result = await getReportStatistics()

    return res.status(200).json({
      success: true,
      data: result.statistics
    })

  } catch (error) {
    console.error("Get report statistics error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ"
    })
  }
})

/**
 * GET /api/v1/reports/:reportId
 * Get detailed information about a specific report (admin only)
 */
reportRouter.get("/:reportId", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {
  try {
    const reportId = parseInt(req.params.reportId)

    if (isNaN(reportId)) {
      return res.status(400).json({
        success: false,
        message: "Report ID ไม่ถูกต้อง"
      })
    }

    const result = await getReportDetails(reportId)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        report: result.report,
        itemDetails: result.itemDetails
      }
    })

  } catch (error) {
    console.error("Get report details error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน"
    })
  }
})

/**
 * PATCH /api/v1/reports/:reportId/status
 * Update report status (admin only)
 *
 * Body:
 * {
 *   "status": "resolved"  // 'reviewing', 'resolved', or 'rejected'
 * }
 */
reportRouter.patch("/:reportId/status", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {
  try {
    const reportId = parseInt(req.params.reportId)
    const { status } = req.body
    const adminId = req.user.id

    console.log(reportId, status, "asdasd");
    

    if (isNaN(reportId)) {
      return res.status(400).json({
        success: false,
        message: "Report ID ไม่ถูกต้อง"
      })
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ status"
      })
    }

    const result = await updateReportStatus(reportId, status, adminId)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "อัปเดตสถานะรายงานเรียบร้อยแล้ว",
      data: result.report
    })

  } catch (error) {
    console.error("Update report status error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตสถานะรายงาน"
    })
  }
})

export default reportRouter
