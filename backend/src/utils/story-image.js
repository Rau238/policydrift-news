import { env } from '../config/env.js';

/**
 * Absolute URL for stories with no RSS image. Uses STORY_FALLBACK_IMAGE_URL, or
 * SITE_PUBLIC_URL + /images/story-fallback.svg when the frontend hosts that asset.
 */
function configuredFallbackUrl() {
  const direct = env.STORY_FALLBACK_IMAGE_URL?.trim();
  if (direct) return direct;
  const base = env.SITE_PUBLIC_URL?.trim()?.replace(/\/$/, '');
  if (base) return `${base}/images/story-fallback.svg`;
  return null;
}

/** @param {string | null | undefined} stored */
export function resolveStoryImageUrl(stored) {
  const u = stored && String(stored).trim();
  if (u) return u;
  return configuredFallbackUrl();
}

/** @param {Record<string, unknown> | null | undefined} row */
export function withStoryImageFallback(row) {
  if (!row || typeof row !== 'object') return row;
  return { ...row, image_url: resolveStoryImageUrl(row.image_url) };
}
