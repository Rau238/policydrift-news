export const siteName = 'PolicyDrift';
export const siteDescription =
  'PolicyDrift is a calm newsroom for law, governance, and world events: plain-language briefs, clear attribution, and steady updates so you can scan what matters.';

/**
 * Canonical public origin for absolute URLs (OG, JSON-LD, metadata).
 * Prefer NEXT_PUBLIC_SITE_URL; on Vercel builds without it, use VERCEL_URL (HTTPS) — never localhost on prod deploys.
 */
export function publicSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  return 'http://localhost:3000';
}

export function absoluteUrl(path: string): string {
  const base = publicSiteOrigin();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
