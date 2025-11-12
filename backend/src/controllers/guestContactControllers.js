/**
 * @fileoverview Guest Contact controllers for C2C Marketplace
 * @module controllers/guestContactControllers
 * @description Handles guest (non-logged-in user) contact form submissions
 */

import { query } from "../libs/pool-query.js"

/**
 * Submit a guest contact form for a listing
 * @param {Object} contactData - Contact form data
 * @param {number} contactData.listingId - ID of the listing
 * @param {string} contactData.contactName - Guest's name
 * @param {string} contactData.contactPhone - Guest's phone number
 * @param {string} contactData.contactEmail - Guest's email
 * @param {string} [contactData.message] - Optional message from guest
 * @returns {Promise<Object>} Result with contact ID
 */
export const submitGuestContact = async (contactData) => {
  const { listingId, contactName, contactPhone, contactEmail, message } = contactData

  try {
    // First verify the listing exists and is active
    const listingCheck = await query(
      'SELECT listing_id, title, seller_id, status FROM listings WHERE listing_id = $1',
      [listingId]
    )

    if (listingCheck.rowCount === 0) {
      return { success: false, error: 'ไม่พบประกาศนี้' }
    }

    const listing = listingCheck.rows[0]

    if (listing.status !== 'active') {
      return { success: false, error: 'ประกาศนี้ไม่สามารถติดต่อได้ในขณะนี้' }
    }

    // Insert guest contact
    const sql = `
      INSERT INTO guest_contacts (listing_id, contact_name, contact_phone, contact_email, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING contact_id, contacted_at
    `
    const params = [listingId, contactName, contactPhone, contactEmail, message || null]
    const result = await query(sql, params)

    if (result.rowCount === 0) {
      return { success: false, error: 'ไม่สามารถส่งข้อความติดต่อได้' }
    }

    // Increment contact count for the listing
    await query(
      'UPDATE listings SET contact_count = contact_count + 1 WHERE listing_id = $1',
      [listingId]
    )

    console.log(`✅ Guest contact submitted for listing ${listingId}`)

    return {
      success: true,
      contactId: result.rows[0].contact_id,
      contactedAt: result.rows[0].contacted_at,
      listingTitle: listing.title
    }

  } catch (error) {
    console.error('Error in submitGuestContact:', error)
    throw error
  }
}

/**
 * Get all guest contacts for a specific listing (seller only)
 * @param {number} listingId - ID of the listing
 * @param {number} sellerId - ID of the seller (for authorization)
 * @param {number} [limit=50] - Number of contacts to return
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Object>} Result with contacts list
 */
export const getListingContacts = async (listingId, sellerId, limit = 50, offset = 0) => {
  try {
    // Verify the listing belongs to the seller
    const ownerCheck = await query(
      'SELECT seller_id FROM listings WHERE listing_id = $1',
      [listingId]
    )

    if (ownerCheck.rowCount === 0) {
      return { success: false, error: 'ไม่พบประกาศนี้' }
    }

    if (ownerCheck.rows[0].seller_id !== sellerId) {
      return { success: false, error: 'คุณไม่มีสิทธิ์ดูข้อมูลการติดต่อของประกาศนี้' }
    }

    // Get contacts with pagination
    const sql = `
      SELECT
        contact_id,
        listing_id,
        contact_name,
        contact_phone,
        contact_email,
        message,
        contacted_at
      FROM guest_contacts
      WHERE listing_id = $1
      ORDER BY contacted_at DESC
      LIMIT $2 OFFSET $3
    `
    const result = await query(sql, [listingId, limit, offset])

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM guest_contacts WHERE listing_id = $1',
      [listingId]
    )
    const totalCount = parseInt(countResult.rows[0].total)

    return {
      success: true,
      contacts: result.rows,
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: (offset + limit) < totalCount
      }
    }

  } catch (error) {
    console.error('Error in getListingContacts:', error)
    throw error
  }
}

/**
 * Get all guest contacts for all of seller's listings
 * @param {number} sellerId - ID of the seller
 * @param {number} [limit=50] - Number of contacts to return
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Object>} Result with contacts list
 */
export const getSellerContacts = async (sellerId, limit = 50, offset = 0) => {
  try {
    // Get contacts from all seller's listings with listing info
    const sql = `
      SELECT
        gc.contact_id,
        gc.listing_id,
        gc.contact_name,
        gc.contact_phone,
        gc.contact_email,
        gc.message,
        gc.contacted_at,
        l.title as listing_title,
        l.status as listing_status
      FROM guest_contacts gc
      JOIN listings l ON gc.listing_id = l.listing_id
      WHERE l.seller_id = $1
      ORDER BY gc.contacted_at DESC
      LIMIT $2 OFFSET $3
    `
    const result = await query(sql, [sellerId, limit, offset])

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM guest_contacts gc
       JOIN listings l ON gc.listing_id = l.listing_id
       WHERE l.seller_id = $1`,
      [sellerId]
    )
    const totalCount = parseInt(countResult.rows[0].total)

    return {
      success: true,
      contacts: result.rows,
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: (offset + limit) < totalCount
      }
    }

  } catch (error) {
    console.error('Error in getSellerContacts:', error)
    throw error
  }
}
