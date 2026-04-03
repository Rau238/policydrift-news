import type { CategoryRow, GoogleTrendsBundle, PostDetail, PostListItem } from './types';

/**
 * Base URL for server-side fetches (SSR). Prefer API_URL on the server so Docker / CI can use host.docker.internal, etc.
 * Client components still use NEXT_PUBLIC_API_URL via the same env in the browser bundle.
 */
function getBaseUrl(): string {
  const isServer = typeof window === 'undefined';
  const url = (
    isServer
      ? process.env.API_URL || process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
      : process.env.NEXT_PUBLIC_API_URL
  )?.trim();
  return (url || 'http://127.0.0.1:4000').replace(/\/$/, '');
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
  } catch {
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
    if (!res.ok) return null;
    return res.json() as Promise<PostDetail>;
  } catch {
    return null;
  }
}

export async function getTrending(limit = 6): Promise<PostListItem[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/posts/trending?limit=${limit}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json() as Promise<PostListItem[]>;
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<CategoryRow[]> {
  return safeFetchJson('/api/posts/categories', []);
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
