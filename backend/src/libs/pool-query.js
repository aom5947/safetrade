/**
 * @fileoverview PostgreSQL connection pool and query helper
 * @module libs/pool-query
 * @description Provides connection pool management and query execution for PostgreSQL database
 */

import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config();

/**
 * PostgreSQL connection pool instance
 *
 * @type {Pool}
 * @description
 * Configured for Neon/serverless PostgreSQL databases with optimized settings:
 * - Low connection count (max: 5) suitable for serverless environments
 * - SSL enabled with relaxed certificate verification (configure for production)
 * - Connection and idle timeouts configured for serverless
 *
 * @example
 * import { pool } from './pool-query.js';
 * const client = await pool.connect();
 * try {
 *   await client.query('BEGIN');
 *   // ... transaction queries
 *   await client.query('COMMIT');
 * } finally {
 *   client.release();
 * }
 */
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ถ้ารันแล้วเจอปัญหา certificate บนบาง environment ให้ใช้ rejectUnauthorized:false
    // แต่การตั้งนี้จะลดการตรวจสอบใบรับรอง — ระวังความปลอดภัยใน production
    ssl: { rejectUnauthorized: false },
    // ปรับ pool ให้เหมาะกับ Neon (ปริมาณการเชื่อมต่อต่ำ)
    max: 5,               // ปรับให้ไม่มากเกินไป (serverless/DB ที่แชร์)
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('Unexpected idle client error', err);
});

/**
 * Executes a parameterized SQL query using the connection pool
 *
 * @async
 * @param {string} sql - SQL query string with $1, $2, etc. placeholders
 * @param {Array} [params=[]] - Array of parameter values to bind to query
 * @returns {Promise<Object>} PostgreSQL query result object
 * @returns {Array} returns.rows - Array of result rows
 * @returns {number} returns.rowCount - Number of rows affected/returned
 * @returns {Array} returns.fields - Array of field metadata
 *
 * @throws {Error} If query execution fails
 *
 * @example
 * // Simple query
 * const result = await query('SELECT * FROM users WHERE user_id = $1', [42]);
 * console.log(result.rows[0]); // First user row
 *
 * @example
 * // Insert with RETURNING
 * const result = await query(
 *   'INSERT INTO users (email, username) VALUES ($1, $2) RETURNING user_id',
 *   ['test@example.com', 'testuser']
 * );
 * const newUserId = result.rows[0].user_id;
 *
 * @description
 * This is a convenience wrapper around pool.query that:
 * - Automatically uses parameterized queries (prevents SQL injection)
 * - Returns the full result object from pg
 * - Supports all PostgreSQL query types (SELECT, INSERT, UPDATE, DELETE, etc.)
 *
 * For transactions, use pool.connect() directly to get a client.
 */
export const query = async (sql, params = []) => {
  const res = await pool.query(sql, params)
  return res
};