/**
 * @fileoverview Conversation routes for C2C Marketplace
 * @module routes/conversationRouter
 * @description API routes for messaging between buyers and sellers
 */

import express from 'express'
import {
  createOrGetConversation,
  sendMessage,
  getUserConversations,
  getConversationMessages,
  markMessagesAsRead,
  getUnreadCount,
  deleteConversation
} from '../controllers/conversationControllers.js'
import { jwtWithRoleMiddleware } from '../middlewares/roleMiddleware.js'

const conversationRouter = express.Router()

// All conversation routes require authentication
conversationRouter.use(jwtWithRoleMiddleware)

// ============================================
// CONVERSATION ROUTES
// ============================================

/**
 * POST /api/v1/conversations
 * Create or get existing conversation for a listing
 *
 * Body:
 * {
 *   "listingId": 1
 * }
 */
conversationRouter.post("/", async (req, res) => {
  try {
    const { listingId } = req.body
    const buyerId = req.user.id

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ listing ID"
      })
    }

    const result = await createOrGetConversation(parseInt(listingId), buyerId)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(result.isNew ? 201 : 200).json({
      success: true,
      message: result.isNew ? "สร้างการสนทนาเรียบร้อยแล้ว" : "พบการสนทนาที่มีอยู่",
      data: result.conversation
    })

  } catch (error) {
    console.error("Create/get conversation error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างการสนทนา"
    })
  }
})

/**
 * GET /api/v1/conversations
 * Get all conversations for the authenticated user
 *
 * Query params:
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
conversationRouter.get("/", async (req, res) => {
  try {
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    const result = await getUserConversations(userId, limit, offset)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลการสนทนาเรียบร้อยแล้ว",
      data: result.conversations,
      pagination: result.pagination
    })

  } catch (error) {
    console.error("Get conversations error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลการสนทนา"
    })
  }
})

/**
 * GET /api/v1/conversations/unread-count
 * Get unread message count for the authenticated user
 */
conversationRouter.get("/unread-count", async (req, res) => {
  try {
    const userId = req.user.id

    const result = await getUnreadCount(userId)

    return res.status(200).json({
      success: true,
      data: {
        unreadCount: result.unreadCount
      }
    })

  } catch (error) {
    console.error("Get unread count error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล"
    })
  }
})

/**
 * GET /api/v1/conversations/:conversationId/messages
 * Get all messages in a conversation
 *
 * Query params:
 * - limit: number (default 100)
 * - offset: number (default 0)
 */
conversationRouter.get("/:conversationId/messages", async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId)
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 100
    const offset = parseInt(req.query.offset) || 0

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID ไม่ถูกต้อง"
      })
    }

    const result = await getConversationMessages(conversationId, userId, limit, offset)

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลข้อความเรียบร้อยแล้ว",
      data: {
        messages: result.messages,
        conversation: result.conversation
      },
      pagination: result.pagination
    })

  } catch (error) {
    console.error("Get messages error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลข้อความ"
    })
  }
})

/**
 * DELETE /api/v1/conversations/:conversationId
 * Delete a conversation
 */
conversationRouter.delete("/:conversationId", async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId)
    const userId = req.user.id
    const userRole = req.user.role

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID ไม่ถูกต้อง"
      })
    }

    const result = await deleteConversation(conversationId, userId, userRole)

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
    console.error("Delete conversation error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบการสนทนา"
    })
  }
})

// ============================================
// MESSAGE ROUTES
// ============================================

/**
 * POST /api/v1/conversations/:conversationId/messages
 * Send a message in a conversation
 *
 * Body:
 * {
 *   "messageText": "สวัสดีครับ สนใจสินค้าครับ"
 * }
 */
conversationRouter.post("/:conversationId/messages", async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId)
    const { messageText } = req.body
    const senderId = req.user.id

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID ไม่ถูกต้อง"
      })
    }

    if (!messageText || messageText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุข้อความ"
      })
    }

    if (messageText.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "ข้อความยาวเกินไป (สูงสุด 5000 ตัวอักษร)"
      })
    }

    const result = await sendMessage(conversationId, senderId, messageText.trim())

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.error
      })
    }

    return res.status(201).json({
      success: true,
      message: "ส่งข้อความเรียบร้อยแล้ว",
      data: result.message
    })

  } catch (error) {
    console.error("Send message error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งข้อความ"
    })
  }
})

/**
 * PATCH /api/v1/conversations/:conversationId/read
 * Mark all messages in a conversation as read
 */
conversationRouter.patch("/:conversationId/read", async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId)
    const userId = req.user.id

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID ไม่ถูกต้อง"
      })
    }

    const result = await markMessagesAsRead(conversationId, userId)

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ทำเครื่องหมายข้อความว่าอ่านแล้ว",
      data: {
        markedCount: result.markedCount
      }
    })

  } catch (error) {
    console.error("Mark as read error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ"
    })
  }
})

export default conversationRouter
