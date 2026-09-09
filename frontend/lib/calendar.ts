/**
 * NewsFree365 — Calendar Models & API Client
 */

import { getBaseUrl } from './api';

export type CalendarEventType = 'economy' | 'holiday' | 'commodity';
export type CalendarImpact = 'high' | 'medium' | 'low';
export type CalendarStatus = 'completed' | 'today' | 'upcoming';

export type CalendarEventItem = {
  id: string;
  type: CalendarEventType;
  category: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  country: string;
  countryName?: string;
  flag: string;
  authority?: string;
  impact: CalendarImpact;
  status: CalendarStatus;
  daysDiff: number;
  countdown: string;
  description?: string;

  // Economy specific
  forecast?: string;
  previous?: string;
  actual?: string | null;
  unit?: string;

  // Holiday specific
  exchanges?: string[];
  sessionStatus?: string;
  isFullDayClose?: boolean;

  // Corporate results specific
  company?: string;
  symbol?: string;
  exchange?: string;
  quarter?: string;
  sector?: string;
  marketCap?: string;
  estimateEps?: string;
  estimateRevenue?: string;
  previousEps?: string;

  // IPO specific
  issueSize?: string;
  priceBand?: string;
  lotSize?: string;
  subscriptionStatus?: string;

  // Dividend specific
  amount?: string;
  yieldPercent?: string;
  recordDate?: string;

  // Commodity specific
  commodity?: string;
};

export type CalendarSummary = {
  nextEconomicEvent: CalendarEventItem | null;
  nextMarketHoliday: CalendarEventItem | null;
  nextCommodity?: CalendarEventItem | null;
  nextCorporateResult?: CalendarEventItem | null;
  nextIpo?: CalendarEventItem | null;
  nextDividend?: CalendarEventItem | null;
  counts: {
    total: number;
    economy: number;
    holidays: number;
    commodities?: number;
    results?: number;
    ipo?: number;
    dividends?: number;
    upcomingThisWeek: number;
  };
};

export type CalendarResponse = {
  events: CalendarEventItem[];
  total: number;
  summary: CalendarSummary;
  lastUpdated: string;
};

export type CalendarFilters = {
  type?: 'all' | 'economy' | 'holidays' | 'commodities';
  country?: 'all' | 'IN' | 'US';
  timeframe?: 'all' | 'today' | 'this_week' | 'next_week' | 'this_month' | 'upcoming';
  impact?: 'all' | 'high' | 'medium';
  search?: string;
};

export async function fetchCalendarEvents(filters: CalendarFilters = {}): Promise<CalendarResponse> {
  const sp = new URLSearchParams();
  if (filters.type && filters.type !== 'all') sp.set('type', filters.type);
  if (filters.country && filters.country !== 'all') sp.set('country', filters.country);
  if (filters.timeframe && filters.timeframe !== 'all') sp.set('timeframe', filters.timeframe);
  if (filters.impact && filters.impact !== 'all') sp.set('impact', filters.impact);
  if (filters.search) sp.set('search', filters.search);

  const query = sp.toString() ? `?${sp.toString()}` : '';
  const url = `${getBaseUrl()}/api/calendar${query}`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`[Calendar] API returned ${res.status}`);
      return {
        events: [],
        total: 0,
        summary: {
          nextEconomicEvent: null,
          nextMarketHoliday: null,
          nextCorporateResult: null,
          counts: { total: 0, economy: 0, holidays: 0, results: 0, ipo: 0, dividends: 0, commodities: 0, upcomingThisWeek: 0 },
        },
        lastUpdated: new Date().toISOString(),
      };
    }
    return (await res.json()) as CalendarResponse;
  } catch (err) {
    console.error('[Calendar] Fetch error:', err);
    return {
      events: [],
      total: 0,
      summary: {
        nextEconomicEvent: null,
        nextMarketHoliday: null,
        nextCorporateResult: null,
        counts: { total: 0, economy: 0, holidays: 0, results: 0, ipo: 0, dividends: 0, commodities: 0, upcomingThisWeek: 0 },
      },
      lastUpdated: new Date().toISOString(),
    };
  }
}
