/**
 * NewsFree365 — Financial & Economic Calendar Service
 *
 * Consolidates macroeconomic announcements, trading holidays, corporate results,
 * IPO listings, corporate actions (dividends/bonus), and commodities agenda.
 * Backed by MySQL database with real-time dynamic countdowns and fallbacks.
 */

import {
  listCalendarEvents,
  seedCuratedCalendarEvents,
} from '../models/calendar.model.js';
import {
  ECONOMIC_EVENTS,
  MARKET_HOLIDAYS,
  CORPORATE_RESULTS,
  IPO_EVENTS,
  DIVIDEND_EVENTS,
  COMMODITY_EVENTS,
} from '../config/calendar-data.js';

/**
 * Calculates day difference from reference date (defaulting to current date).
 */
export function getDaysDifference(targetDateStr, refDate = new Date()) {
  const target = new Date(targetDateStr + 'T00:00:00');
  const today = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Computes human-friendly status and badge relative to current date.
 */
export function computeStatus(daysDiff) {
  if (daysDiff < 0) return { status: 'completed', label: `${Math.abs(daysDiff)}d ago`, isPast: true };
  if (daysDiff === 0) return { status: 'today', label: 'Today', isToday: true };
  if (daysDiff === 1) return { status: 'upcoming', label: 'Tomorrow', isUpcoming: true };
  return { status: 'upcoming', label: `In ${daysDiff} days`, isUpcoming: true };
}

/**
 * In-memory fallback if database query fails or is not yet initialized.
 */
function unifyStaticEvents(refDate = new Date()) {
  const list = [];

  for (const item of ECONOMIC_EVENTS) {
    const daysDiff = getDaysDifference(item.date, refDate);
    const { status, label } = computeStatus(daysDiff);
    list.push({ ...item, type: 'economy', status, daysDiff, countdown: label });
  }
  for (const item of MARKET_HOLIDAYS) {
    const daysDiff = getDaysDifference(item.date, refDate);
    const { status, label } = computeStatus(daysDiff);
    list.push({ ...item, type: 'holiday', status, daysDiff, countdown: label });
  }
  for (const item of (COMMODITY_EVENTS || [])) {
    const daysDiff = getDaysDifference(item.date, refDate);
    const { status, label } = computeStatus(daysDiff);
    list.push({ ...item, type: 'commodity', status, daysDiff, countdown: label });
  }

  return list;
}

/**
 * Retrieves calendar events dynamically from MySQL (with automatic seeder and fallback).
 *
 * @param {object} filters
 * @param {Date} [refDate=new Date()]
 */
export async function getCalendarEvents(filters = {}, refDate = new Date()) {
  try {
    // 1. Ensure table is seeded if empty
    await seedCuratedCalendarEvents();

    // 2. Query all active events from MySQL
    const { events: dbEvents } = await listCalendarEvents({
      includeInactive: false,
      limit: 500,
    });

    let all = dbEvents;
    if (!all || all.length === 0) {
      all = unifyStaticEvents(refDate);
    }

    // Attach dynamic real-time countdown relative to current request time
    all = all.map((e) => {
      const daysDiff = getDaysDifference(e.date, refDate);
      const { status, label } = computeStatus(daysDiff);
      return {
        ...e,
        daysDiff,
        status,
        countdown: label,
      };
    });

    // 3. Filter list
    let filtered = all;

    if (filters.type && filters.type !== 'all') {
      const t = filters.type.toLowerCase();
      const mapped = t === 'holidays' ? 'holiday'
        : t === 'results' ? 'result'
        : t === 'dividends' ? 'dividend'
        : t === 'commodities' ? 'commodity'
        : t;
      filtered = filtered.filter((e) => e.type === mapped);
    }

    if (filters.country && filters.country !== 'all') {
      const c = filters.country.toUpperCase();
      filtered = filtered.filter((e) => e.country === c || e.country === 'GLOBAL');
    }

    if (filters.impact && filters.impact !== 'all') {
      const imp = filters.impact.toLowerCase();
      filtered = filtered.filter((e) => e.impact === imp);
    }

    if (filters.timeframe && filters.timeframe !== 'all') {
      const tf = filters.timeframe.toLowerCase();
      if (tf === 'today') {
        filtered = filtered.filter((e) => e.daysDiff === 0);
      } else if (tf === 'this_week') {
        filtered = filtered.filter((e) => e.daysDiff >= 0 && e.daysDiff <= 7);
      } else if (tf === 'next_week') {
        filtered = filtered.filter((e) => e.daysDiff > 7 && e.daysDiff <= 14);
      } else if (tf === 'this_month') {
        filtered = filtered.filter((e) => e.daysDiff >= 0 && e.daysDiff <= 31);
      } else if (tf === 'upcoming') {
        filtered = filtered.filter((e) => e.daysDiff >= 0);
      }
    }

    if (filters.search && typeof filters.search === 'string') {
      const q = filters.search.trim().toLowerCase();
      if (q) {
        filtered = filtered.filter((e) =>
          (e.title && e.title.toLowerCase().includes(q)) ||
          (e.description && e.description.toLowerCase().includes(q)) ||
          (e.company && e.company.toLowerCase().includes(q)) ||
          (e.symbol && e.symbol.toLowerCase().includes(q)) ||
          (e.authority && e.authority.toLowerCase().includes(q)) ||
          (e.countryName && e.countryName.toLowerCase().includes(q))
        );
      }
    }

    // Sort by date ascending, then impact
    filtered.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      if (cmp !== 0) return cmp;
      const impactOrder = { high: 0, medium: 1, low: 2 };
      return (impactOrder[a.impact] ?? 1) - (impactOrder[b.impact] ?? 1);
    });

    // Compute key upcoming highlights across all events
    const upcomingOnly = all.filter((e) => e.daysDiff >= 0);
    const nextEconomicEvent = upcomingOnly.find((e) => e.type === 'economy' && e.impact === 'high') || upcomingOnly.find((e) => e.type === 'economy') || null;
    const nextMarketHoliday = upcomingOnly.find((e) => e.type === 'holiday') || null;
    const nextCorporateResult = upcomingOnly.find((e) => e.type === 'result') || null;
    const nextIpo = upcomingOnly.find((e) => e.type === 'ipo') || null;
    const nextDividend = upcomingOnly.find((e) => e.type === 'dividend') || null;
    const nextCommodity = upcomingOnly.find((e) => e.type === 'commodity') || null;

    const counts = {
      total: all.length,
      economy: all.filter((e) => e.type === 'economy').length,
      holidays: all.filter((e) => e.type === 'holiday').length,
      results: all.filter((e) => e.type === 'result').length,
      ipo: all.filter((e) => e.type === 'ipo').length,
      dividends: all.filter((e) => e.type === 'dividend').length,
      commodities: all.filter((e) => e.type === 'commodity').length,
      upcomingThisWeek: upcomingOnly.filter((e) => e.daysDiff <= 7).length,
    };

    return {
      events: filtered,
      total: filtered.length,
      summary: {
        nextEconomicEvent,
        nextMarketHoliday,
        nextCorporateResult,
        nextIpo,
        nextDividend,
        nextCommodity,
        counts,
      },
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[calendar.service.getCalendarEvents] Error, using fallback:', err.message);
    const fallbackAll = unifyStaticEvents(refDate);
    return {
      events: fallbackAll,
      total: fallbackAll.length,
      summary: {
        nextEconomicEvent: fallbackAll.find((e) => e.type === 'economy' && e.impact === 'high') || null,
        nextMarketHoliday: fallbackAll.find((e) => e.type === 'holiday') || null,
        nextCorporateResult: fallbackAll.find((e) => e.type === 'result') || null,
        nextIpo: fallbackAll.find((e) => e.type === 'ipo') || null,
        nextDividend: fallbackAll.find((e) => e.type === 'dividend') || null,
        nextCommodity: fallbackAll.find((e) => e.type === 'commodity') || null,
        counts: {
          total: fallbackAll.length,
          economy: fallbackAll.filter((e) => e.type === 'economy').length,
          holidays: fallbackAll.filter((e) => e.type === 'holiday').length,
          results: fallbackAll.filter((e) => e.type === 'result').length,
          ipo: fallbackAll.filter((e) => e.type === 'ipo').length,
          dividends: fallbackAll.filter((e) => e.type === 'dividend').length,
          commodities: fallbackAll.filter((e) => e.type === 'commodity').length,
          upcomingThisWeek: fallbackAll.filter((e) => e.daysDiff >= 0 && e.daysDiff <= 7).length,
        },
      },
      lastUpdated: new Date().toISOString(),
    };
  }
}
