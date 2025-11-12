/**
 * @fileoverview Report controllers for C2C Marketplace
 * @module controllers/reportControllers
 * @description Handles reporting system for inappropriate content
 */

import { query } from "../libs/pool-query.js"

/**
 * Submit a report for inappropriate content
 * @param {Object} reportData - Report data
 * @param {number} [reportData.reporterId] - ID of the reporter (null for anonymous)
 * @param {string} reportData.reportedType - Type: 'listing', 'user', or 'review'
 * @param {number} reportData.reportedId - ID of the reported item
 * @param {string} reportData.reason - Reason for report
 * @returns {Promise<Object>} Result with report ID
 */
export const submitReport = async (reportData) => {
  const { reporterId, reportedType, reportedId, reason } = reportData

  try {
    // Validate reported type
    const validTypes = ['listing', 'user', 'review']
    if (!validTypes.includes(reportedType)) {
      return { success: false, error: 'ประเภทการรายงานไม่ถูกต้อง (listing, user, review)' }
    }

    // Check if the reported item exists based on type
    let checkSql
    let checkTable
    switch (reportedType) {
      case 'listing':
        checkSql = 'SELECT listing_id FROM listings WHERE listing_id = $1'
        checkTable = 'listings'
        break
      case 'user':
        checkSql = 'SELECT user_id FROM users WHERE user_id = $1'
        checkTable = 'users'
        break
      case 'review':
        checkSql = 'SELECT review_id FROM reviews WHERE review_id = $1'
        checkTable = 'reviews'
        break
    }

    const checkResult = await query(checkSql, [reportedId])
    if (checkResult.rowCount === 0) {
      return { success: false, error: `ไม่พบ${reportedType}ที่ต้องการรายงาน` }
    }

    // Insert report
    const sql = `
      INSERT INTO reports (reporter_id, reported_type, reported_id, reason, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING report_id, created_at
    `
    const params = [reporterId || null, reportedType, reportedId, reason]
    const result = await query(sql, params)

    if (result.rowCount === 0) {
      return { success: false, error: 'ไม่สามารถส่งรายงานได้' }
    }

    console.log(`✅ Report submitted: ${reportedType} ${reportedId}`)

    return {
      success: true,
      reportId: result.rows[0].report_id,
      createdAt: result.rows[0].created_at
    }

  } catch (error) {
    console.error('Error in submitReport:', error)
    throw error
  }
}

/**
 * Get all reports (admin only)
 * @param {string} [filterType] - Filter by report type
 * @param {string} [filterStatus] - Filter by status
 * @param {number} [limit=50] - Number of reports to return
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Object>} Result with reports list
 */
export const getAllReports = async (filterType = null, filterStatus = null, limit = 50, offset = 0) => {
  try {
    // Build filter conditions
    let conditions = []
    let params = []
    let paramCount = 1

    if (filterType) {
      conditions.push(`r.reported_type = $${paramCount}`)
      params.push(filterType)
      paramCount++
    }

    if (filterStatus) {
      conditions.push(`r.status = $${paramCount}`)
      params.push(filterStatus)
      paramCount++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Add limit and offset to params
    params.push(limit, offset)

    const sql = `
      SELECT
        r.report_id,
        r.reported_type,
        r.reported_id,
        r.reason,
        r.status,
        r.resolved_at,
        r.created_at,
        reporter.user_id as reporter_id,
        reporter.username as reporter_username,
        reporter.email as reporter_email,
        resolver.user_id as resolved_by_id,
        resolver.username as resolved_by_username
      FROM reports r
      LEFT JOIN users reporter ON r.reporter_id = reporter.user_id
      LEFT JOIN users resolver ON r.resolved_by = resolver.user_id
      ${whereClause}
      ORDER BY
        CASE r.status
          WHEN 'pending' THEN 1
          WHEN 'reviewing' THEN 2
          WHEN 'resolved' THEN 3
          WHEN 'rejected' THEN 4
        END,
        r.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `
    const result = await query(sql, params)

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM reports r
      ${whereClause}
    `
    const countParams = params.slice(0, -2) // Remove limit and offset
    const countResult = await query(countSql, countParams)
    const totalCount = parseInt(countResult.rows[0].total)

    return {
      success: true,
      reports: result.rows,
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: (offset + limit) < totalCount
      }
    }

  } catch (error) {
    console.error('Error in getAllReports:', error)
    throw error
  }
}

/**
 * Get a single report with full details (admin only)
 * @param {number} reportId - ID of the report
 * @returns {Promise<Object>} Result with report details
 */
export const getReportDetails = async (reportId) => {
  try {
    // Get report basic info
    const reportSql = `
      SELECT
        r.*,
        reporter.username as reporter_username,
        reporter.email as reporter_email,
        resolver.username as resolved_by_username
      FROM reports r
      LEFT JOIN users reporter ON r.reporter_id = reporter.user_id
      LEFT JOIN users resolver ON r.resolved_by = resolver.user_id
      WHERE r.report_id = $1
    `
    const reportResult = await query(reportSql, [reportId])

    if (reportResult.rowCount === 0) {
      return { success: false, error: 'ไม่พบรายงานนี้' }
    }

    const report = reportResult.rows[0]

    // Get details of the reported item based on type
    let itemDetails = null
    switch (report.reported_type) {
      case 'listing':
        const listingResult = await query(
          `SELECT listing_id, title, description, price, status, seller_id
           FROM listings WHERE listing_id = $1`,
          [report.reported_id]
        )
        if (listingResult.rowCount > 0) {
          itemDetails = { type: 'listing', ...listingResult.rows[0] }
        }
        break

      case 'user':
        const userResult = await query(
          `SELECT user_id, username, email, user_role, status, created_at
           FROM users WHERE user_id = $1`,
          [report.reported_id]
        )
        if (userResult.rowCount > 0) {
          itemDetails = { type: 'user', ...userResult.rows[0] }
        }
        break

      case 'review':
        const reviewResult = await query(
          `SELECT r.review_id, r.rating, r.comment, r.created_at,
                  u.username as reviewer_username,
                  l.title as listing_title
           FROM reviews r
           JOIN users u ON r.reviewer_id = u.user_id
           JOIN listings l ON r.listing_id = l.listing_id
           WHERE r.review_id = $1`,
          [report.reported_id]
        )
        if (reviewResult.rowCount > 0) {
          itemDetails = { type: 'review', ...reviewResult.rows[0] }
        }
        break
    }

    return {
      success: true,
      report,
      itemDetails
    }

  } catch (error) {
    console.error('Error in getReportDetails:', error)
    throw error
  }
}

/**
 * Update report status (admin only)
 * @param {number} reportId - ID of the report
 * @param {string} newStatus - New status: 'reviewing', 'resolved', or 'rejected'
 * @param {number} adminId - ID of the admin resolving the report
 * @returns {Promise<Object>} Result of update operation
 */
export const updateReportStatus = async (reportId, newStatus, adminId) => {
  try {
    // Validate status
    const validStatuses = ['reviewing', 'resolved', 'rejected']
    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: 'สถานะไม่ถูกต้อง (reviewing, resolved, rejected)' }
    }

    // Check if report exists
    const checkResult = await query(
      'SELECT report_id FROM reports WHERE report_id = $1',
      [reportId]
    )

    if (checkResult.rowCount === 0) {
      return { success: false, error: 'ไม่พบรายงานนี้' }
    }

    // Update status
    const sql = `
      UPDATE reports
      SET
        status = $1::report_status,
        resolved_by = $2,
        resolved_at = CASE WHEN $1 IN ('resolved', 'rejected') THEN CURRENT_TIMESTAMP ELSE resolved_at END
      WHERE report_id = $3
      RETURNING report_id, status, resolved_at
    `
    const result = await query(sql, [newStatus, adminId, reportId])

    console.log(`✅ Report ${reportId} status updated to ${newStatus} by admin ${adminId}`)

    return {
      success: true,
      report: result.rows[0]
    }

  } catch (error) {
    console.error('Error in updateReportStatus:', error)
    throw error
  }
}

/**
 * Get statistics about reports (admin only)
 * @returns {Promise<Object>} Report statistics
 */
export const getReportStatistics = async () => {
  try {
    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'reviewing') as reviewing_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(*) FILTER (WHERE reported_type = 'listing') as listing_reports,
        COUNT(*) FILTER (WHERE reported_type = 'user') as user_reports,
        COUNT(*) FILTER (WHERE reported_type = 'review') as review_reports,
        COUNT(*) as total_reports
      FROM reports
    `
    const result = await query(sql)

    return {
      success: true,
      statistics: result.rows[0]
    }

  } catch (error) {
    console.error('Error in getReportStatistics:', error)
    throw error
  }
}
