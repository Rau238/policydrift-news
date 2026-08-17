import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PostCard } from '@/components/PostCard';
import { LiveMarketsAside } from '@/components/LiveMarketsAside';
import { TrendingAside } from '@/components/TrendingAside';
import { PaginationBar } from '@/components/PaginationBar';
import { getPosts, getTrending } from '@/lib/api';
import { categoryHref, categoryLabel } from '@/lib/categories';
import { absoluteUrl, siteName } from '@/lib/site';
import { resolveOgImageUrl } from '@/lib/story-image';

export const dynamic = 'force-dynamic';

type Props = { searchParams: { category?: string; page?: string } };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const category = searchParams.category || 'all';
  if (category !== 'all') {
    const label = categoryLabel(category);
    const title = `${label} News & Stories`;
    const description = `Latest ${label} coverage on ${siteName}, with clear headlines, fact-checked summaries, and source links.`;
    const canonical = absoluteUrl(categoryHref(category));
    const ogImage = resolveOgImageUrl(null, { title: `${label} News & Analysis`, category: label });

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title: `${title} | ${siteName}`,
        description,
        url: canonical,
        siteName,
        type: 'website',
        images: [{ url: ogImage, width: 1200, height: 630, alt: title, type: 'image/png' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | ${siteName}`,
        description,
        site: '@policydrift',
        creator: '@policydrift',
        images: [ogImage],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      },
    };
  }

  const title = 'All News — Latest Syndicated Briefs';
  const description = `Combined real-time news stream from every ${siteName} desk: breaking, world, India, sports, business, politics, markets, and crypto.`;
  const canonical = absoluteUrl('/news');
  const ogImage = resolveOgImageUrl(null, { title: 'All News — Latest Syndicated Briefs', category: 'NEWS DESK' });

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: canonical,
      siteName,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title, type: 'image/png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteName}`,
      description,
      site: '@policydrift',
      creator: '@policydrift',
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

export default async function NewsListingPage({ searchParams }: Props) {
  const category = searchParams.category || 'all';

  // Desk filters live in the header nav (/news/india etc.) — don't duplicate them here.
  if (category !== 'all') {
    redirect(categoryHref(category));
  }

  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const [{ posts, total, limit }, trending] = await Promise.all([
    getPosts({ page, limit: 12, category: 'all' }),
    getTrending(5),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="border-b border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-10 text-white sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl md:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-300/90">Archive</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            All news
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Combined stream from every desk. Use the desk pills in the header for a single beat; every story still
            links to its original publisher.
          </p>
          {total > 0 ? (
            <p className="mt-4 text-sm font-medium tabular-nums text-slate-400">
              {total.toLocaleString()} stories
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_min(380px,100%)] lg:items-start lg:gap-10">
          <div>
            {posts.length === 0 ? (
              <p className="text-slate-600">No posts in this view yet.</p>
            ) : (
              <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:gap-8">
                {posts.map((p, i) => (
                  <li key={p.id} className="min-w-0">
                    <PostCard post={p} gridCell index={i} />
                  </li>
                ))}
              </ul>
            )}

            <PaginationBar
              page={page}
              totalPages={totalPages}
              hrefForPage={(p) => (p <= 1 ? '/news' : `/news?page=${p}`)}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-24">
            <LiveMarketsAside />
            <TrendingAside posts={trending} />
          </div>
        </div>
      </div>
    </div>
  );
}
