/**
 * @fileoverview Conversation controllers for C2C Marketplace
 * @module controllers/conversationControllers
 * @description Handles messaging between buyers and sellers
 */

import { pool, query } from "../libs/pool-query.js"

/**
 * Create or get existing conversation
 * @param {number} listingId - ID of the listing
 * @param {number} buyerId - ID of the buyer
 * @returns {Promise<Object>} Result with conversation data
 */
export const createOrGetConversation = async (listingId, buyerId) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Get listing and seller info
    const listingResult = await client.query(
      'SELECT listing_id, seller_id, title, status FROM listings WHERE listing_id = $1',
      [listingId]
    )

    if (listingResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return { success: false, error: 'ไม่พบประกาศนี้' }
    }

    const listing = listingResult.rows[0]
    const sellerId = listing.seller_id

    // Check if buyer is trying to message themselves
    if (buyerId === sellerId) {
      await client.query('ROLLBACK')
      return { success: false, error: 'คุณไม่สามารถส่งข้อความหาตัวเองได้' }
    }

    // Check if conversation already exists
    const existingConv = await client.query(
      'SELECT * FROM conversations WHERE listing_id = $1 AND buyer_id = $2 AND seller_id = $3',
      [listingId, buyerId, sellerId]
    )

    if (existingConv.rowCount > 0) {
      await client.query('COMMIT')
      return {
        success: true,
        conversation: existingConv.rows[0],
        isNew: false
      }
    }

    // Create new conversation
    const createResult = await client.query(
      `INSERT INTO conversations (listing_id, buyer_id, seller_id, last_message_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [listingId, buyerId, sellerId]
    )

    await client.query('COMMIT')

    console.log(`✅ New conversation created: ${createResult.rows[0].conversation_id}`)

    return {
      success: true,
      conversation: createResult.rows[0],
      isNew: true
    }

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error in createOrGetConversation:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Send a message in a conversation
 * @param {number} conversationId - ID of the conversation
 * @param {number} senderId - ID of the sender
 * @param {string} messageText - Message content
 * @returns {Promise<Object>} Result with message data
 */
export const sendMessage = async (conversationId, senderId, messageText) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Verify conversation exists and sender is part of it
    const convResult = await client.query(
      'SELECT * FROM conversations WHERE conversation_id = $1',
      [conversationId]
    )

    if (convResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return { success: false, error: 'ไม่พบการสนทนานี้' }
    }

    const conversation = convResult.rows[0]

    // Check if sender is buyer or seller in this conversation
    if (senderId !== conversation.buyer_id && senderId !== conversation.seller_id) {
      await client.query('ROLLBACK')
      return { success: false, error: 'คุณไม่มีสิทธิ์ส่งข้อความในการสนทนานี้' }
    }

    // Insert message
    const messageResult = await client.query(
      `INSERT INTO messages (conversation_id, sender_id, message_text, is_read)
       VALUES ($1, $2, $3, FALSE)
       RETURNING *`,
      [conversationId, senderId, messageText]
    )

    // Update conversation's last_message_at
    await client.query(
      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE conversation_id = $1',
      [conversationId]
    )

    await client.query('COMMIT')

    console.log(`✅ Message sent in conversation ${conversationId}`)

    return {
      success: true,
      message: messageResult.rows[0]
    }

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error in sendMessage:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get all conversations for a user
 * @param {number} userId - ID of the user
 * @param {number} [limit=50] - Number of conversations to return
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Object>} Result with conversations list
 */
export const getUserConversations = async (userId, limit = 50, offset = 0) => {
  try {
    const sql = `
      SELECT
        c.conversation_id,
        c.listing_id,
        c.buyer_id,
        c.seller_id,
        c.last_message_at,
        c.created_at,
        l.title as listing_title,
        l.price as listing_price,
        l.status as listing_status,
        (SELECT image_url FROM listing_images WHERE listing_id = l.listing_id ORDER BY display_order LIMIT 1) as listing_thumbnail,
        buyer.username as buyer_username,
        buyer.first_name as buyer_first_name,
        buyer.avatar_url as buyer_avatar,
        seller.username as seller_username,
        seller.first_name as seller_first_name,
        seller.avatar_url as seller_avatar,
        (SELECT message_text FROM messages WHERE conversation_id = c.conversation_id ORDER BY sent_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.conversation_id AND sender_id != $1 AND is_read = FALSE) as unread_count
      FROM conversations c
      JOIN listings l ON c.listing_id = l.listing_id
      JOIN users buyer ON c.buyer_id = buyer.user_id
      JOIN users seller ON c.seller_id = seller.user_id
      WHERE c.buyer_id = $1 OR c.seller_id = $1
      ORDER BY c.last_message_at DESC NULLS LAST
      LIMIT $2 OFFSET $3
    `
    const result = await query(sql, [userId, limit, offset])

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM conversations WHERE buyer_id = $1 OR seller_id = $1',
      [userId]
    )
    const totalCount = parseInt(countResult.rows[0].total)

    return {
      success: true,
      conversations: result.rows,
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: (offset + limit) < totalCount
      }
    }

  } catch (error) {
    console.error('Error in getUserConversations:', error)
    throw error
  }
}

/**
 * Get messages in a conversation
 * @param {number} conversationId - ID of the conversation
 * @param {number} userId - ID of the requesting user
 * @param {number} [limit=100] - Number of messages to return
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Object>} Result with messages list
 */
export const getConversationMessages = async (conversationId, userId, limit = 100, offset = 0) => {
  try {
    // Verify user is part of the conversation
    const convResult = await query(
      'SELECT * FROM conversations WHERE conversation_id = $1',
      [conversationId]
    )

    if (convResult.rowCount === 0) {
      return { success: false, error: 'ไม่พบการสนทนานี้' }
    }

    const conversation = convResult.rows[0]

    if (userId !== conversation.buyer_id && userId !== conversation.seller_id) {
      return { success: false, error: 'คุณไม่มีสิทธิ์เข้าถึงการสนทนานี้' }
    }

    // Get messages
    const sql = `
      SELECT
        m.message_id,
        m.sender_id,
        m.message_text,
        m.is_read,
        m.sent_at,
        u.username as sender_username,
        u.first_name as sender_first_name,
        u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      WHERE m.conversation_id = $1
      ORDER BY m.sent_at DESC
      LIMIT $2 OFFSET $3
    `
    const result = await query(sql, [conversationId, limit, offset])

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM messages WHERE conversation_id = $1',
      [conversationId]
    )
    const totalCount = parseInt(countResult.rows[0].total)

    return {
      success: true,
      messages: result.rows.reverse(), // Return in ascending order (oldest first)
      conversation: conversation,
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: (offset + limit) < totalCount
      }
    }

  } catch (error) {
    console.error('Error in getConversationMessages:', error)
    throw error
  }
}

/**
 * Mark messages as read
 * @param {number} conversationId - ID of the conversation
 * @param {number} userId - ID of the user marking as read
 * @returns {Promise<Object>} Result of mark operation
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    // Verify user is part of the conversation
    const convResult = await query(
      'SELECT * FROM conversations WHERE conversation_id = $1',
      [conversationId]
    )

    if (convResult.rowCount === 0) {
      return { success: false, error: 'ไม่พบการสนทนานี้' }
    }

    const conversation = convResult.rows[0]

    if (userId !== conversation.buyer_id && userId !== conversation.seller_id) {
      return { success: false, error: 'คุณไม่มีสิทธิ์ดำเนินการนี้' }
    }

    // Mark all messages from the other person as read
    const result = await query(
      `UPDATE messages
       SET is_read = TRUE
       WHERE conversation_id = $1
         AND sender_id != $2
         AND is_read = FALSE
       RETURNING message_id`,
      [conversationId, userId]
    )

    console.log(`✅ Marked ${result.rowCount} messages as read in conversation ${conversationId}`)

    return {
      success: true,
      markedCount: result.rowCount
    }

  } catch (error) {
    console.error('Error in markMessagesAsRead:', error)
    throw error
  }
}

/**
 * Get unread message count for a user
 * @param {number} userId - ID of the user
 * @returns {Promise<Object>} Result with unread count
 */
export const getUnreadCount = async (userId) => {
  try {
    const sql = `
      SELECT COUNT(*) as unread_count
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.conversation_id
      WHERE (c.buyer_id = $1 OR c.seller_id = $1)
        AND m.sender_id != $1
        AND m.is_read = FALSE
    `
    const result = await query(sql, [userId])

    return {
      success: true,
      unreadCount: parseInt(result.rows[0].unread_count)
    }

  } catch (error) {
    console.error('Error in getUnreadCount:', error)
    throw error
  }
}

/**
 * Delete a conversation (both users must agree, or admin)
 * @param {number} conversationId - ID of the conversation
 * @param {number} userId - ID of the user attempting to delete
 * @param {string} userRole - Role of the user
 * @returns {Promise<Object>} Result of delete operation
 */
export const deleteConversation = async (conversationId, userId, userRole) => {
  try {
    // Get conversation details
    const convResult = await query(
      'SELECT * FROM conversations WHERE conversation_id = $1',
      [conversationId]
    )

    if (convResult.rowCount === 0) {
      return { success: false, error: 'ไม่พบการสนทนานี้' }
    }

    const conversation = convResult.rows[0]

    // Check authorization: user must be part of conversation or admin
    const isParticipant = userId === conversation.buyer_id || userId === conversation.seller_id
    const isAdmin = ['admin', 'super_admin'].includes(userRole)

    if (!isParticipant && !isAdmin) {
      return { success: false, error: 'คุณไม่มีสิทธิ์ลบการสนทนานี้' }
    }

    // Delete conversation (CASCADE will delete messages)
    await query('DELETE FROM conversations WHERE conversation_id = $1', [conversationId])

    console.log(`✅ Conversation ${conversationId} deleted by user ${userId}`)

    return {
      success: true,
      message: 'ลบการสนทนาเรียบร้อยแล้ว'
    }

  } catch (error) {
    console.error('Error in deleteConversation:', error)
    throw error
  }
}
