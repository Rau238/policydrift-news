import type { Metadata } from 'next';
import { PostCard } from '@/components/PostCard';
import { BreakingGrid } from '@/components/BreakingGrid';
import { TrendingAside } from '@/components/TrendingAside';
import { LiveMarketsAside } from '@/components/LiveMarketsAside';
import { getPosts, getTrending } from '@/lib/api';
import { resolvePostImageUrl, storyFallbackImageUrl } from '@/lib/story-image';
import { absoluteUrl, siteDescription, siteName } from '@/lib/site';
import Link from 'next/link';
import { ArrowRight, LayoutGrid, Newspaper, TrendingUp, Zap } from 'lucide-react';
import { categoryChipClass, categoryHref, categoryLabel, CategoryGlyph } from '@/lib/categories';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { formatPublishedAt } from '@/lib/format';
import { decodeHtmlEntities } from '@/lib/sanitize';

/** Full Tailwind classes, picked at random on each request (see `dynamic`). */
const HERO_BACKDROP_GRADIENTS = [
  'bg-gradient-to-br from-teal-900 via-teal-700 to-emerald-800',
  'bg-gradient-to-br from-cyan-900 via-teal-700 to-green-800',
  'bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]',
  'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
  'bg-gradient-to-br from-slate-900 via-slate-700 to-slate-800',
  'bg-gradient-to-br from-zinc-900 via-neutral-800 to-black',
] as const;

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: `${siteName}: World & policy news, clearly told` },
  description: siteDescription,
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    title: `${siteName}  World & policy news`,
    description: siteDescription,
    url: absoluteUrl('/'),
    type: 'website',
    images: [{ url: storyFallbackImageUrl(), width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [storyFallbackImageUrl()],
  },
};

export default async function HomePage() {
  const [breaking, latest, trending] = await Promise.all([
    getPosts({ page: 1, limit: 10, category: 'Breaking' }),
    getPosts({ page: 1, limit: 12 }),
    getTrending(6),
  ]);

  const lead = latest.posts[0];

  const heroBackdropGradient =
    HERO_BACKDROP_GRADIENTS[Math.floor(Math.random() * HERO_BACKDROP_GRADIENTS.length)];

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden ">
        <div className={`absolute inset-0 ${heroBackdropGradient}`} aria-hidden />
        <div
          className="pointer-events-none absolute -right-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto flex max-w-7xl min-h-0 flex-col px-4 py-8 max-lg:px-3.5 max-lg:py-7 sm:px-6 sm:py-8 lg:max-h-[min(58vh,34rem)] lg:justify-center lg:px-6 lg:py-8">
          <div className="grid items-center gap-5 max-lg:gap-5 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4 xl:col-span-4">
              <h1 className="mt-2 font-display text-[1.875rem] font-bold leading-[1.12] tracking-tight text-white max-lg:text-[1.6875rem] sm:text-4xl lg:text-[2.5rem] lg:leading-[1.08] xl:text-[2.85rem]">
                World and policy news,{' '}
                <span className="text-teal-200">clearly told.</span>
              </h1>
              <p className="mt-3 font-display text-base italic leading-snug text-teal-100/85 sm:text-[1.0625rem]">
                One feed. Eight desks. Zero noise.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 max-lg:mt-5 max-lg:gap-2 sm:mt-6 sm:gap-2.5">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light hover:text-brand-night"
                >
                  <LayoutGrid className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                  All news
                  <ArrowRight className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
                </Link>
                <Link
                  href={categoryHref('India')}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/10"
                >
                  <CategoryGlyph name="India" className="h-4 w-4 shrink-0 text-amber-200" />
                  {categoryLabel('India')}
                </Link>
                <Link
                  href="/trending-india"
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-400/35 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-50 transition hover:border-amber-300/50 hover:bg-amber-500/25"
                >
                  <TrendingUp className="h-4 w-4 shrink-0 text-amber-200" strokeWidth={2.25} aria-hidden />
                  Trending in India
                </Link>
              </div>
            </div>

            <div className="min-w-0 lg:col-span-8 xl:col-span-8">
              {lead ? (
                <Link href={`/news/${lead.slug}`} className="group grid overflow-hidden rounded-xl border border-white/10 bg-slate-950/90  
                ring-1 ring-white/[0.06] transition hover:border-teal-500/35 hover:ring-teal-500/15 max-lg:rounded-2xl  sm:min-h-[15rem] 
                sm:grid-cols-[minmax(16rem,44%)_1fr] sm:rounded-2xl lg:min-h-[16rem] lg:grid-cols-[minmax(17.5rem,46%)_1fr]">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900 sm:aspect-auto sm:h-full sm:min-h-[15rem] lg:min-h-[16rem]">
                    <RemoteStoryImage
                      src={resolvePostImageUrl(lead.image_url)}
                      alt={decodeHtmlEntities(lead.title)}
                      title={decodeHtmlEntities(lead.title)}
                      priority
                      className="h-full w-full object-cover object-center transition duration-500 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex min-h-0 min-w-0 flex-col justify-center border-t border-white/10 px-3.5 py-3.5 max-lg:px-3.5 max-lg:py-3.5 sm:border-l 
                  sm:border-t-0 sm:px-7 sm:py-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
                       text-slate-200">Featured</span>
                      <span className={`inline-flex items-center gap-1 rounded-md text-white px-2 py-0.5 text-[10px] font-bold ${categoryChipClass(lead.category)}`}>
                        <CategoryGlyph name={lead.category} className="h-3 w-3" />{categoryLabel(lead.category)}</span>
                    </div>
                    <h2 className="mt-2.5 font-display text-base font-bold leading-snug text-white line-clamp-3 max-lg:mt-2 sm:mt-3 sm:text-xl lg:text-[1.375rem]">
                      {lead.title}
                    </h2>
                    {lead.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
                        {lead.excerpt}
                      </p>
                    ) : null}
                    <p className="mt-auto pt-3 text-[10px] font-semibold tabular-nums tracking-wide text-slate-500">
                      {formatPublishedAt(lead.published_at)}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex min-h-[9rem] flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-8 text-center sm:min-h-[11rem]">
                  <Newspaper className="mb-2 h-8 w-8 text-teal-400/70" strokeWidth={1.5} aria-hidden />
                  <p className="text-sm text-slate-400">No stories yet.</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Run <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-teal-300/90">npm run ingest</code>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="relative ">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-accent-soft/25 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl  py-10 max-lg:px-3.5 max-lg:py-10">
          <div className="grid gap-8 max-lg:gap-8 lg:grid-cols-[1fr_min(380px,100%)] lg:items-start ">
            <div className="min-w-0 space-y-12 max-lg:space-y-10 lg:space-y-20">
              {breaking.posts.length > 0 ? (
                <section className="relative overflow-hidden rounded-2xl max-lg:rounded-2xl max-lg:shadow-sm lg:rounded-3xl">
                  <div className="relative md:px-6">
                    <div className="mb-5 flex flex-col gap-4 max-lg:mb-5 max-lg:gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent-soft text-accent-dark">
                            <Zap className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-dark/80">
                            Live desk
                          </span>
                        </div>
                        <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink max-lg:text-[1.375rem] sm:mt-4 sm:text-3xl">
                          Breaking desk
                        </h2>
                        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft max-lg:mt-1.5 max-lg:text-[13px] sm:mt-2">
                          Fast-moving stories in a simple grid no sideways scrolling.
                        </p>
                      </div>
                      <Link
                        href={categoryHref('Breaking')}
                        className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-accent-dark transition hover:border-accent/50 hover:bg-accent-soft/60 max-lg:w-full max-lg:justify-center max-lg:py-2.5 sm:w-auto sm:self-auto sm:rounded-xl sm:px-5 sm:py-3"
                      >
                        View all
                        <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                      </Link>
                    </div>
                    <BreakingGrid posts={breaking.posts} />
                  </div>
                </section>
              ) : null}

              <section className="sm:px-6">
                <div className="mb-6 flex flex-col gap-4  max-lg:mb-6 max-lg:gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-ink ring-1 ring-slate-200/80 max-lg:h-9 max-lg:w-9 max-lg:rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
                        <Newspaper className="h-[1.15rem] w-[1.15rem] text-accent-dark max-lg:h-[1.1rem] max-lg:w-[1.1rem] sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-soft sm:text-[11px]">
                        All desks
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink max-lg:text-[1.375rem] sm:mt-4 sm:text-3xl">
                      Latest across desks
                    </h2>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft max-lg:mt-1.5 max-lg:text-[13px] sm:mt-2">
                      World, India, sports, business, politics, markets and crypto, updated as feeds run.
                    </p>
                  </div>
                  <Link
                    href="/news"
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-accent-dark transition hover:border-accent/50 hover:bg-accent-soft/50 max-lg:w-full max-lg:justify-center sm:w-auto sm:rounded-xl sm:px-5 sm:py-3"
                  >
                    Full archive
                    <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                  </Link>
                </div>
                {latest.posts.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-surface p-14 text-center">
                    <p className="text-lg font-semibold text-ink">No articles yet</p>
                    <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
                      Feeds live in{' '}
                      <code className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-xs text-ink">
                        backend/src/config/rss-feeds.js
                      </code>
                      . Then run{' '}
                      <code className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-xs text-ink">
                        npm run ingest
                      </code>
                      .
                    </p>
                  </div>
                ) : (
                  <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 max-lg:gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {latest.posts.map((p, i) => (
                      <li key={p.id} className="min-w-0">
                        <PostCard post={p} priority={i < 4} gridCell index={i} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="flex min-w-0 flex-col gap-6 max-lg:mt-1 max-lg:gap-6 lg:sticky lg:top-24 lg:gap-8 ">
              <LiveMarketsAside />
              <TrendingAside posts={trending} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
