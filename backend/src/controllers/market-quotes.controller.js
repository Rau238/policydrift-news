import { getMarketQuotesPayload } from '../services/market-quotes.service.js';

export async function getMarketQuotes(_req, res, next) {
  try {
    const data = await getMarketQuotesPayload();
    res.set('Cache-Control', 'public, max-age=20, stale-while-revalidate=40');
    res.json(data);
  } catch (e) {
    next(e);
  }
}
