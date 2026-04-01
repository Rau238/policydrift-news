/**
 * Reserved slugs under `/news/[slug]` for category hubs. Other slugs resolve as article URLs.
 */

export const CATEGORY_TO_SLUG: Record<string, string> = {
  Breaking: 'breaking',
  'World News': 'world-news',
  India: 'india',
  Sports: 'sports',
  Business: 'business',
  'Banking & Economics': 'banking-economics',
  Politics: 'politics',
  'Stocks & Markets': 'stocks-markets',
  Crypto: 'crypto',
  General: 'general',
};

const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_TO_SLUG).map(([k, v]) => [v, k]),
);

/** Category slugs shown in primary nav (exclude General hub). */
export const NAV_CATEGORY_SLUGS = [
  'breaking',
  'world-news',
  'india',
  'sports',
  'business',
  'banking-economics',
  'politics',
  'stocks-markets',
  'crypto',
] as const;

export function deskSlugFromCategory(name: string): string | null {
  return CATEGORY_TO_SLUG[name] ?? null;
}

export function categoryFromSlug(slug: string): string | null {
  return SLUG_TO_CATEGORY[slug] ?? null;
}

/** @deprecated use categoryFromSlug */
export const categoryFromDeskSlug = categoryFromSlug;

/** @deprecated use NAV_CATEGORY_SLUGS */
export function allDeskSlugs(): string[] {
  return [...NAV_CATEGORY_SLUGS];
}

export function allCategorySlugs(): string[] {
  return [...NAV_CATEGORY_SLUGS];
}

/** Primary nav / chips: `/news/breaking` etc., or `?category=` for unmapped API categories. */
export function categoryHref(name: string): string {
  const slug = deskSlugFromCategory(name);
  if (slug) return `/news/${slug}`;
  return `/news?category=${encodeURIComponent(name)}`;
}

export function newsListingHrefForCategory(category: string): string {
  return categoryHref(category);
}

export const CATEGORY_INTRO: Record<string, string> = {
  Breaking: 'Fast headlines and developing stories, refreshed as sources publish.',
  'World News':
    'International coverage: major economies, diplomacy, conflict, and global institutions.',
  India: 'Policy, elections, business, and society from national and regional sources.',
  Sports:
    'Global and US sports headlines (BBC, ESPN, Yahoo, CBS, FOX), plus cricket: match news, analysis, and live scorecards.',
  Business: 'Companies, finance, trade, and the forces shaping markets and work.',
  'Banking & Economics':
    'RBI, banks, NBFCs, credit and rates, plus macro: inflation, growth, and policy from India and global feeds (including Google News).',
  Politics: 'Government, legislation, campaigns, and political developments across regions.',
  'Stocks & Markets':
    'Equities, indices, macro moves, and market structure from our syndicated feeds.',
  Crypto: 'Digital assets, regulation, and on-chain trends worth watching.',
  General: 'Stories that cross beats or sit outside a single topic.',
};

/** @deprecated use CATEGORY_INTRO */
export const DESK_INTRO = CATEGORY_INTRO;
