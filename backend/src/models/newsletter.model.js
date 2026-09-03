import { pool } from '../db/pool.js';
import crypto from 'crypto';

let tableEnsured = false;

export async function ensureNewsletterTableExists() {
  if (tableEnsured) return;
  const sql = `
    CREATE TABLE IF NOT EXISTS news_newsletter_subscribers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(128) NULL,
      frequency VARCHAR(32) NOT NULL DEFAULT 'daily',
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      unsubscribe_token VARCHAR(64) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_active_frequency (is_active, frequency),
      INDEX idx_token (unsubscribe_token)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  try {
    await pool.query(sql);
    tableEnsured = true;
  } catch (err) {
    console.warn('[newsletter.model] Table initialization notice:', err.message);
  }
}

/**
 * Subscribe an email address to the newsletter.
 */
export async function subscribe({ email, name = null, frequency = 'daily' }) {
  await ensureNewsletterTableExists();
  const cleanEmail = email.trim().toLowerCase();
  const token = crypto.randomBytes(24).toString('hex');

  const sql = `
    INSERT INTO news_newsletter_subscribers
      (email, name, frequency, is_active, unsubscribe_token, updated_at)
    VALUES (?, ?, ?, 1, ?, NOW())
    ON DUPLICATE KEY UPDATE
      name = COALESCE(VALUES(name), name),
      frequency = VALUES(frequency),
      is_active = 1,
      updated_at = NOW();
  `;
  const [result] = await pool.query(sql, [cleanEmail, name ? name.trim() : null, frequency, token]);
  return { id: result.insertId || null, email: cleanEmail, isNew: result.affectedRows === 1 };
}

/**
 * Unsubscribe using a secret token.
 */
export async function unsubscribeByToken(token) {
  await ensureNewsletterTableExists();
  const sql = `UPDATE news_newsletter_subscribers SET is_active = 0, updated_at = NOW() WHERE unsubscribe_token = ?`;
  const [result] = await pool.query(sql, [token]);
  return result.affectedRows > 0;
}

/**
 * Unsubscribe by email address.
 */
export async function unsubscribeByEmail(email) {
  await ensureNewsletterTableExists();
  const cleanEmail = email.trim().toLowerCase();
  const sql = `UPDATE news_newsletter_subscribers SET is_active = 0, updated_at = NOW() WHERE email = ?`;
  const [result] = await pool.query(sql, [cleanEmail]);
  return result.affectedRows > 0;
}

/**
 * Fetch active subscribers for dispatch.
 */
export async function getActiveSubscribers({ frequency = null } = {}) {
  await ensureNewsletterTableExists();
  let sql = `SELECT id, email, name, frequency, unsubscribe_token FROM news_newsletter_subscribers WHERE is_active = 1`;
  const params = [];
  if (frequency && frequency !== 'all') {
    sql += ` AND frequency = ?`;
    params.push(frequency);
  }
  sql += ` ORDER BY id DESC`;
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * List subscribers with pagination for admin.
 */
export async function listSubscribers({ page = 1, limit = 50, search = '' } = {}) {
  await ensureNewsletterTableExists();
  const offset = (page - 1) * limit;
  let where = 'WHERE 1=1';
  const params = [];

  if (search) {
    where += ' AND (email LIKE ? OR name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM news_newsletter_subscribers ${where}`, params);
  const total = countRows[0]?.total ?? 0;

  const [rows] = await pool.query(
    `SELECT id, email, name, frequency, is_active, created_at, updated_at
     FROM news_newsletter_subscribers ${where}
     ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { subscribers: rows, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

/**
 * Count active newsletter subscribers.
 */
export async function countActiveSubscribers() {
  await ensureNewsletterTableExists();
  const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM news_newsletter_subscribers WHERE is_active = 1`);
  return rows[0]?.count ?? 0;
}
