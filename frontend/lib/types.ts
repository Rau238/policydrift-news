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
  /** Desk summary lines (e.g. Banking & Economics); newline-separated plain text. */
  key_takeaways?: string | null;
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
  trafficNote?: string | null;
};

export type GoogleTrendsBundle = {
  enabled: boolean;
  geo: string;
  fetchedAt: string | null;
  topics24h: GoogleTrendsTopic[];
  topics7d: GoogleTrendsTopic[];
  topics30d: GoogleTrendsTopic[];
  topics: GoogleTrendsTopic[];
  disclaimer: string;
  cacheEmpty?: boolean;
  hint?: string;
};

export type MarketQuoteRow = {
  ok: boolean;
  id: string;
  label: string;
  group: string;
  sectionId: string;
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
