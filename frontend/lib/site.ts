export const siteName = 'NewsFree365';
export const siteDescription =
  'NewsFree365 is a calm newsroom for law, governance, and world events: plain-language briefs, clear attribution, and steady updates so you can scan what matters.';

export const PRODUCTION_SITE_URL = 'https://www.newsfree365.live';

/**
 * Canonical public origin for absolute URLs (OG, JSON-LD, metadata).
 * Prefer NEXT_PUBLIC_SITE_URL; on Vercel builds without it, use VERCEL_URL (HTTPS), never localhost on prod deploys.
 */
export function publicSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  return 'http://localhost:3050';
}

export function absoluteUrl(path: string): string {
  const base = publicSiteOrigin();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Guaranteed live production URL for social media copy, sharing, and external distribution.
 * Always returns https://www.newsfree365.live (never localhost).
 */
export function productionShareUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit && !explicit.includes('localhost') && !explicit.includes('127.0.0.1')) {
    return `${explicit.replace(/\/$/, '')}${p}`;
  }
  return `${PRODUCTION_SITE_URL}${p}`;
}
