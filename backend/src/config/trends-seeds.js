/**
 * Seed keywords per desk for Google Trends `relatedQueries` (geo from env, default IN).
 * Breaking uses daily trends only (no seeds here).
 */
export const TREND_SEEDS_BY_CATEGORY = {
  'Banking & Economics': ['RBI repo rate', 'inflation India', 'GST India', 'SBI', 'bank merger India'],
  'Stocks & Markets': ['Nifty 50', 'Sensex', 'IPO India', 'share market today', 'Reliance share'],
  Crypto: ['Bitcoin price', 'crypto India', 'Ethereum'],
  India: ['Lok Sabha', 'election India', 'Parliament India'],
  Business: ['India GDP', 'rupee vs dollar', 'startup India'],
  'World News': ['UN news', 'China Taiwan', 'Middle East news'],
  Politics: ['Supreme Court India', 'cabinet India'],
  Sports: ['cricket India', 'IPL'],
};
