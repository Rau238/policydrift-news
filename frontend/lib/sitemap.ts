/**
 * NewsFree365 — Dynamic SEO XML Sitemap Helpers
 * Compliant with sitemaps.org schema and Google Search Console requirements.
 */

export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string | Date;
}

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string | Date;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Escapes characters prohibited in XML element values.
 */
export function escapeXml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Normalizes date to ISO 8601 string (e.g. 2026-08-17T04:22:30.000Z or YYYY-MM-DDTHH:mm:ssZ).
 */
export function formatLastmod(val?: string | Date | null): string {
  if (!val) return new Date().toISOString();
  try {
    const d = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Builds standard XML sitemapindex document.
 */
export function buildSitemapIndexXml(sitemaps: SitemapIndexEntry[]): string {
  const entries = sitemaps
    .map((s) => {
      const loc = escapeXml(s.loc);
      const lastmod = s.lastmod ? `<lastmod>${formatLastmod(s.lastmod)}</lastmod>` : '';
      return `  <sitemap>\n    <loc>${loc}</loc>${lastmod ? `\n    ${lastmod}` : ''}\n  </sitemap>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`.trim();
}

/**
 * Builds standard XML urlset document (max 50,000 URLs).
 */
export function buildUrlSetXml(urls: SitemapUrlEntry[]): string {
  const entries = urls
    .map((u) => {
      const loc = escapeXml(u.loc);
      const lastmod = u.lastmod ? `\n    <lastmod>${formatLastmod(u.lastmod)}</lastmod>` : '';
      const changefreq = u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : '';
      const priority =
        typeof u.priority === 'number'
          ? `\n    <priority>${u.priority.toFixed(2)}</priority>`
          : '';
      return `  <url>\n    <loc>${loc}</loc>${lastmod}${changefreq}${priority}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`.trim();
}
