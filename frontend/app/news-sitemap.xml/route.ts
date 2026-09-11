import { getGoogleNewsSitemapArticles, getPosts } from '@/lib/api';
import { buildGoogleNewsSitemapXml, GoogleNewsSitemapEntry } from '@/lib/sitemap';
import { absoluteUrl, siteName } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minute cache for Google News

export async function GET() {
  try {
    // Fetch latest breaking articles published within last 48h (up to 1,000 for Google News)
    let posts: { slug: string; title: string; published_at?: string; lastmod?: string }[] = [];
    try {
      const data = await getGoogleNewsSitemapArticles();
      if (data?.articles?.length) {
        posts = data.articles;
      }
    } catch {
      // Fallback
      const res = await getPosts({ page: 1, limit: 50 }).catch(() => null);
      if (res?.posts?.length) {
        posts = res.posts;
      }
    }

    const cutoffTime = Date.now() - 48 * 60 * 60 * 1000; // 48 hours ago

    // Filter to articles in the last 48 hours (Google News requirement)
    let recentPosts = posts.filter((p) => {
      const dateStr = p.published_at || p.lastmod;
      const pubDate = dateStr ? new Date(dateStr).getTime() : 0;
      return pubDate >= cutoffTime;
    });

    if (recentPosts.length === 0 && posts.length > 0) {
      recentPosts = posts.slice(0, 1000);
    } else if (recentPosts.length > 1000) {
      recentPosts = recentPosts.slice(0, 1000);
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
