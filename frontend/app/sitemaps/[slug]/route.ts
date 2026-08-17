import { getSitemapArticleChunk, getSitemapIndexInfo } from '@/lib/api';
import { buildUrlSetXml, SitemapUrlEntry } from '@/lib/sitemap';
import { allCategorySlugs } from '@/lib/category-routes';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // 10 min cache

interface RouteProps {
  params: { slug: string };
}

export async function GET(_req: Request, { params }: RouteProps) {
  const { slug } = params;

  try {
    // ─── 1. Static Pages Sitemap (/sitemaps/pages.xml) ────────────────────────
    if (slug === 'pages.xml') {
      const staticPages: SitemapUrlEntry[] = [
        { loc: absoluteUrl('/'), changefreq: 'hourly', priority: 1.0 },
        { loc: absoluteUrl('/news'), changefreq: 'hourly', priority: 0.9 },
        { loc: absoluteUrl('/trending-india'), changefreq: 'hourly', priority: 0.8 },
        { loc: absoluteUrl('/about'), changefreq: 'monthly', priority: 0.5 },
        { loc: absoluteUrl('/contact'), changefreq: 'monthly', priority: 0.5 },
        { loc: absoluteUrl('/editorial'), changefreq: 'monthly', priority: 0.5 },
        { loc: absoluteUrl('/privacy'), changefreq: 'yearly', priority: 0.3 },
        { loc: absoluteUrl('/terms'), changefreq: 'yearly', priority: 0.3 },
        { loc: absoluteUrl('/cookies'), changefreq: 'yearly', priority: 0.3 },
        { loc: absoluteUrl('/feed.xml'), changefreq: 'hourly', priority: 0.4 },
      ];

      const xml = buildUrlSetXml(staticPages);
      return new Response(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
        },
      });
    }

    // ─── 2. Categories Sitemap (/sitemaps/categories.xml) ─────────────────────
    if (slug === 'categories.xml') {
      const categorySlugs = allCategorySlugs();
      const categoryUrls: SitemapUrlEntry[] = categorySlugs.map((cat) => ({
        loc: absoluteUrl(`/news/${cat}`),
        changefreq: 'hourly',
        priority: 0.85,
      }));

      const xml = buildUrlSetXml(categoryUrls);
      return new Response(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=43200',
        },
      });
    }

    // ─── 3. Article Chunks Sitemap (/sitemaps/articles-[chunk].xml) ───────────
    const match = slug.match(/^articles-(\d+)\.xml$/i);
    if (match) {
      const chunk = parseInt(match[1], 10);
      if (isNaN(chunk) || chunk < 1) {
        return new Response('Invalid sitemap chunk', { status: 404 });
      }

      // Check total chunks to avoid generating ghost sitemaps
      try {
        const info = await getSitemapIndexInfo();
        if (info.totalChunks && chunk > info.totalChunks) {
          return new Response('Sitemap chunk not found', { status: 404 });
        }
      } catch (e) {
        console.warn('[PolicyDrift] Sitemap index check failed, proceeding with chunk fetch:', e);
      }

      const chunkData = await getSitemapArticleChunk(chunk, 50000);
      if (!chunkData || !chunkData.articles || chunkData.articles.length === 0) {
        if (chunk > 1) {
          return new Response('Sitemap chunk empty', { status: 404 });
        }
      }

      const articleUrls: SitemapUrlEntry[] = (chunkData.articles || []).map((art) => ({
        loc: absoluteUrl(`/news/${art.slug}`),
        lastmod: art.lastmod,
        changefreq: 'daily',
        priority: 0.7,
      }));

      const xml = buildUrlSetXml(articleUrls);
      return new Response(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=600, s-maxage=1200, stale-while-revalidate=7200',
        },
      });
    }

    // Unrecognized sitemap name
    return new Response('Sitemap not found', { status: 404 });
  } catch (error) {
    console.error(`[PolicyDrift] Error generating sitemap for slug ${slug}:`, error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
