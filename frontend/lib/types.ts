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
  // v2 fields (optional — may be absent from legacy /api/posts responses)
  is_featured?: number;
  is_breaking?: number;
  like_count?: number;
  share_count?: number;
  reading_time_minutes?: number;
  source_id?: number | null;
  // ranking scores (from /api/news/top|trending|popular)
  top_score?: number;
  trending_score?: number;
  velocity_score?: number;
  views_1h?: number;
  period_views?: number;
};

export type PostDetail = PostListItem & {
  body: string;
  /** Desk summary lines (e.g. Banking & Economics); newline-separated plain text. */
  key_takeaways?: string | null;
  original_url: string;
  source_feed: string | null;
  updated_at: string;
  // v2 editorial fields
  author?: string | null;
  tags?: string | null;
  editorial_priority?: 'normal' | 'high' | 'pinned';
  breaking_until?: string | null;
  featured_until?: string | null;
  scheduled_at?: string | null;
};

export type CategoryRow = { category: string; count: number };

// ─── Google Trends ────────────────────────────────────────────────────────────

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

// ─── Market quotes ────────────────────────────────────────────────────────────

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

// ─── News Source (admin) ──────────────────────────────────────────────────────

export type NewsSource = {
  id: number;
  name: string;
  website: string | null;
  rss_url: string | null;
  api_url: string | null;
  logo: string | null;
  description: string | null;
  country: string;
  language: string;
  category: string;
  trust_score: number;
  enabled: number;
  fetch_interval_minutes: number;
  last_fetched_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  articles_imported: number;
  created_at: string;
  updated_at: string;
};
