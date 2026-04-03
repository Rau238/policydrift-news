import { absoluteUrl } from '@/lib/site';

/** Same-origin path - works in Client Components without `NEXT_PUBLIC_*` / `VERCEL_URL`. */
export const STORY_FALLBACK_PATH = '/images/story-fallback.svg';

/** Default OG/card image when a story has no remote image (server / metadata - absolute URL). */
export function storyFallbackImageUrl(): string {
  return absoluteUrl(STORY_FALLBACK_PATH);
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
 * For Open Graph, Twitter, JSON-LD - must be absolute. Use from Server Components / generateMetadata only.
 */
export function resolveOgImageUrl(stored: string | null | undefined): string {
  const u = stored?.trim();
  if (!u || u === 'null' || u === 'undefined' || isLoopbackOrInvalidStored(u)) {
    return storyFallbackImageUrl();
  }
  return u;
}
