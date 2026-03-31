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
