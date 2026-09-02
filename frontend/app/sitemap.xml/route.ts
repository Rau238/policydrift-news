import { getSitemapIndexInfo } from '@/lib/api';
import { buildSitemapIndexXml, SitemapIndexEntry } from '@/lib/sitemap';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
  try {
    let totalChunks = 1;
    let latestLastMod = new Date().toISOString();

    try {
      const info = await getSitemapIndexInfo();
      totalChunks = Math.max(1, info.totalChunks || 1);
      if (info.latestLastMod) {
        latestLastMod = info.latestLastMod;
      }
    } catch (e) {
      console.error('[NewsFree365] Failed to fetch sitemap index info from backend:', e);
    }

    const sitemaps: SitemapIndexEntry[] = [
      {
        loc: absoluteUrl('/sitemaps/pages.xml'),
        lastmod: latestLastMod,
      },
      {
        loc: absoluteUrl('/sitemaps/categories.xml'),
        lastmod: latestLastMod,
      },
    ];

    for (let i = 1; i <= totalChunks; i++) {
      sitemaps.push({
        loc: absoluteUrl(`/sitemaps/articles-${i}.xml`),
        lastmod: latestLastMod,
      });
    }

    const xml = buildSitemapIndexXml(sitemaps);

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
        'X-Robots-Tag': 'noindex',
      },
    });
  } catch (error) {
    console.error('[NewsFree365] Error generating sitemap index:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
