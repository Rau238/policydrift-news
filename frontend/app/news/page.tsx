import Link from 'next/link';
import type { Metadata } from 'next';
import { LayoutGrid } from 'lucide-react';
import { PostCard } from '@/components/PostCard';
import { LiveMarketsAside } from '@/components/LiveMarketsAside';
import { TrendingAside } from '@/components/TrendingAside';
import { getCategories, getPosts, getTrending } from '@/lib/api';
import { categoryLabel, CategoryGlyph } from '@/lib/categories';
import { newsListingHrefForCategory } from '@/lib/category-routes';
import { absoluteUrl, siteName } from '@/lib/site';

export const dynamic = 'force-dynamic';

type Props = { searchParams: { category?: string; page?: string } };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const category = searchParams.category || 'all';
  const title =
    category === 'all' ? 'News: all desks' : `${categoryLabel(category)}: News`;
  const description =
    category === 'all'
      ? `Browse every desk on ${siteName}: breaking news, world, India, business, politics, markets, and crypto.`
      : `Latest ${categoryLabel(category)} coverage on ${siteName}, with clear headlines and source links.`;
  const canonical =
    category === 'all'
      ? absoluteUrl('/news')
      : absoluteUrl(`/news?category=${encodeURIComponent(category)}`);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
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
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const [{ posts, total, limit }, categories, trending] = await Promise.all([
    getPosts({ page, limit: 12, category }),
    getCategories(),
    getTrending(5),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="border-b border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-10 text-white sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl md:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-300/90">Newsroom</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            All desks
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Pick a desk to read a dedicated feed, or stay here for the combined stream. Every story links to its
            original publisher.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_min(380px,100%)] lg:items-start lg:gap-10">
          <div>
            <h2 className="text-lg font-bold text-ink sm:text-xl">Browse by desk</h2>
            <p className="mt-1 text-sm text-slate-600">
              Same categories as the site header: Breaking through Sports, Markets, and Crypto.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <FilterChip href="/news" label="All desks" active={category === 'all'} desk="all" />
              {categories.map((c) => (
                <FilterChip
                  key={c.category}
                  href={newsListingHrefForCategory(c.category)}
                  label={`${categoryLabel(c.category)} (${c.count})`}
                  active={category === c.category}
                  desk={c.category}
                />
              ))}
            </div>

            {posts.length === 0 ? (
              <p className="mt-12 text-slate-600">No posts in this view yet.</p>
            ) : (
              <ul className="mt-10 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:gap-8">
                {posts.map((p, i) => (
                  <li key={p.id} className="min-w-0">
                    <PostCard post={p} gridCell index={i} />
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 ? (
              <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
                {page > 1 ? (
                  <PageLink page={page - 1} category={category} label="Previous" />
                ) : (
                  <span className="rounded-lg px-4 py-2 text-sm text-slate-400">Previous</span>
                )}
                <span className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <PageLink page={page + 1} category={category} label="Next" />
                ) : (
                  <span className="rounded-lg px-4 py-2 text-sm text-slate-400">Next</span>
                )}
              </nav>
            ) : null}
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

function FilterChip({
  href,
  label,
  active,
  desk,
}: {
  href: string;
  label: string;
  active: boolean;
  desk: string;
}) {
  const glyph =
    desk === 'all' ? (
      <LayoutGrid className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
    ) : (
      <CategoryGlyph name={desk} className="h-3.5 w-3.5 shrink-0" />
    );
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'border border-slate-800 bg-slate-900 text-white'
          : 'border border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {glyph}
      {label}
    </Link>
  );
}

function PageLink({ page, category, label }: { page: number; category: string; label: string }) {
  const q = new URLSearchParams();
  q.set('page', String(page));
  if (category && category !== 'all') q.set('category', category);
  return (
    <Link
      href={`/news?${q.toString()}`}
      className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
    >
      {label}
    </Link>
  );
}
