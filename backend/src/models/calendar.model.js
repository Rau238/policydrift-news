/**
 * NewsFree365 — Calendar Events Model
 *
 * Persists macroeconomic announcements, trading holidays, corporate earnings,
 * IPO listings, dividends, and commodity triggers in MySQL.
 */

import { pool } from '../db/pool.js';
import {
  ECONOMIC_EVENTS,
  MARKET_HOLIDAYS,
  CORPORATE_RESULTS,
  IPO_EVENTS,
  DIVIDEND_EVENTS,
  COMMODITY_EVENTS,
} from '../config/calendar-data.js';

let tableEnsured = false;

/**
 * Ensures the `calendar_events` table exists in MySQL with optimal indexes.
 */
export async function ensureCalendarTableExists() {
  if (tableEnsured) return;
  const sql = `
    CREATE TABLE IF NOT EXISTS calendar_events (
      id VARCHAR(128) PRIMARY KEY,
      event_type VARCHAR(32) NOT NULL,
      category VARCHAR(64) NULL,
      title VARCHAR(255) NOT NULL,
      country VARCHAR(16) NOT NULL DEFAULT 'IN',
      country_name VARCHAR(64) NULL,
      flag VARCHAR(32) NULL,
      authority VARCHAR(255) NULL,
      event_date DATE NOT NULL,
      event_time VARCHAR(64) DEFAULT 'All Day',
      impact VARCHAR(16) DEFAULT 'medium',
      forecast VARCHAR(64) NULL,
      previous VARCHAR(64) NULL,
      actual VARCHAR(64) NULL,
      unit VARCHAR(64) NULL,
      session_status VARCHAR(255) NULL,
      exchanges TEXT NULL,
      symbol VARCHAR(64) NULL,
      quarter VARCHAR(32) NULL,
      estimate_eps VARCHAR(64) NULL,
      estimate_revenue VARCHAR(64) NULL,
      issue_size VARCHAR(64) NULL,
      price_band VARCHAR(64) NULL,
      lot_size VARCHAR(64) NULL,
      subscription_status VARCHAR(64) NULL,
      amount VARCHAR(64) NULL,
      record_date VARCHAR(64) NULL,
      yield_percent VARCHAR(32) NULL,
      description TEXT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      is_custom TINYINT(1) NOT NULL DEFAULT 0,
      source_url VARCHAR(512) NULL,
      last_synced_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_event_date (event_date),
      INDEX idx_event_type (event_type),
      INDEX idx_country (country),
      INDEX idx_is_active (is_active),
      INDEX idx_impact (impact)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  try {
    await pool.query(sql);
    tableEnsured = true;
  } catch (err) {
    console.warn('[calendar.model] Table initialization notice:', err.message);
  }
}

const SELECT_COLUMNS = `
  id, event_type, category, title, country, country_name, flag, authority,
  DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date,
  event_time, impact, forecast, previous, actual, unit,
  session_status, exchanges, symbol, quarter, estimate_eps, estimate_revenue,
  issue_size, price_band, lot_size, subscription_status, amount, record_date, yield_percent,
  description, is_active, is_custom, source_url, last_synced_at,
  created_at, updated_at
`.trim();

/**
 * Normalizes an event row from database representation into standard frontend format.
 */
function normalizeEventRow(row) {
  if (!row) return null;

  let exchanges = [];
  if (row.exchanges) {
    try {
      exchanges = typeof row.exchanges === 'string' ? JSON.parse(row.exchanges) : row.exchanges;
    } catch {
      exchanges = [row.exchanges];
    }
  }

  // Format date to YYYY-MM-DD cleanly without timezone offset shift
  let dateStr = row.event_date;
  if (row.event_date instanceof Date) {
    const y = row.event_date.getFullYear();
    const m = String(row.event_date.getMonth() + 1).padStart(2, '0');
    const d = String(row.event_date.getDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  } else if (typeof dateStr === 'string') {
    dateStr = dateStr.split('T')[0];
  }

  return {
    id: row.id,
    type: row.event_type,
    category: row.category || '',
    title: row.title,
    date: dateStr,
    time: row.event_time || 'All Day',
    country: row.country,
    countryName: row.country_name || (row.country === 'IN' ? 'India' : row.country === 'US' ? 'United States' : 'Global'),
    flag: row.flag || '',
    authority: row.authority || '',
    impact: row.impact || 'medium',
    forecast: row.forecast || null,
    previous: row.previous || null,
    actual: row.actual || null,
    unit: row.unit || null,
    sessionStatus: row.session_status || null,
    exchanges,
    symbol: row.symbol || null,
    quarter: row.quarter || null,
    estimateEps: row.estimate_eps || null,
    estimateRevenue: row.estimate_revenue || null,
    issueSize: row.issue_size || null,
    priceBand: row.price_band || null,
    lotSize: row.lot_size || null,
    subscriptionStatus: row.subscription_status || null,
    amount: row.amount || null,
    recordDate: row.record_date || null,
    yieldPercent: row.yield_percent || null,
    description: row.description || '',
    isActive: Boolean(row.is_active),
    isCustom: Boolean(row.is_custom),
    sourceUrl: row.source_url || null,
    lastSyncedAt: row.last_synced_at || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

/**
 * List events with flexible filters.
 *
 * @param {object} opts
 * @param {string} [opts.type] - 'economy' | 'holiday' | 'result' | 'ipo' | 'dividend' | 'commodity' | 'all'
 * @param {string} [opts.country] - 'IN' | 'US' | 'GLOBAL' | 'all'
 * @param {string} [opts.impact] - 'high' | 'medium' | 'low' | 'all'
 * @param {string} [opts.timeframe] - 'this_week' | 'this_month' | 'upcoming' | 'past' | 'all'
 * @param {string} [opts.search] - search string for title, authority, symbol, description
 * @param {boolean} [opts.includeInactive] - whether to include disabled events (for admin desk)
 * @param {number} [opts.limit]
 * @param {number} [opts.offset]
 */
export async function listCalendarEvents({
  type = 'all',
  country = 'all',
  impact = 'all',
  timeframe = 'all',
  search = '',
  includeInactive = false,
  limit = 200,
  offset = 0,
} = {}) {
  await ensureCalendarTableExists();

  const conditions = [];
  const params = [];

  if (!includeInactive) {
    conditions.push('is_active = 1');
  }

  if (type && type !== 'all') {
    // Normalise plural variants
    const mappedType = type === 'holidays' ? 'holiday'
      : type === 'results' ? 'result'
      : type === 'dividends' ? 'dividend'
      : type === 'commodities' ? 'commodity'
      : type;
    conditions.push('event_type = ?');
    params.push(mappedType);
  }

  if (country && country !== 'all') {
    conditions.push('country = ?');
    params.push(country.toUpperCase());
  }

  if (impact && impact !== 'all') {
    conditions.push('impact = ?');
    params.push(impact.toLowerCase());
  }

  if (timeframe === 'this_week') {
    conditions.push('event_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)');
  } else if (timeframe === 'this_month') {
    conditions.push('event_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)');
  } else if (timeframe === 'upcoming') {
    conditions.push('event_date >= CURDATE()');
  } else if (timeframe === 'past') {
    conditions.push('event_date < CURDATE()');
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push('(title LIKE ? OR authority LIKE ? OR symbol LIKE ? OR description LIKE ? OR category LIKE ?)');
    params.push(term, term, term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
    SELECT ${SELECT_COLUMNS} FROM calendar_events
    ${whereClause}
    ORDER BY event_date ASC, event_time ASC, id ASC
    LIMIT ? OFFSET ?
  `;
  params.push(Number(limit), Number(offset));

  try {
    const [rows] = await pool.query(sql, params);

    // Also get count
    const countSql = `SELECT COUNT(*) AS total FROM calendar_events ${whereClause}`;
    const [countRows] = await pool.query(countSql, params.slice(0, -2));
    const total = countRows[0]?.total ?? 0;

    return {
      events: rows.map(normalizeEventRow),
      total,
    };
  } catch (err) {
    console.error('[calendar.model.listCalendarEvents] Query failed:', err.message);
    return { events: [], total: 0 };
  }
}

/**
 * Get a single calendar event by its ID.
 */
export async function getCalendarEventById(id) {
  await ensureCalendarTableExists();
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM calendar_events WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ? normalizeEventRow(rows[0]) : null;
}

/**
 * Create a new calendar event.
 */
export async function createCalendarEvent(data) {
  await ensureCalendarTableExists();

  const id = data.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const eventType = data.type || data.event_type || 'economy';
  const exchanges = Array.isArray(data.exchanges)
    ? JSON.stringify(data.exchanges)
    : (typeof data.exchanges === 'string' ? data.exchanges : null);

  const sql = `
    INSERT INTO calendar_events (
      id, event_type, category, title, country, country_name, flag,
      authority, event_date, event_time, impact, forecast, previous,
      actual, unit, session_status, exchanges, symbol, quarter,
      estimate_eps, estimate_revenue, issue_size, price_band, lot_size,
      subscription_status, amount, record_date, yield_percent,
      description, is_active, is_custom, source_url, last_synced_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, NOW()
    )
  `;

  const params = [
    id,
    eventType,
    data.category || null,
    data.title,
    (data.country || 'IN').toUpperCase(),
    data.countryName || data.country_name || null,
    data.flag || null,
    data.authority || null,
    data.date || data.event_date,
    data.time || data.event_time || 'All Day',
    data.impact || 'medium',
    data.forecast || null,
    data.previous || null,
    data.actual || null,
    data.unit || null,
    data.sessionStatus || data.session_status || null,
    exchanges,
    data.symbol || null,
    data.quarter || null,
    data.estimateEps || data.estimate_eps || null,
    data.estimateRevenue || data.estimate_revenue || null,
    data.issueSize || data.issue_size || null,
    data.priceBand || data.price_band || null,
    data.lotSize || data.lot_size || null,
    data.subscriptionStatus || data.subscription_status || null,
    data.amount || null,
    data.recordDate || data.record_date || null,
    data.yieldPercent || data.yield_percent || null,
    data.description || null,
    data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
    data.isCustom !== undefined ? (data.isCustom ? 1 : 0) : 1,
    data.sourceUrl || data.source_url || null,
  ];

  await pool.query(sql, params);
  return getCalendarEventById(id);
}

/**
 * Update an existing calendar event.
 */
export async function updateCalendarEvent(id, data) {
  await ensureCalendarTableExists();

  const updates = [];
  const params = [];

  const fieldMap = {
    event_type: data.type || data.event_type,
    category: data.category,
    title: data.title,
    country: data.country ? data.country.toUpperCase() : undefined,
    country_name: data.countryName || data.country_name,
    flag: data.flag,
    authority: data.authority,
    event_date: data.date || data.event_date,
    event_time: data.time || data.event_time,
    impact: data.impact,
    forecast: data.forecast,
    previous: data.previous,
    actual: data.actual,
    unit: data.unit,
    session_status: data.sessionStatus || data.session_status,
    symbol: data.symbol,
    quarter: data.quarter,
    estimate_eps: data.estimateEps || data.estimate_eps,
    estimate_revenue: data.estimateRevenue || data.estimate_revenue,
    issue_size: data.issueSize || data.issue_size,
    price_band: data.priceBand || data.price_band,
    lot_size: data.lotSize || data.lot_size,
    subscription_status: data.subscriptionStatus || data.subscription_status,
    amount: data.amount,
    record_date: data.recordDate || data.record_date,
    yield_percent: data.yieldPercent || data.yield_percent,
    description: data.description,
    is_active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : undefined,
    is_custom: 1, // Any manual edit marks as custom
    source_url: data.sourceUrl || data.source_url,
  };

  if (data.exchanges !== undefined) {
    fieldMap.exchanges = Array.isArray(data.exchanges)
      ? JSON.stringify(data.exchanges)
      : data.exchanges;
  }

  for (const [col, val] of Object.entries(fieldMap)) {
    if (val !== undefined) {
      updates.push(`${col} = ?`);
      params.push(val);
    }
  }

  if (updates.length === 0) return getCalendarEventById(id);

  params.push(id);
  const sql = `UPDATE calendar_events SET ${updates.join(', ')} WHERE id = ?`;
  await pool.query(sql, params);

  return getCalendarEventById(id);
}

/**
 * Delete a calendar event.
 */
export async function deleteCalendarEvent(id) {
  await ensureCalendarTableExists();
  const [result] = await pool.query('DELETE FROM calendar_events WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

/**
 * Toggle the active/inactive status of a calendar event.
 */
export async function toggleCalendarEventActive(id) {
  await ensureCalendarTableExists();
  const [result] = await pool.query(
    'UPDATE calendar_events SET is_active = NOT is_active WHERE id = ?',
    [id],
  );
  if (result.affectedRows === 0) return null;
  return getCalendarEventById(id);
}

/**
 * Bulk upserts calendar events into MySQL.
 * Useful for automated syncing and seeding.
 * Preserves `is_custom = 1` events so admin customizations are not overwritten.
 */
export async function upsertCalendarEvents(events = []) {
  if (!events || events.length === 0) return { inserted: 0, updated: 0 };
  await ensureCalendarTableExists();

  let inserted = 0;
  let updated = 0;

  for (const item of events) {
    try {
      const id = item.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const eventType = item.type || item.event_type || 'economy';
      const title = item.title || item.name || (item.company ? `${item.company} Announcement` : 'Market Event');
      const authority = item.authority || (Array.isArray(item.exchanges) ? item.exchanges.join(', ') : (item.company || 'Official Authority'));
      const exchanges = Array.isArray(item.exchanges)
        ? JSON.stringify(item.exchanges)
        : (typeof item.exchanges === 'string' ? item.exchanges : null);

      const sql = `
        INSERT INTO calendar_events (
          id, event_type, category, title, country, country_name, flag,
          authority, event_date, event_time, impact, forecast, previous,
          actual, unit, session_status, exchanges, symbol, quarter,
          estimate_eps, estimate_revenue, issue_size, price_band, lot_size,
          subscription_status, amount, record_date, yield_percent,
          description, is_active, is_custom, source_url, last_synced_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, NOW()
        )
        ON DUPLICATE KEY UPDATE
          event_type = IF(is_custom = 1, event_type, VALUES(event_type)),
          category = IF(is_custom = 1, category, VALUES(category)),
          title = IF(is_custom = 1, title, VALUES(title)),
          country = IF(is_custom = 1, country, VALUES(country)),
          country_name = IF(is_custom = 1, country_name, VALUES(country_name)),
          flag = IF(is_custom = 1, flag, VALUES(flag)),
          authority = IF(is_custom = 1, authority, VALUES(authority)),
          event_date = IF(is_custom = 1, event_date, VALUES(event_date)),
          event_time = IF(is_custom = 1, event_time, VALUES(event_time)),
          impact = IF(is_custom = 1, impact, VALUES(impact)),
          forecast = IF(is_custom = 1, forecast, VALUES(forecast)),
          previous = IF(is_custom = 1, previous, VALUES(previous)),
          actual = COALESCE(VALUES(actual), actual),
          unit = IF(is_custom = 1, unit, VALUES(unit)),
          session_status = IF(is_custom = 1, session_status, VALUES(session_status)),
          exchanges = IF(is_custom = 1, exchanges, VALUES(exchanges)),
          symbol = IF(is_custom = 1, symbol, VALUES(symbol)),
          quarter = IF(is_custom = 1, quarter, VALUES(quarter)),
          estimate_eps = IF(is_custom = 1, estimate_eps, VALUES(estimate_eps)),
          estimate_revenue = IF(is_custom = 1, estimate_revenue, VALUES(estimate_revenue)),
          issue_size = IF(is_custom = 1, issue_size, VALUES(issue_size)),
          price_band = IF(is_custom = 1, price_band, VALUES(price_band)),
          lot_size = IF(is_custom = 1, lot_size, VALUES(lot_size)),
          subscription_status = IF(is_custom = 1, subscription_status, VALUES(subscription_status)),
          amount = IF(is_custom = 1, amount, VALUES(amount)),
          record_date = IF(is_custom = 1, record_date, VALUES(record_date)),
          yield_percent = IF(is_custom = 1, yield_percent, VALUES(yield_percent)),
          description = IF(is_custom = 1, description, VALUES(description)),
          last_synced_at = NOW()
      `;

      const params = [
        id,
        eventType,
        item.category || null,
        title,
        (item.country || 'IN').toUpperCase(),
        item.countryName || item.country_name || null,
        item.flag || null,
        authority,
        item.date || item.event_date,
        item.time || item.event_time || 'All Day',
        item.impact || 'medium',
        item.forecast || null,
        item.previous || null,
        item.actual || null,
        item.unit || null,
        item.sessionStatus || item.session_status || null,
        exchanges,
        item.symbol || null,
        item.quarter || null,
        item.estimateEps || item.estimate_eps || null,
        item.estimateRevenue || item.estimate_revenue || null,
        item.issueSize || item.issue_size || null,
        item.priceBand || item.price_band || null,
        item.lotSize || item.lot_size || null,
        item.subscriptionStatus || item.subscription_status || null,
        item.amount || null,
        item.recordDate || item.record_date || null,
        item.yieldPercent || item.yield_percent || null,
        item.description || null,
        item.isActive !== undefined ? (item.isActive ? 1 : 0) : 1,
        item.isCustom !== undefined ? (item.isCustom ? 1 : 0) : 0,
        item.sourceUrl || item.source_url || null,
      ];

      const [res] = await pool.query(sql, params);
      if (res.affectedRows === 1) inserted++;
      else if (res.affectedRows === 2) updated++;
    } catch (err) {
      console.warn(`[calendar.model.upsertCalendarEvents] Failed on ${item.id}:`, err.message);
    }
  }

  return { inserted, updated };
}

/**
 * Seeds the MySQL database from the curated datasets if empty or on admin request.
 */
export async function seedCuratedCalendarEvents({ force = false } = {}) {
  await ensureCalendarTableExists();

  if (!force) {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM calendar_events');
    if ((rows[0]?.total ?? 0) > 0) {
      return { seeded: false, count: rows[0].total };
    }
  }

  const allToSeed = [
    ...ECONOMIC_EVENTS.map((e) => ({
      ...e,
      type: 'economy',
      title: e.title,
      authority: e.authority,
    })),
    ...MARKET_HOLIDAYS.map((e) => ({
      ...e,
      type: 'holiday',
      title: e.name || e.title,
      authority: Array.isArray(e.exchanges) ? e.exchanges.join(', ') : 'Exchanges',
      sessionStatus: e.sessionStatus,
      time: 'Market Closed',
      impact: e.impact || (e.isFullDayClose ? 'high' : 'medium'),
    })),
    ...COMMODITY_EVENTS.map((e) => ({
      ...e,
      type: 'commodity',
      title: e.title,
      authority: e.authority,
    })),
  ];

  const result = await upsertCalendarEvents(allToSeed);
  console.log(`[calendar.model.seedCuratedCalendarEvents] Seeded ${result.inserted} inserted, ${result.updated} updated.`);
  return { seeded: true, ...result };
}
