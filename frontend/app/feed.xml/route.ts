import { getPosts } from '@/lib/api';
import { absoluteUrl, siteDescription, siteName } from '@/lib/site';

/** Regenerate RSS on a schedule so Search Console / readers see fresh items without hammering the API. */
export const revalidate = 1800;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const { posts } = await getPosts({ page: 1, limit: 60 });
  const origin = absoluteUrl('/').replace(/\/$/, '');
  const build = new Date().toUTCString();
  const items = posts
    .map((p) => {
      const link = absoluteUrl(`/news/${p.slug}`);
      const pub = p.published_at ? new Date(p.published_at).toUTCString() : build;
      const desc = escapeXml((p.excerpt || p.title).slice(0, 2000));
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pub}</pubDate>
      <description>${desc}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${origin}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en</language>
    <lastBuildDate>${build}</lastBuildDate>
    <atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml"/>
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
