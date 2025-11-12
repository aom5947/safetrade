/**
 * @fileoverview Admin routes for C2C Marketplace
 * @module routes/adminRouter
 * @description All admin-related routes including user management and category management
 */

import { Router } from "express"
import bcrypt from "bcryptjs"
import dotenv from 'dotenv'

import { onlySuperAdmin } from "../middlewares/superAdmin.js"
import { jwtWithRoleMiddleware, requireAdmin } from "../middlewares/roleMiddleware.js"
import {
  createUserAccount,
  deleteUserAccount,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllUsers,
  updateUserStatus
} from "../controllers/adminController.js"

dotenv.config()

const adminRouter = Router()
const BCRYPT_ROUNDS = 10

// ============================================
// USER MANAGEMENT ROUTES (Super Admin Only)
// ============================================

/**
 * Create admin account
 * POST /api/v1/admin/users
 * Requires: Super Admin authentication
 */
adminRouter.post("/users", onlySuperAdmin, async (req, res) => {
  const { email, password, username, first_name, last_name } = req.body
  const role = "admin"

  // Validate required fields
  if (!email || !password || !username || !first_name || !last_name) {
    return res.status(400).json({
      success: false,
      message: "ต้องระบุ email, password, username, first_name, last_name"
    })
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS)

    // Create admin user
    const result = await createUserAccount({
      email,
      password: hashedPassword,
      username,
      first_name,
      last_name,
      user_role: role
    })

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: "สร้างบัญชี Admin สำเร็จ",
        id: result.id
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "ไม่สามารถสร้างบัญชีได้"
      })
    }
  } catch (error) {
    console.error("Admin signup error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

/**
 * Delete user account
 * DELETE /api/v1/admin/users/:id
 * Requires: Super Admin authentication
 */
adminRouter.delete("/users/:id", onlySuperAdmin, async (req, res) => {
  const user_id = parseInt(req.params.id)

  // Validate user_id
  if (isNaN(user_id)) {
    return res.status(400).json({
      success: false,
      message: "รหัสผู้ใช้ไม่ถูกต้อง"
    })
  }

  try {
    const result = await deleteUserAccount({ user_id })

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบผู้ใช้"
      })
    }

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "ลบบัญชีสำเร็จ",
        deletedUser: result.result
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "ไม่สามารถลบบัญชีได้"
      })
    }
  } catch (error) {
    console.error("Delete user error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

// ============================================
// CATEGORY MANAGEMENT ROUTES (Admin Only)
// ============================================

/**
 * Create new category
 * POST /api/v1/admin/categories
 * Requires: Admin or Super Admin authentication
 */
adminRouter.post("/categories", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, slug, icon, parentId, displayOrder } = req.body

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "ต้องระบุ name และ slug"
      })
    }

    const categoryData = {
      name,
      slug,
      icon: icon || null,
      parentId: parentId ? parseInt(parentId) : null,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0
    }

    const result = await createCategory(categoryData)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(201).json({
      success: true,
      message: "สร้างหมวดหมู่สำเร็จ",
      category: result.category
    })
  } catch (error) {
    console.error("Create category error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

/**
 * Update category
 * PUT /api/v1/admin/categories/:id
 * Requires: Admin or Super Admin authentication
 */
adminRouter.put("/categories/:id", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id)
    const { name, slug, icon, displayOrder, isActive } = req.body

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "รหัสหมวดหมู่ไม่ถูกต้อง"
      })
    }

    const updateData = {
      name,
      slug,
      icon,
      displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
      isActive
    }

    const result = await updateCategory(categoryId, updateData)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "อัพเดทหมวดหมู่สำเร็จ",
      category: result.category
    })
  } catch (error) {
    console.error("Update category error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

/**
 * Delete category
 * DELETE /api/v1/admin/categories/:id
 * Requires: Admin or Super Admin authentication
 */
adminRouter.delete("/categories/:id", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id)

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "รหัสหมวดหมู่ไม่ถูกต้อง"
      })
    }

    const result = await deleteCategory(categoryId)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "ลบหมวดหมู่สำเร็จ",
      category: result.category
    })
  } catch (error) {
    console.error("Delete category error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

adminRouter.get("/getalluser", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {

  const { search } = req.query;

  console.log(search);

  try {
    const result = search
      ? await getAllUsers(search)
      : await getAllUsers();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลผู้ใช้ทั้งหมดสำเร็จ",
      users: result.data
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดขณะดึงข้อมูลผู้ใช้",
    });
  }
})

adminRouter.put("/updateuserstatus", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {
  const { userId, newStatus } = req.body;

  const statusEnum = ['active', 'suspended', 'banned'];

  if (!statusEnum.includes(newStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value'
    });
  }

  try {
    const result = await updateUserStatus(userId, newStatus);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "อัปเดตสถานะผู้ใช้สำเร็จ",
      user: result.data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดขณะอัปเดตสถานะผู้ใช้",
    });
  }
});



export default adminRouter
