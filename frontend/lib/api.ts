import type { CategoryRow, PostDetail, PostListItem } from './types';

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
  return url.replace(/\/$/, '');
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    next: init?.next ?? { revalidate: 60 },
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
  return safeFetchJson(`/api/posts/trending?limit=${limit}`, []);
}

export async function getCategories(): Promise<CategoryRow[]> {
  return safeFetchJson('/api/posts/categories', []);
}

export async function getSitemapRows(): Promise<{ slug: string; lastmod: string }[]> {
  const res = await fetch(`${getBaseUrl()}/api/meta/slugs`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`${res.status} sitemap`);
  return res.json() as Promise<{ slug: string; lastmod: string }[]>;
}
