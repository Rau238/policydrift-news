/**
 * NewsFree365 — Calendar Controller
 *
 * Exposes GET /api/calendar endpoint with rich query parameter support.
 */

import { getCalendarEvents } from '../services/calendar.service.js';

export async function getCalendar(req, res) {
  try {
    const { type, country, timeframe, impact, search } = req.query;
    const data = await getCalendarEvents({
      type,
      country,
      timeframe,
      impact,
      search,
    });

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    return res.json(data);
  } catch (err) {
    console.error('[CALENDAR] Controller error:', err);
    return res.status(500).json({ error: 'Failed to retrieve calendar events' });
  }
}
