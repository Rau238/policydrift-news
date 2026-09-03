import { getPosts, getSitemapArticleChunk } from '@/lib/api';
import { buildGoogleNewsSitemapXml, GoogleNewsSitemapEntry } from '@/lib/sitemap';
import { absoluteUrl, siteName } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minute cache for Google News

export async function GET() {
  try {
    // Fetch latest articles
    let posts: { slug: string; title: string; published_at?: string; lastmod?: string }[] = [];
    try {
      const res = await getPosts({ page: 1, limit: 50 });
      if (res?.posts?.length) {
        posts = res.posts;
      }
    } catch {
      // Fallback to sitemap chunk
      const chunk = await getSitemapArticleChunk(1, 50).catch(() => null);
      if (chunk?.articles?.length) {
        posts = chunk.articles.map((a) => ({
          slug: a.slug,
          title: a.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          published_at: a.lastmod,
        }));
      }
    }

    const cutoffTime = Date.now() - 48 * 60 * 60 * 1000; // 48 hours ago

    // Filter to articles in the last 48 hours (or latest 50 fallback)
    let recentPosts = posts.filter((p) => {
      const dateStr = p.published_at || p.lastmod;
      const pubDate = dateStr ? new Date(dateStr).getTime() : 0;
      return pubDate >= cutoffTime;
    });

    if (recentPosts.length === 0 && posts.length > 0) {
      recentPosts = posts.slice(0, 50);
    }

    const newsEntries: GoogleNewsSitemapEntry[] = recentPosts.map((post) => ({
      loc: absoluteUrl(`/news/${post.slug}`),
      publicationName: siteName,
      publicationLanguage: 'en',
      publicationDate: post.published_at || post.lastmod || new Date().toISOString(),
      title: post.title,
    }));

    const xml = buildGoogleNewsSitemapXml(newsEntries);

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('[NewsFree365] Error generating Google News sitemap:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
