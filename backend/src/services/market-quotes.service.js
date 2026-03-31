import { MARKET_QUOTE_ROWS } from '../config/market-symbols.js';

const TTL_MS = 45_000;

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PolicyDrift/1.0';

let cache = { at: 0, payload: null };

/** @param {string} symbol */
async function fetchYahooChartMeta(symbol) {
  const enc = encodeURIComponent(symbol);
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${enc}?interval=1d&range=2d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const j = await res.json();
  const cerr = j.chart?.error;
  if (cerr) {
    throw new Error(cerr.description || 'Chart error');
  }
  const r = j.chart?.result?.[0];
  if (!r?.meta) {
    throw new Error('No chart meta');
  }
  return r.meta;
}

/**
 * @param {Record<string, unknown>} meta
 * @param {{ id: string, symbol: string, label: string, group: string, sectionId: string, country: string }} row
 */
function normalizeQuote(meta, row) {
  const price =
    typeof meta.regularMarketPrice === 'number' ? meta.regularMarketPrice : null;
  const prevRaw = meta.chartPreviousClose ?? meta.previousClose;
  const previousClose = typeof prevRaw === 'number' ? prevRaw : null;
  const change =
    price != null && previousClose != null ? price - previousClose : null;
  const changePercent =
    change != null && previousClose != null && previousClose !== 0
      ? (change / previousClose) * 100
      : null;
  const t = meta.regularMarketTime;
  const asOf = typeof t === 'number' ? new Date(t * 1000).toISOString() : null;

  return {
    id: row.id,
    label: row.label,
    group: row.group,
    sectionId: row.sectionId,
    country: row.country,
    symbol: String(meta.symbol || row.symbol),
    shortName: String(meta.shortName || meta.longName || row.label),
    currency: meta.currency != null ? String(meta.currency) : null,
    price,
    previousClose,
    change,
    changePercent,
    asOf,
    timezone: meta.exchangeTimezoneName != null ? String(meta.exchangeTimezoneName) : null,
  };
}

export async function getMarketQuotesPayload() {
  const now = Date.now();
  if (cache.payload && now - cache.at < TTL_MS) {
    return cache.payload;
  }

  const settled = await Promise.allSettled(
    MARKET_QUOTE_ROWS.map(async (row) => {
      const meta = await fetchYahooChartMeta(row.symbol);
      return normalizeQuote(meta, row);
    }),
  );

  const quotes = MARKET_QUOTE_ROWS.map((row, i) => {
    const r = settled[i];
    if (r.status === 'fulfilled') {
      return { ok: true, ...r.value };
    }
    const msg = r.reason?.message || String(r.reason);
    console.error(`[market-quotes] ${row.symbol}:`, r.reason);
    return {
      ok: false,
      id: row.id,
      label: row.label,
      group: row.group,
      sectionId: row.sectionId,
      country: row.country,
      symbol: row.symbol,
      error: msg,
      shortName: row.label,
      currency: null,
      price: null,
      previousClose: null,
      change: null,
      changePercent: null,
      asOf: null,
      timezone: null,
    };
  });

  const payload = {
    quotes,
    fetchedAt: new Date().toISOString(),
  };

  cache = { at: now, payload };
  return payload;
}
