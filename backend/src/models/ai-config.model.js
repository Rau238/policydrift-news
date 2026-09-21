import { pool } from '../db/pool.js';
import { env } from '../config/env.js';

let tableEnsured = false;

export async function ensureAiSettingsTable() {
  if (tableEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news_ai_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tableEnsured = true;
  } catch (err) {
    console.warn('[AI Config] Warning: Failed to ensure news_ai_settings table:', err.message);
  }
}

/**
 * Get all AI settings merged with environment fallbacks
 */
export async function getAiSettings() {
  await ensureAiSettingsTable();
  const settings = {
    provider_priority: 'groq,gemini,openai', // default fallback priority
    gemini_api_key: env.GEMINI_API_KEY || '',
    gemini_model: env.GEMINI_MODEL || 'gemini-3.6-flash',
    groq_api_key: env.GROQ_API_KEY || '',
    groq_model: env.GROQ_MODEL || 'openai/gpt-oss-120b',
    openai_api_key: env.OPENAI_API_KEY || '',
    openai_model: env.OPENAI_MODEL || 'gpt-4o-mini',
  };

  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM news_ai_settings');
    for (const row of rows) {
      if (row.setting_key && row.setting_value !== undefined) {
        settings[row.setting_key] = row.setting_value;
      }
    }
  } catch (err) {
    // If DB read fails, return env defaults gracefully
    console.warn('[AI Config] Failed to fetch settings from DB:', err.message);
  }

  return settings;
}

/**
 * Save / Update multiple AI settings
 */
export async function updateAiSettings(updates = {}) {
  await ensureAiSettingsTable();
  const entries = Object.entries(updates);
  if (entries.length === 0) return;

  for (const [key, value] of entries) {
    if (value === undefined || value === null) continue;
    const strVal = String(value).trim();
    await pool.query(
      `INSERT INTO news_ai_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP`,
      [key, strVal]
    );
  }
}
