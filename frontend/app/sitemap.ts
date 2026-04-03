import type { MetadataRoute } from 'next';
import { getSitemapRows } from '@/lib/api';
import { allCategorySlugs } from '@/lib/category-routes';
import { absoluteUrl } from '@/lib/site';

/** Hourly regeneration — aligns crawlers with fresh RSS-ingested URLs (2025–2026 crawl expectations). */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categoryRoutes: MetadataRoute.Sitemap = allCategorySlugs().map((slug) => ({
    url: absoluteUrl(`/news/${slug}`),
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.85,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: absoluteUrl('/news'), lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: absoluteUrl('/trending-india'), lastModified: new Date(), changeFrequency: 'hourly', priority: 0.75 },
    ...categoryRoutes,
    { url: absoluteUrl('/privacy'), lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/terms'), lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/cookies'), lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/about'), lastModified: new Date(), changeFrequency: 'yearly', priority: 0.45 },
    { url: absoluteUrl('/contact'), lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: absoluteUrl('/editorial'), lastModified: new Date(), changeFrequency: 'yearly', priority: 0.35 },
    { url: absoluteUrl('/feed.xml'), lastModified: new Date(), changeFrequency: 'hourly', priority: 0.35 },
  ];

  try {
    const rows = await getSitemapRows();
    const posts: MetadataRoute.Sitemap = rows.map((r) => ({
      url: absoluteUrl(`/news/${r.slug}`),
      lastModified: r.lastmod ? new Date(r.lastmod) : new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    }));
    return [...staticRoutes, ...posts];
  } catch {
    return staticRoutes;
  }
}
