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
  updateUserStatus,
  updateUserByAdmin
} from "../controllers/adminController.js"
import { updateListingByAdmin } from "../controllers/listingControllers.js"

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

  console.log(email, "fire");


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

    console.log(result);


    if (result.success) {
      return res.status(201).json({
        success: true,
        message: "สร้างบัญชี Admin สำเร็จ",
        id: result.id
      })
    } else {
      // If createUserAccount returns structured failure (optional)
      return res.status(400).json({
        success: false,
        message: result.message || "ไม่สามารถสร้างบัญชีได้"
      })
    }
  } catch (error) {
    console.error("Admin signup error:", error)

    // Handle Postgres unique-constraint violation (duplicate key)
    if (error && error.code === "23505") {
      // Try to parse which column caused the conflict from error.detail
      // typical detail: 'Key (username)=(admin1) already exists.'
      let field = "ข้อมูล"
      if (error.detail) {
        const match = error.detail.match(/\(([^)]+)\)=\(([^)]+)\)/)
        if (match && match[1]) {
          field = match[1] // e.g. "username" or "email"
        }
      }

      // Map to user-friendly Thai field name (extend as needed)
      const fieldThai = field === "username" ? "username" : field === "email" ? "email" : field

      return res.status(409).json({
        success: false,
        message: `${fieldThai} ถูกใช้แล้ว`
      })
    }

    // Default internal error
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
    const { name, slug, icon, parentId, displayOrder, isActive } = req.body

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
      parentId: parentId !== undefined ? (parentId === null ? null : parseInt(parentId)) : undefined,
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
  const userRole = req.user.role; // ดึง role จาก JWT middleware

  console.log("User Role:", userRole);
  console.log("Search:", search);

  try {
    // ส่ง userRole เข้าไปด้วย
    const result = search
      ? await getAllUsers(search, userRole)
      : await getAllUsers(null, userRole);

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
});

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

/**
 * Edit user profile (Admin Only)
 * PUT /api/v1/admin/users/:id
 * Body: { username, email, firstName, lastName, phone, avatarUrl, status, userRole }
 * Requires: Admin or Super Admin authentication
 */
adminRouter.put("/users/:id", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const { username, email, firstName, lastName, phone, avatarUrl, status, userRole } = req.body
    const adminRole = req.user.role;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "รหัสผู้ใช้ไม่ถูกต้อง"
      })
    }

    const updateData = {
      username,
      email,
      firstName,
      lastName,
      phone,
      avatarUrl,
      status,
      userRole
    }

    const result = await updateUserByAdmin(userId, updateData, adminRole)

    if (!result.success) {
      const statusCode = result.error === 'User not found' ? 404 : 400
      return res.status(statusCode).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "อัพเดทข้อมูลผู้ใช้สำเร็จ (Admin)",
      user: result.user
    })
  } catch (error) {
    console.error("Admin update user error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

// ============================================
// LISTING MANAGEMENT ROUTES (Admin Only)
// ============================================

/**
 * Edit any listing (admin override)
 * PUT /api/v1/admin/listings/:id
 * Body: { title, description, price, location, locationLat, locationLng, categoryId, status }
 * Requires: Admin or Super Admin authentication
 */
adminRouter.put("/listings/:id", jwtWithRoleMiddleware, requireAdmin, async (req, res) => {
  try {
    const listingId = parseInt(req.params.id)
    const { title, description, price, location, locationLat, locationLng, categoryId, status } = req.body

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
      price,
      location,
      locationLat,
      locationLng,
      categoryId,
      status
    }

    const result = await updateListingByAdmin(listingId, updateData)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "อัพเดทประกาศสำเร็จ (Admin)",
      listing: result.listing
    })
  } catch (error) {
    console.error("Admin update listing error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

export default adminRouter
