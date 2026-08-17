import type { CategoryRow, GoogleTrendsBundle, NewsSource, PostDetail, PostListItem } from './types';

/**
 * Base URL for API fetches.
 * SSR (production): must use API_INTERNAL_URL → local Express (e.g. http://127.0.0.1:4000).
 * Never call the public https://www… domain from the same server — hairpin/DNS often fails
 * and safeFetchJson then returns empty news.
 * Browser: NEXT_PUBLIC_API_URL (public origin or same host with reverse proxy).
 */
function getBaseUrl(): string {
  const isServer = typeof window === 'undefined';
  const url = (
    isServer
      ? process.env.API_INTERNAL_URL ||
        process.env.API_URL ||
        process.env.INTERNAL_API_URL ||
        process.env.NEXT_PUBLIC_API_URL
      : process.env.NEXT_PUBLIC_API_URL
  )?.trim();
  const fallbackPort = process.env.API_PORT?.trim() || '4000';
  return (url || `http://127.0.0.1:${fallbackPort}`).replace(/\/$/, '');
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  /** Mixing `next.revalidate` with `cache: 'no-store'` can still cache in App Router; omit `next` when bypassing cache. */
  const skipNextCache = init?.cache === 'no-store' || init?.cache === 'no-cache';
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    ...(skipNextCache ? {} : { next: init?.next ?? { revalidate: 60 } }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${path}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function safeFetchJson<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    return await fetchJson<T>(path, init);
  } catch (e) {
    console.error(`[PolicyDrift] API fetch failed (${getBaseUrl()}${path}):`, e instanceof Error ? e.message : e);
    return fallback;
  }
}

export async function getPosts(params: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<{ posts: PostListItem[]; total: number; page: number; limit: number }> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const sp = new URLSearchParams();
  sp.set('page', String(page));
  sp.set('limit', String(limit));
  if (params.category && params.category !== 'all') sp.set('category', params.category);
  const q = sp.toString();
  return safeFetchJson(`/api/posts?${q}`, { posts: [], total: 0, page, limit });
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 120 },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`[PolicyDrift] getPostBySlug ${res.status} via ${getBaseUrl()}`);
      return null;
    }
    return res.json() as Promise<PostDetail>;
  } catch (e) {
    console.error(`[PolicyDrift] getPostBySlug failed via ${getBaseUrl()}:`, e instanceof Error ? e.message : e);
    return null;
  }
}

export async function getTrending(limit = 6): Promise<PostListItem[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/posts/trending?limit=${limit}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error(`[PolicyDrift] getTrending ${res.status} via ${getBaseUrl()}`);
      return [];
    }
    return res.json() as Promise<PostListItem[]>;
  } catch (e) {
    console.error(`[PolicyDrift] getTrending failed via ${getBaseUrl()}:`, e instanceof Error ? e.message : e);
    return [];
  }
}

export async function getCategories(): Promise<CategoryRow[]> {
  return safeFetchJson('/api/posts/categories', []);
}

// ─── v2 public news feeds ─────────────────────────────────────────────────────

export async function getLatestNews(params: {
  page?: number;
  limit?: number;
  category?: string;
  source?: number;
}): Promise<{ posts: PostListItem[]; total: number; page: number; limit: number }> {
  const sp = new URLSearchParams();
  sp.set('page',  String(params.page  ?? 1));
  sp.set('limit', String(params.limit ?? 20));
  if (params.category) sp.set('category', params.category);
  if (params.source)   sp.set('source',   String(params.source));
  return safeFetchJson(`/api/news/latest?${sp}`, { posts: [], total: 0, page: 1, limit: 20 });
}

export async function getTopNews(params: { limit?: number; days?: number } = {}): Promise<PostListItem[]> {
  const sp = new URLSearchParams();
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.days)  sp.set('days',  String(params.days));
  return safeFetchJson(`/api/news/top?${sp}`, [], { next: { revalidate: 60 } });
}

export async function getTrendingNews(params: { limit?: number; days?: number } = {}): Promise<PostListItem[]> {
  const sp = new URLSearchParams();
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.days)  sp.set('days',  String(params.days));
  try {
    const res = await fetch(`${getBaseUrl()}/api/news/trending?${sp}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json() as Promise<PostListItem[]>;
  } catch { return []; }
}

export async function getPopularNews(params: {
  limit?: number;
  period?: 'day' | 'week' | 'month';
} = {}): Promise<PostListItem[]> {
  const sp = new URLSearchParams();
  if (params.limit)  sp.set('limit',  String(params.limit));
  if (params.period) sp.set('period', params.period);
  return safeFetchJson(`/api/news/popular?${sp}`, [], { next: { revalidate: 300 } });
}

// ─── v2 admin API (proxied through Next.js route handler) ─────────────────────

function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return fetchJson<T>(`/api/admin${path}`, init);
}

export async function adminGetSources(): Promise<NewsSource[]> {
  return adminFetch<NewsSource[]>('/sources');
}

export async function adminCreateSource(data: Partial<NewsSource>): Promise<{ ok: boolean; id: number }> {
  return adminFetch('/sources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function adminUpdateSource(id: number, data: Partial<NewsSource>): Promise<{ ok: boolean }> {
  return adminFetch(`/sources/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function adminDeleteSource(id: number): Promise<{ ok: boolean }> {
  return adminFetch(`/sources/${id}`, { method: 'DELETE' });
}

export async function adminTestSource(id: number): Promise<{ ok: boolean; itemCount?: number }> {
  return adminFetch(`/sources/${id}/test`, { method: 'POST' });
}

export async function adminGetArticles(params: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
} = {}): Promise<{ posts: PostListItem[]; total: number; page: number; limit: number }> {
  const sp = new URLSearchParams();
  if (params.page)     sp.set('page',     String(params.page));
  if (params.limit)    sp.set('limit',    String(params.limit ?? 20));
  if (params.status)   sp.set('status',   params.status);
  if (params.category) sp.set('category', params.category);
  return adminFetch(`/articles?${sp}`);
}

export async function adminArticleAction(
  id: number,
  action: 'publish' | 'unpublish' | 'feature' | 'unfeature' | 'breaking' | 'unbreaking',
  body?: Record<string, unknown>,
): Promise<{ ok: boolean }> {
  return adminFetch(`/articles/${id}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function adminTriggerIngest(): Promise<{ created: number; skipped: number; errors: string[] }> {
  return adminFetch('/ingest', { method: 'POST' });
}

export interface SitemapIndexInfo {
  totalArticles: number;
  chunkSize: number;
  totalChunks: number;
  latestLastMod: string;
}

export interface SitemapChunkResult {
  chunk: number;
  limit: number;
  count: number;
  articles: { id: number; slug: string; lastmod: string }[];
}

export async function getSitemapIndexInfo(): Promise<SitemapIndexInfo> {
  const res = await fetch(`${getBaseUrl()}/api/meta/sitemap/index`, {
    next: { revalidate: 300 }, // 5 min revalidation
  });
  if (!res.ok) throw new Error(`${res.status} sitemap index`);
  return res.json() as Promise<SitemapIndexInfo>;
}

export async function getSitemapArticleChunk(
  chunk: number = 1,
  limit: number = 50000,
): Promise<SitemapChunkResult> {
  const res = await fetch(`${getBaseUrl()}/api/meta/sitemap/articles?chunk=${chunk}&limit=${limit}`, {
    next: { revalidate: 600 }, // 10 min revalidation
  });
  if (!res.ok) throw new Error(`${res.status} sitemap chunk ${chunk}`);
  return res.json() as Promise<SitemapChunkResult>;
}

export async function getSitemapRows(): Promise<{ slug: string; lastmod: string }[]> {
  const res = await fetch(`${getBaseUrl()}/api/meta/slugs`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`${res.status} sitemap`);
  return res.json() as Promise<{ slug: string; lastmod: string }[]>;
}

const emptyTrends: GoogleTrendsBundle = {
  enabled: false,
  geo: 'IN',
  fetchedAt: null,
  topics24h: [],
  topics7d: [],
  topics30d: [],
  topics: [],
  disclaimer: '',
  cacheEmpty: true,
};

/** Older APIs returned only `topics` (30d). Merge into the new shape. */
function normalizeTrendsBundle(b: GoogleTrendsBundle): GoogleTrendsBundle {
  const t30 = b.topics30d?.length ? b.topics30d : (b.topics ?? []);
  return {
    ...b,
    topics24h: Array.isArray(b.topics24h) ? b.topics24h : [],
    topics7d: Array.isArray(b.topics7d) ? b.topics7d : [],
    topics30d: t30,
    topics: t30,
  };
}

export type GoogleTrendsBundleParams =
  | number
  | { limit24h?: number; limit7d?: number; limit30d?: number };

function trendsQueryString(opts?: GoogleTrendsBundleParams): string {
  if (opts == null) return '';
  if (typeof opts === 'number') return `?limit=${opts}`;
  const sp = new URLSearchParams();
  if (opts.limit24h != null) sp.set('limit24h', String(opts.limit24h));
  if (opts.limit7d != null) sp.set('limit7d', String(opts.limit7d));
  if (opts.limit30d != null) sp.set('limit30d', String(opts.limit30d));
  const q = sp.toString();
  return q ? `?${q}` : '';
}

/** Google Trends bundle, always fresh (no Next fetch cache). */
export async function getGoogleTrendsBundle(opts?: GoogleTrendsBundleParams): Promise<GoogleTrendsBundle> {
  try {
    const path = `/api/meta/trends${trendsQueryString(opts)}`;
    const raw = await fetchJson<GoogleTrendsBundle>(path, {
      cache: 'no-store',
    });
    return normalizeTrendsBundle(raw);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[PolicyDrift] getGoogleTrendsBundle failed. Check API is running and API_URL / NEXT_PUBLIC_API_URL:',
        getBaseUrl(),
        e,
      );
    }
    return emptyTrends;
  }
}
