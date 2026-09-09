import { NextRequest } from 'next/server';
import { getPosts } from '@/lib/api';
import { absoluteUrl, siteDescription, siteName } from '@/lib/site';
import { CATEGORY_TO_SLUG, categoryFromSlug, CATEGORY_INTRO, deskSlugFromCategory } from '@/lib/category-routes';
import { categoryLabel } from '@/lib/categories';

export const dynamic = 'force-dynamic';
export const revalidate = 1800;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(
  req: NextRequest,
  { params }: { params: { category: string } }
) {
  const origin = absoluteUrl('/').replace(/\/$/, '');
  const rawParam = (params.category || '').trim();

  // Strip .xml suffix if provided (e.g. "business.xml" -> "business")
  const slugOrName = rawParam.replace(/\.xml$/i, '').trim();

  // Handle master feed requests hitting this dynamic route
  const isMasterFeed =
    slugOrName === 'all' ||
    slugOrName === 'feed' ||
    slugOrName === 'rss' ||
    slugOrName === 'index' ||
    !slugOrName;

  let categoryFilter: string | undefined = undefined;
  let channelTitle = `${siteName} - RSS Feed`;
  let channelDescription = siteDescription;
  let channelLink = origin;
  let selfFeedUrl = `${origin}/feed/${rawParam}`;

  if (!isMasterFeed) {
    // Attempt resolving from slug first (e.g. "stocks-markets" -> "Stocks & Markets")
    const resolvedCat = categoryFromSlug(slugOrName);
    if (resolvedCat) {
      categoryFilter = resolvedCat;
    } else {
      // Check if it directly matches a category key case-insensitively
      const directMatch = Object.keys(CATEGORY_TO_SLUG).find(
        (k) => k.toLowerCase() === slugOrName.toLowerCase()
      );
      if (directMatch) {
        categoryFilter = directMatch;
      } else {
        // Use as-is
        categoryFilter = slugOrName;
      }
    }

    const label = categoryLabel(categoryFilter);
    const deskSlug = deskSlugFromCategory(categoryFilter) || slugOrName;
    channelTitle = `${label} News & Updates | ${siteName}`;
    channelDescription =
      CATEGORY_INTRO[categoryFilter] ||
      `Latest ${label} news, analysis, and breaking headlines from ${siteName}.`;
    channelLink = `${origin}/news/${deskSlug}`;
    selfFeedUrl = `${origin}/feed/${deskSlug}.xml`;
  }

  const { posts } = await getPosts({
    page: 1,
    limit: 60,
    category: categoryFilter,
  });

  const build = new Date().toUTCString();
  const items = posts
    .map((p) => {
      const link = absoluteUrl(`/news/${p.slug}`);
      const pub = p.published_at ? new Date(p.published_at).toUTCString() : build;
      const desc = escapeXml((p.excerpt || p.title).slice(0, 2500));
      const postCat = p.category ? `<category>${escapeXml(p.category)}</category>` : '';
      const author = p.author ? `<dc:creator>${escapeXml(p.author)}</dc:creator>` : '';
      const source = p.source_feed ? `<source url="${escapeXml(origin)}">${escapeXml(p.source_feed)}</source>` : '';

      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pub}</pubDate>
      <description>${desc}</description>
      ${postCat}
      ${author}
      ${source}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
>
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${channelLink}</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${build}</lastBuildDate>
    <atom:link href="${selfFeedUrl}" rel="self" type="application/rss+xml"/>
    ${categoryFilter ? `<category>${escapeXml(categoryFilter)}</category>` : ''}
    <image>
      <url>${origin}/images/brand-logo.svg</url>
      <title>${escapeXml(channelTitle)}</title>
      <link>${channelLink}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
