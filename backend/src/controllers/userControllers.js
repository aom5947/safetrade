import dotenv from "dotenv"
import { pool, query } from "../libs/pool-query.js"
import bcrypt from "bcryptjs"

dotenv.config()

/**
 * Creates a new user account
 *
 * @async
 * @param {Object} params - User registration data
 * @param {string} params.email - User email (unique)
 * @param {string} params.password - Hashed password (bcrypt)
 * @param {string} params.username - Username (unique)
 * @param {string} params.first_name - User's first name
 * @param {string} params.last_name - User's last name
 * @param {string} params.user_role - User role ('buyer', 'seller', 'admin', 'super_admin')
 * @returns {Promise<Object>} Result object with success status and user ID
 * @returns {boolean} returns.success - Whether signup succeeded
 * @returns {number} [returns.id] - Created user ID
 * @returns {string} [returns.message] - Error message if failed
 *
 * @throws {Error} If database operation fails
 *
 * @description
 * Creates a new user account in the users table
 */
export const signupUser = async ({ email, password, username, first_name, last_name, user_role }) => {
  try {
    // Create user account
    const userSql = 'INSERT INTO users (email, password, username, first_name, last_name, user_role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id';
    const userParam = [email, password, username, first_name, last_name, user_role];
    const userResult = await query(userSql, userParam);

    if (userResult.rowCount === 0) {
      return { success: false, message: 'Failed to create user account' };
    }

    const userId = userResult.rows[0].user_id;

    console.log(`✅ User created successfully: ID=${userId}`);

    return {
      success: true,
      id: userId
    };

  } catch (error) {
    console.error("Error occurred during signup:", error);
    throw error;
  }
}

export const singInUserWithEmail = async ({ email }) => {
  const sql = 'SELECT * FROM users WHERE email = $1'
  const param = [email]

  try {
    const result = await query(sql, param)

    if (result.rowCount > 0) {
      return { success: true, result: result.rows[0] };
    }
    console.log("tes", result.rows)
    return { success: false, message: 'Insert failed' };

  } catch (error) {
    console.error('Error signing in user:', error)
    throw error
  }

}

export const deleteUser = async ({ user_id }) => {
  const sql = 'DELETE FROM users WHERE user_id = $1 RETURNING *'
  const param = [user_id]

  try {
    const result = await query(sql, param)

    if (result.rowCount > 0) {
      return { success: true, result: result.rows[0] };
    }
    console.log("tes", result.rows)
    return { success: false, message: 'Insert failed' };

  } catch (error) {
    console.error('Error signing in user:', error)
    throw error
  }
}

export const changePasswordUser = async ({ userId, currentPassword, newPassword }) => {
  try {
    const sql = 'UPDATE users SET password = $1 WHERE user_id = $2'
    const params = [newPassword, userId]

    const result = await query(
      'SELECT password FROM users WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return { success: false, error: 'ไม่พบผู้ใช้' };
    }

    const user = result.rows[0];

    // ตรวจสอบรหัสผ่านเดิม
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return { success: false, error: 'รหัสผ่านเก่าไม่ถูกต้อง' };
    }

    await query(sql, params);

    return { success: true, message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' };

  } catch (error) {
    console.error('Error in changePasswordUser:', error);
    return { success: false, error: 'เกิดข้อผิดพลาดบางอย่าง' };
  }
};

export const editUserProfile = async ({ userId, username, email, password, first_name, last_name, phone, avatar_url }) => {
  try {
    // ดึงข้อมูล user ปัจจุบัน
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return { success: false, error: 'ไม่พบผู้ใช้' };
    }

    const user = result.rows[0];

    // ใช้ข้อมูลใหม่ถ้ามี ไม่มีก็ fallback เป็นค่าปัจจุบัน
    const updatedUser = await pool.query(
      `UPDATE users SET
        username = $1,
        email = $2,
        password = $3,
        first_name = $4,
        last_name = $5,
        phone = $6,
        avatar_url = $7
       WHERE user_id = $8
       RETURNING user_id, username, email, first_name, last_name, avatar_url, trust_score, status, created_at, user_role`,
      [
        username ?? user.username,
        email ?? user.email,
        password ?? user.password,
        first_name ?? user.first_name,
        last_name ?? user.last_name,
        phone ?? user.phone,
        avatar_url ?? user.avatar_url,
        userId,
      ]
    );


    return { success: true, user: updatedUser.rows[0] };

  } catch (error) {
    console.error('Edit profile error:', error.message);
    return { success: false, error: 'เกิดข้อผิดพลาดภายในระบบ' };
  }
};

export const getOwnData = async ({ userId }) => {
  const sql = `
    SELECT user_id, username, email, created_at
    FROM users
    WHERE user_id = $1
  `
  const param = [userId]

  try {
    const result = await query(sql, param)

    if (result.rowCount > 0) {
      return { success: true, result: result.rows[0] }
    }

    return { success: false, message: 'User not found' }
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}
