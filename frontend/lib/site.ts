export const siteName = 'PolicyDrift';
export const siteDescription =
  'PolicyDrift is a calm newsroom for law, governance, and world events—plain-language briefs, clear attribution, and steady updates so you can scan what matters.';

export function absoluteUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
