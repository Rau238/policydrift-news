export type PostListItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  view_count: number;
  published_at: string;
  created_at: string;
};

export type PostDetail = PostListItem & {
  body: string;
  original_url: string;
  source_feed: string | null;
  updated_at: string;
};

export type CategoryRow = { category: string; count: number };

export type GoogleTrendsTopic = {
  category: string;
  query: string;
  label: string | null;
  valueScore: number | null;
  source: string;
  exploreUrl: string;
  matches: PostListItem[];
  timeframe?: '24h' | '7d' | '30d';
  /** From Google headlines/snippets when available; else short explanation of the metric (Breakout / Rising / Top). */
  whyTrending?: string | null;
  /** e.g. search volume band from Daily Trends when provided */
  trafficNote?: string | null;
};

export type GoogleTrendsBundle = {
  enabled: boolean;
  geo: string;
  fetchedAt: string | null;
  /** Last ~24 hours: Daily + Realtime trends (India-wide). */
  topics24h: GoogleTrendsTopic[];
  /** Related queries vs desk seeds, 7-day window. */
  topics7d: GoogleTrendsTopic[];
  /** Related queries vs desk seeds, 30-day window. */
  topics30d: GoogleTrendsTopic[];
  /** @deprecated Same as topics30d for older clients. */
  topics: GoogleTrendsTopic[];
  disclaimer: string;
  /** True when all windows are empty (run `npm run trends`). */
  cacheEmpty?: boolean;
  hint?: string;
  setupRequired?: boolean;
};

export type MarketQuoteRow = {
  ok: boolean;
  id: string;
  label: string;
  group: string;
  /** Region / bucket for UI grouping (e.g. us, india, japan). */
  sectionId: string;
  /** Full country or venue name shown on the card. */
  country: string;
  symbol: string;
  shortName: string;
  currency: string | null;
  price: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  asOf: string | null;
  timezone: string | null;
  error?: string;
};

export type MarketQuotesResponse = {
  quotes: MarketQuoteRow[];
  fetchedAt: string;
};
