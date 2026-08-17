import { absoluteUrl } from '@/lib/site';

/** Same-origin path - works in Client Components without `NEXT_PUBLIC_*` / `VERCEL_URL`. */
export const STORY_FALLBACK_PATH = '/images/story-fallback.svg';

/** Default dynamic OG card image URL (server / metadata - 1200x630 PNG). */
export function dynamicOgImageUrl(params?: {
  title?: string;
  category?: string;
  date?: string;
}): string {
  const sp = new URLSearchParams();
  if (params?.title) sp.set('title', params.title);
  if (params?.category) sp.set('category', params.category);
  if (params?.date) sp.set('date', params.date);
  const q = sp.toString();
  return absoluteUrl(`/api/og${q ? `?${q}` : ''}`);
}

/** Default OG/card image when a story has no remote image (server / metadata - absolute URL). */
export function storyFallbackImageUrl(params?: { title?: string; category?: string; date?: string }): string {
  return dynamicOgImageUrl(params);
}

function isLoopbackOrInvalidStored(url: string): boolean {
  const u = url.trim();
  if (!u || u === 'null' || u === 'undefined') return true;
  try {
    const { hostname } = new URL(u);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';
  } catch {
    return false;
  }
}

/**
 * For `<img src>` (Server or Client). Uses a root-relative fallback so production never requests localhost.
 */
export function resolvePostImageUrl(stored: string | null | undefined): string {
  const u = stored?.trim();
  if (!u || u === 'null' || u === 'undefined' || isLoopbackOrInvalidStored(u)) {
    return STORY_FALLBACK_PATH;
  }
  return u;
}

/**
 * For Open Graph, Twitter, JSON-LD - must be absolute 1200x630 image.
 * Uses remote image if present; falls back to dynamic 1200x630 brand card.
 */
export function resolveOgImageUrl(
  stored: string | null | undefined,
  meta?: { title?: string; category?: string; date?: string },
): string {
  const u = stored?.trim();
  if (!u || u === 'null' || u === 'undefined' || isLoopbackOrInvalidStored(u)) {
    return dynamicOgImageUrl(meta);
  }
  // If stored is relative path
  if (!u.startsWith('http://') && !u.startsWith('https://')) {
    return absoluteUrl(u.startsWith('/') ? u : `/${u}`);
  }
  return u;
}
