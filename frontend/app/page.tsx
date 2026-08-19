import type { Metadata } from 'next';
import { PostCard } from '@/components/PostCard';
import { BreakingGrid } from '@/components/BreakingGrid';
import { TrendingAside } from '@/components/TrendingAside';
import { LiveMarketsAside } from '@/components/LiveMarketsAside';
import { getPosts, getTrending, getTopNews, getTrendingNews, getPopularNews } from '@/lib/api';
import { TopStoriesSection } from '@/components/TopStoriesSection';
import { TrendingSection } from '@/components/TrendingSection';
import { PopularSection } from '@/components/PopularSection';
import { resolvePostImageUrl, storyFallbackImageUrl } from '@/lib/story-image';
import { absoluteUrl, siteDescription, siteName } from '@/lib/site';
import Link from 'next/link';
import { ArrowRight, LayoutGrid, Newspaper, Zap } from 'lucide-react';
import { categoryChipClass, categoryHref, categoryLabel, categoryNavPillClass, CategoryGlyph, getCardBgHex } from '@/lib/categories';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { AnimatedTrendingIcon } from '@/components/AnimatedTrendingIcon';
import { formatPublishedAt } from '@/lib/format';
import { decodeHtmlEntities } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

/** Curated luxury editorial dynamic color themes that rotate on every visit/refresh. */
const HERO_COLOR_THEMES = [
  {
    name: 'Midnight Sapphire',
    wash: 'from-[#050e24] via-[#091838] to-[#040816]',
    orb: 'bg-blue-500/20',
    accentGradient: 'from-sky-300 via-cyan-200 to-blue-300',
    badgeBorder: 'border-cyan-400/30 bg-cyan-950/70 text-cyan-300',
    btnBg: 'bg-cyan-600 hover:bg-cyan-500 border-cyan-400/30 shadow-cyan-950/40',
  },
  {
    name: 'Deep Emerald Teal',
    wash: 'from-[#031510] via-[#07261d] to-[#020e0b]',
    orb: 'bg-emerald-500/20',
    accentGradient: 'from-emerald-300 via-teal-200 to-cyan-300',
    badgeBorder: 'border-teal-400/30 bg-teal-950/70 text-teal-300',
    btnBg: 'bg-teal-600 hover:bg-teal-500 border-teal-400/30 shadow-teal-950/40',
  },
  {
    name: 'Royal Plum & Indigo',
    wash: 'from-[#0f0720] via-[#1a0d38] to-[#080312]',
    orb: 'bg-purple-500/20',
    accentGradient: 'from-fuchsia-300 via-purple-200 to-indigo-300',
    badgeBorder: 'border-purple-400/30 bg-purple-950/70 text-purple-300',
    btnBg: 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400/30 shadow-indigo-950/40',
  },
  {
    name: 'Warm Amber & Obsidian',
    wash: 'from-[#140b04] via-[#241407] to-[#0b0502]',
    orb: 'bg-amber-500/20',
    accentGradient: 'from-amber-300 via-yellow-200 to-orange-300',
    badgeBorder: 'border-amber-400/30 bg-amber-950/70 text-amber-300',
    btnBg: 'bg-amber-600 hover:bg-amber-500 border-amber-400/30 shadow-amber-950/40',
  },
  {
    name: 'Ruby Velvet Slate',
    wash: 'from-[#16060e] via-[#280b1a] to-[#0e0308]',
    orb: 'bg-rose-500/20',
    accentGradient: 'from-rose-300 via-pink-200 to-red-300',
    badgeBorder: 'border-rose-400/30 bg-rose-950/70 text-rose-300',
    btnBg: 'bg-rose-600 hover:bg-rose-500 border-rose-400/30 shadow-rose-950/40',
  },
  {
    name: 'Nordic Slate Charcoal',
    wash: 'from-[#080e1a] via-[#111d32] to-[#050912]',
    orb: 'bg-teal-500/15',
    accentGradient: 'from-teal-300 via-slate-200 to-sky-300',
    badgeBorder: 'border-teal-400/30 bg-slate-900/80 text-teal-300',
    btnBg: 'bg-teal-600 hover:bg-teal-500 border-teal-400/30 shadow-teal-950/40',
  },
] as const;

export const metadata: Metadata = {
  title: { absolute: `${siteName} — Real-Time News, Global Policy & Market Briefs` },
  description: siteDescription,
  keywords: [
    'news',
    'breaking news',
    'policy drift',
    'world news',
    'India news',
    'politics',
    'business news',
    'banking & economics',
    'stocks & markets',
    'crypto',
    'live market quotes',
    siteName,
  ],
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    title: `${siteName} — Real-Time News & Global Policy`,
    description: siteDescription,
    url: absoluteUrl('/'),
    siteName,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: storyFallbackImageUrl({ title: 'PolicyDrift — Real-Time News, Global Policy & Market Briefs', category: 'LIVE DESK' }),
        width: 1200,
        height: 630,
        alt: `${siteName} Cover`,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} — Real-Time News & Global Policy`,
    description: siteDescription,
    site: '@policydrift',
    creator: '@policydrift',
    images: [storyFallbackImageUrl({ title: 'PolicyDrift — Real-Time News, Global Policy & Market Briefs', category: 'LIVE DESK' })],
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

export default async function HomePage() {
  const [breakingRaw, latestRaw, trendingRaw, topStoriesRaw, trendingRankedRaw, popularRaw] = await Promise.all([
    getPosts({ page: 1, limit: 14, category: 'Breaking' }),
    getPosts({ page: 1, limit: 30 }),
    getTrending(10),
    getTopNews({ limit: 10 }),
    getTrendingNews({ limit: 12 }),
    getPopularNews({ limit: 10, period: 'day' }),
  ]);

  // Strict cross-section deduplication
  const seenIds = new Set<number>();

  // 1. Featured Lead Hero Story
  const lead = latestRaw.posts[0];
  if (lead) seenIds.add(lead.id);

  // 2. Breaking News Live Desk
  const breakingPosts = breakingRaw.posts.filter((p) => !seenIds.has(p.id)).slice(0, 6);
  breakingPosts.forEach((p) => seenIds.add(p.id));

  // 3. Top Stories Section
  const topStories = (topStoriesRaw || []).filter((p) => !seenIds.has(p.id)).slice(0, 6);
  topStories.forEach((p) => seenIds.add(p.id));

  // 4. Trending Ranked Section
  const trendingRanked = (trendingRankedRaw || []).filter((p) => !seenIds.has(p.id)).slice(0, 5);
  trendingRanked.forEach((p) => seenIds.add(p.id));

  // 5. Popular Section
  const popular = (popularRaw || []).filter((p) => !seenIds.has(p.id)).slice(0, 5);
  popular.forEach((p) => seenIds.add(p.id));

  // 6. Latest Across Desks (Guaranteed unique; no duplicates from hero/breaking/top)
  const latestPosts = latestRaw.posts.filter((p) => !seenIds.has(p.id)).slice(0, 12);

  // 7. Sidebar Trending
  const trending = (trendingRaw || []).filter((p) => p.id !== lead?.id).slice(0, 6);

  const theme = HERO_COLOR_THEMES[Math.floor(Math.random() * HERO_COLOR_THEMES.length)];

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-clip bg-paper">
      <div className="relative overflow-x-clip">
        {/* Proper Full-Width Linear Gradient Fade with Multi-Stop Easing Mask */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-[min(48rem,100vw)] bg-gradient-to-b ${theme.wash}`}
          style={{
            maskImage:
              'linear-gradient(to bottom, #000 8%, rgba(0,0,0,0.85) 24%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0.25) 68%, rgba(0,0,0,0.06) 86%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, #000 8%, rgba(0,0,0,0.85) 24%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0.25) 68%, rgba(0,0,0,0.06) 86%, transparent 100%)',
          }}
          aria-hidden
        />

        {/* Hero Content Section */}
        <section className="relative mx-auto flex max-w-7xl min-h-0 flex-col px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-9 lg:px-8 lg:pb-20 lg:pt-10 2xl:max-w-[1440px]">
          <div className="grid items-center gap-6 max-lg:gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
            <div className="lg:col-span-5 xl:col-span-5">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold backdrop-blur-md ${theme.badgeBorder}`}>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Editorial Feed
              </div>

              <h1 className="mt-3 font-display text-[1.85rem] font-extrabold leading-[1.12] tracking-tight text-white max-lg:text-[1.6875rem] sm:text-4xl lg:text-[2.5rem] lg:leading-[1.08]">
                World and policy news,{' '}
                <span className={`bg-gradient-to-r ${theme.accentGradient} bg-clip-text text-transparent`}>
                  clearly told.
                </span>
              </h1>
              <p className="mt-2.5 font-display text-base font-normal leading-relaxed text-slate-300/90 sm:text-[1.0625rem]">
                Real-time policy intelligence across 8 global desks. Zero noise.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 max-lg:mt-4 max-lg:gap-2.5">
                <Link
                  href="/news"
                  className={`group inline-flex h-11 items-center justify-center gap-2.5 rounded-xl border px-5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${theme.btnBg}`}
                >
                  <LayoutGrid className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:rotate-6" strokeWidth={2.25} aria-hidden />
                  <span>All news</span>
                  <ArrowRight className="h-4 w-4 shrink-0 opacity-90 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.25} aria-hidden />
                </Link>
                <Link
                  href={categoryHref('India')}
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md shadow-sm transition-all duration-200 hover:border-white/40 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CategoryGlyph name="India" className="h-4 w-4 shrink-0 text-amber-300 transition-transform duration-200 group-hover:scale-110" />
                  <span>{categoryLabel('India')}</span>
                </Link>
                <Link
                  href="/trending-india"
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/15 px-5 text-sm font-semibold text-amber-200 backdrop-blur-md shadow-sm transition-all duration-200 hover:border-amber-300/60 hover:bg-amber-500/25 hover:text-amber-100 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <AnimatedTrendingIcon className="h-4 w-4 text-amber-300 transition-transform duration-200 group-hover:scale-110" />
                  <span>Trending in India</span>
                </Link>
              </div>
            </div>

            <div className="min-w-0 lg:col-span-7 xl:col-span-7">
              {lead ? (
                <Link
                  href={`/news/${lead.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 sm:h-[13.5rem] sm:flex-row lg:h-[14rem]"
                  style={{
                    backgroundColor: getCardBgHex(lead.category, 0, lead.id),
                  }}
                >
                  <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-full sm:w-[42%]">
                    <RemoteStoryImage
                      src={resolvePostImageUrl(lead.image_url, lead.title, lead.category)}
                      alt={decodeHtmlEntities(lead.title)}
                      priority
                      className="h-full w-full object-cover transition-opacity duration-300"
                      category={lead.category}
                      cardBgHex={getCardBgHex(lead.category, 0, lead.id)}
                    />
                    <div
                      className="pointer-events-none absolute inset-0 hidden sm:block"
                      style={{
                        background: `linear-gradient(to right, transparent 0%, transparent 65%, ${getCardBgHex(lead.category, 0, lead.id)} 100%)`,
                      }}
                      aria-hidden
                    />
                  </div>

                  <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-teal-400/40 bg-teal-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-300 shadow-sm backdrop-blur-md">
                          Featured Lead
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-md">
                          <CategoryGlyph name={lead.category} className="h-3 w-3" />
                          {categoryLabel(lead.category)}
                        </span>
                      </div>
                      <h2 className="font-display text-base font-bold leading-snug tracking-tight text-white line-clamp-2 sm:text-lg lg:text-[1.1875rem]">
                        {decodeHtmlEntities(lead.title)}
                      </h2>
                      {lead.excerpt ? (
                        <p className="text-xs leading-relaxed text-slate-300/85 line-clamp-2">
                          {decodeHtmlEntities(lead.excerpt)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                      <time dateTime={lead.published_at} className="font-medium">
                        {formatPublishedAt(lead.published_at)}
                      </time>
                      <span className="inline-flex items-center gap-1 rounded-full border border-teal-400/30 bg-teal-500/15 px-3 py-1 text-xs font-semibold text-teal-200">
                        Read story
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
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
        </section>

        {/* 2. Main Content Body on Pure Crisp Paper Background */}
        <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 2xl:max-w-[1440px]">
          <div className="grid min-w-0 gap-8 max-lg:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,min(380px,100%))] lg:items-start">
            <div className="min-w-0 space-y-12 max-lg:space-y-10 lg:space-y-20">
              {breakingPosts.length > 0 ? (
                <section className="relative overflow-hidden rounded-2xl">
                  <div className="relative">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-200">
                          <Zap className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
                          Live Desk
                        </div>
                        <h2 className="mt-2.5 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                          Breaking desk
                        </h2>
                        <p className="mt-1 text-sm font-medium text-slate-200/90">
                          Fast-moving developments and flash reports across global regions.
                        </p>
                      </div>
                      <Link
                        href={categoryHref('Breaking')}
                        className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-md transition hover:border-white/40 hover:bg-white/20 sm:self-auto sm:px-5 sm:py-2.5"
                      >
                        View all breaking
                        <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                      </Link>
                    </div>
                    <BreakingGrid posts={breakingPosts} />
                  </div>
                </section>
              ) : null}

              {topStories.length > 0 ? (
                <section>
                  <TopStoriesSection posts={topStories} />
                </section>
              ) : null}

              {(trendingRanked.length > 0 || popular.length > 0) ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                  {trendingRanked.length > 0 ? (
                    <div>
                      <TrendingSection posts={trendingRanked} />
                    </div>
                  ) : null}
                  {popular.length > 0 ? (
                    <div>
                      <PopularSection posts={popular} />
                    </div>
                  ) : null}
                </div>
              ) : null}

              <section>
                <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-ink ring-1 ring-slate-200/80 sm:h-10 sm:w-10 sm:rounded-xl">
                        <Newspaper className="h-5 w-5 text-accent-dark" strokeWidth={2} aria-hidden />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-soft sm:text-[11px]">
                        All desks
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:mt-4 sm:text-3xl">
                      Latest across desks
                    </h2>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft sm:mt-2">
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
                {latestPosts.length === 0 ? (
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
                    {latestPosts.map((p, i) => (
                      <li key={p.id} className="min-w-0">
                        <PostCard post={p} priority={false} gridCell index={i} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="flex min-w-0 flex-col gap-6 max-lg:mt-1 max-lg:gap-6 lg:sticky lg:top-20">
              <LiveMarketsAside />
              <TrendingAside posts={trending} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
