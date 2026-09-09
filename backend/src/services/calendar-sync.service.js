/**
 * NewsFree365 — Automated Economic Calendar Live Sync Service
 *
 * Automatically fetches real-time macroeconomic indicator releases,
 * market consensus forecasts, previous historic prints, and official actuals
 * as soon as announced by central banks and statistical bureaus.
 */

import { upsertCalendarEvents, ensureCalendarTableExists } from '../models/calendar.model.js';

// Country code to metadata mapping
const COUNTRY_METADATA = {
  IN: { name: 'India', flag: '🇮🇳' },
  US: { name: 'United States', flag: '🇺🇸' },
  EU: { name: 'Eurozone', flag: '🇪🇺' },
  GB: { name: 'United Kingdom', flag: '🇬🇧' },
  JP: { name: 'Japan', flag: '🇯🇵' },
  CN: { name: 'China', flag: '🇨🇳' },
  DE: { name: 'Germany', flag: '🇩🇪' },
  CA: { name: 'Canada', flag: '🇨🇦' },
  AU: { name: 'Australia', flag: '🇦🇺' },
  GLOBAL: { name: 'Global', flag: '🌐' },
};

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Normalizes category based on title or indicator name
 */
function inferCategory(title = '', indicator = '') {
  const t = `${title} ${indicator}`.toLowerCase();
  if (t.includes('cpi') || t.includes('inflation') || t.includes('wpi') || t.includes('ppi') || t.includes('price index')) {
    return 'inflation';
  }
  if (t.includes('rate') || t.includes('fomc') || t.includes('mpc') || t.includes('repo') || t.includes('fed') || t.includes('rbi') || t.includes('ecb') || t.includes('monetary policy')) {
    return 'interest_rate';
  }
  if (t.includes('gdp') || t.includes('iip') || t.includes('growth') || t.includes('industrial production') || t.includes('output')) {
    return 'growth';
  }
  if (t.includes('pmi') || t.includes('ism') || t.includes('manufacturing') || t.includes('services')) {
    return 'pmi';
  }
  if (t.includes('trade') || t.includes('export') || t.includes('import') || t.includes('current account')) {
    return 'trade';
  }
  if (t.includes('payroll') || t.includes('unemployment') || t.includes('job') || t.includes('employment') || t.includes('claim')) {
    return 'employment';
  }
  if (t.includes('crude') || t.includes('oil') || t.includes('eia') || t.includes('energy') || t.includes('natural gas')) {
    return 'energy';
  }
  if (t.includes('reserve') || t.includes('forex') || t.includes('fx')) {
    return 'reserves';
  }
  return 'macro';
}

/**
 * Formats a value with its unit safely.
 */
function formatValueWithUnit(val, unit, scale) {
  if (val === null || val === undefined || val === '') return null;
  const numStr = typeof val === 'number' ? (Number.isInteger(val) ? val.toString() : val.toFixed(2).replace(/\.?0+$/, '')) : String(val);
  const scaleStr = scale ? ` ${scale}` : '';
  const unitStr = unit ? (unit === '%' ? '%' : ` ${unit}`) : '';
  return `${numStr}${scaleStr}${unitStr}`.trim();
}

/**
 * Fetches events from primary TradingView calendar feed.
 */
async function fetchTradingViewEvents(fromDate, toDate) {
  const url = `https://economic-calendar.tradingview.com/events?from=${encodeURIComponent(
    fromDate.toISOString()
  )}&to=${encodeURIComponent(toDate.toISOString())}`;

  const res = await fetch(url, {
    headers: {
      Origin: 'https://www.tradingview.com',
      Referer: 'https://www.tradingview.com/',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      Accept: 'application/json,text/plain,*/*',
    },
  });

  if (!res.ok) {
    throw new Error(`TradingView calendar API returned HTTP ${res.status}`);
  }

  const json = await res.json();
  return Array.isArray(json?.result) ? json.result : [];
}

/**
 * Core synchronization function.
 * Fetches real-time macroeconomic releases, parses Forecast, Previous, and Actual,
 * and upserts them into MySQL.
 *
 * @param {object} [options]
 * @param {Date} [options.from] - Start date (defaults to 7 days in the past to capture recently announced actuals)
 * @param {Date} [options.to] - End date (defaults to 30 days in future)
 * @param {string[]} [options.countries] - Country ISO list (defaults to IN, US, EU, GB, JP, CN)
 * @param {number} [options.minImportance] - -1 (all), 0 (medium+), 1 (high only)
 */
export async function syncLiveEconomicCalendar(options = {}) {
  await ensureCalendarTableExists();

  const now = new Date();
  const from = options.from || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days past
  const to = options.to || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days future
  const targetCountries = options.countries || ['IN', 'US', 'EU', 'GB', 'GLOBAL'];
  const minImportance = options.minImportance !== undefined ? options.minImportance : 0; // Medium & High by default

  console.log(`[CalendarSync] Starting live economic feed sync from ${from.toISOString().split('T')[0]} to ${to.toISOString().split('T')[0]}...`);

  let rawEvents = [];
  try {
    rawEvents = await fetchTradingViewEvents(from, to);
    console.log(`[CalendarSync] Fetched ${rawEvents.length} raw events from live feed`);
  } catch (err) {
    console.warn('[CalendarSync] Live feed fetch failed:', err.message);
    return {
      success: false,
      error: err.message,
      fetched: 0,
      upserted: 0,
      timestamp: new Date().toISOString(),
    };
  }

  if (rawEvents.length === 0) {
    return {
      success: true,
      fetched: 0,
      upserted: 0,
      message: 'No events returned in window',
      timestamp: new Date().toISOString(),
    };
  }

  // Filter & normalize events
  const normalizedEvents = [];
  for (const ev of rawEvents) {
    // 1. Country filter
    const country = (ev.country || '').toUpperCase();
    if (!targetCountries.includes(country)) continue;

    // 2. Filter out non-economic events (holidays, government ceremonies, etc.)
    if (ev.indicator === 'Holidays' || ev.category === 'gov') continue;

    // 3. Importance filter (focus on Medium and High impact macro drivers)
    const importance = typeof ev.importance === 'number' ? ev.importance : 0;
    // Always include India events; for others, require importance >= minImportance
    if (country !== 'IN' && importance < minImportance) continue;

    const eventDate = ev.date ? ev.date.split('T')[0] : null;
    if (!eventDate) continue;

    // Determine time
    let eventTime = 'All Day';
    if (ev.date && ev.date.includes('T')) {
      const timePart = ev.date.split('T')[1].replace('Z', '');
      const [h, m] = timePart.split(':');
      if (h !== undefined && m !== undefined) {
        eventTime = `${h.padStart(2, '0')}:${m.padStart(2, '0')} GMT`;
      }
    }

    const countryMeta = COUNTRY_METADATA[country] || { name: country, flag: '🌐' };
    const impact = importance === 1 ? 'high' : importance === 0 ? 'medium' : 'low';
    const category = inferCategory(ev.title, ev.indicator);

    // Format numbers
    const forecast = formatValueWithUnit(ev.forecast, ev.unit, ev.scale);
    const previous = formatValueWithUnit(ev.previous, ev.unit, ev.scale);
    const actual = formatValueWithUnit(ev.actual, ev.unit, ev.scale);

    const title = ev.indicator && ev.indicator.length > ev.title.length ? ev.indicator : ev.title;
    const titleSlug = slugify(title);
    // Stable deterministic ID for live feed events
    const id = `live-${country.toLowerCase()}-${titleSlug}-${eventDate}`;

    normalizedEvents.push({
      id,
      type: 'economy',
      category,
      title: country === 'IN' ? `India ${title}` : country === 'US' ? `US ${title}` : title,
      country,
      countryName: countryMeta.name,
      flag: countryMeta.flag,
      authority: ev.source || (country === 'IN' ? 'Reserve Bank of India / MoSPI' : 'US Federal Agency'),
      date: eventDate,
      time: eventTime,
      impact,
      forecast,
      previous,
      actual,
      unit: ev.unit || '%',
      description: null,
      isActive: true,
      isCustom: false,
      sourceUrl: ev.source_url || null,
    });
  }

  console.log(`[CalendarSync] Parsed ${normalizedEvents.length} relevant macro indicator events`);

  // Persist to MySQL using existing bulk upsert
  let upsertResult = { inserted: 0, updated: 0 };
  if (normalizedEvents.length > 0) {
    upsertResult = await upsertCalendarEvents(normalizedEvents);
    console.log(
      `[CalendarSync] Successfully synced into MySQL: ${upsertResult.inserted} inserted, ${upsertResult.updated} updated`
    );
  }

  return {
    success: true,
    fetched: rawEvents.length,
    parsed: normalizedEvents.length,
    inserted: upsertResult.inserted,
    updated: upsertResult.updated,
    totalEvents: normalizedEvents.length,
    timestamp: new Date().toISOString(),
  };
}

export const syncLiveCalendarData = syncLiveEconomicCalendar;
