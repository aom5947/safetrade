import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from 'dotenv'

import { jwtTokenMiddleware } from "../middlewares/jwtMiddleware.js"
import {
  changePasswordUser,
  editUserProfile,
  getOwnData,
  signupUser,
  singInUserWithEmail
} from "../controllers/userControllers.js"

dotenv.config()

const userRouter = Router()
const JWT_SECRET = process.env.JWT_SECRET
const BCRYPT_ROUNDS = 10
const PASSWORD_MIN_LENGTH = 4
const ALLOWED_USER_ROLES = ['buyer', 'seller']


// ============================================
// HEALTH CHECK ROUTE
// ============================================

userRouter.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "User router is operational"
  })
})

// ============================================
// TOKEN VERIFICATION
// ============================================

userRouter.get("/verify-token", jwtTokenMiddleware, (req, res) => {
  try {
    const userId = req.user

    return res.status(200).json({
      success: true,
      message: "Token is valid",
      userId
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

userRouter.get('/me', jwtTokenMiddleware, async (req, res) => {

  const userId = req.user

  try {
    const response = await getOwnData(userId)

    if (!response.success) {
      return res.status(404).json({
        success: false,
        message: response.message || 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Fetched user data successfully',
      data: response.result,
    })
  } catch (error) {
    console.error('Error in /me route:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }

})

userRouter.get('/get-by-id', (req, res) => {
  const { id } = req.params
  try {

  } catch (error) {

  }
})

// ============================================
// USER SIGNUP (Public)
// ============================================

userRouter.post("/signup", async (req, res) => {
  const { email, password, username, first_name, last_name, role } = req.body

  // Validate required fields
  if (!email || !password || !username || !first_name || !last_name || !role) {
    return res.status(400).json({
      success: false,
      message: "ต้องระบุ email, password, username, first_name, last_name, role"
    })
  }

  // Validate role - only buyer and seller allowed for public signup
  if (!ALLOWED_USER_ROLES.includes(role)) {
    return res.status(403).json({
      success: false,
      message: "Role ไม่ถูกต้อง กรุณาเลือก buyer หรือ seller เท่านั้น"
    })
  }

  // Validate password length
  if (password.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`
    })
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS)

    // Create user account
    const result = await signupUser({
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
        message: "สมัครสมาชิกสำเร็จ",
        id: result.id
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "ไม่สามารถสมัครสมาชิกได้"
      })
    }
  } catch (error) {
    console.error("User signup error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})


// ============================================
// USER SIGNIN
// ============================================

userRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "ต้องระบุ email และ password"
    })
  }

  try {
    // Find user by email
    const { result: user } = await singInUserWithEmail({ email })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
      })
    }

    // Generate JWT token with user_id and role
    const token = jwt.sign(
      { id: user.user_id, role: user.user_role },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    // Remove password from response
    const { password: _, ...safeUser } = user

    return res.status(200).json({
      success: true,
      message: "เข้าสู่ระบบสําเร็จ",
      user: safeUser,
      token
    })
  } catch (error) {
    console.error("Signin error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})


// ============================================
// EDIT USER PROFILE
// ============================================

userRouter.patch("/edit-profile", jwtTokenMiddleware, async (req, res) => {
  const userId = req.user
  const { username, email, newPassword, phone, first_name, last_name, avatar_url } = req.body

  console.log(phone);


  // Validate that at least one field is provided for update
  if (!username && !email && !newPassword && !phone && !first_name && !last_name && !avatar_url) {
    return res.status(400).json({
      success: false,
      message: "ต้องระบุข้อมูลอย่างน้อย 1 ฟิลด์เพื่ออัพเดท"
    })
  }

  try {
    // Hash password if provided
    const hashedPassword = newPassword
      ? await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
      : undefined

    const result = await editUserProfile({
      userId,
      username,
      email,
      password: hashedPassword,
      phone,
      first_name,
      last_name,
      avatar_url
    })

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "อัพเดทโปรไฟล์สำเร็จ",
      user: result.user
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
})

// ============================================
// CHANGE PASSWORD
// ============================================

userRouter.post("/change-password", jwtTokenMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const userId = req.user

  // Validate required fields
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "กรุณากรอกรหัสผ่านเก่าและรหัสผ่านใหม่"
    })
  }

  // Validate new password length
  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `รหัสผ่านใหม่ต้องมีอย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`
    })
  }

  // Validate that new password is different from current
  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านเก่า"
    })
  }

  try {
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

    const result = await changePasswordUser({
      userId,
      currentPassword,
      newPassword: hashedPassword
    })

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    return res.status(200).json({
      success: true,
      message: "เปลี่ยนรหัสผ่านสำเร็จ"
    })
  } catch (error) {
    console.error("Change password error:", error)
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน"
    })
  }
})

export default userRouter
