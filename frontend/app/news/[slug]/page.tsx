import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, getCategories, getPosts, getTrending } from '@/lib/api';
import { formatPublishedAt } from '@/lib/format';
import { newsArticleJsonLd } from '@/lib/jsonld';
import { prepareArticleBodyForDisplay } from '@/lib/article-body';
import { decodeHtmlEntities, stripHtmlToPlain } from '@/lib/sanitize';
import { resolveOgImageUrl, resolvePostImageUrl } from '@/lib/story-image';
import { absoluteUrl, siteName } from '@/lib/site';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { PostCard } from '@/components/PostCard';
import { LiveMarketsAside } from '@/components/LiveMarketsAside';
import { SidebarPostList } from '@/components/SidebarPostList';
import { TrendingAside } from '@/components/TrendingAside';
import {
  categoryArticleHeroRingClass,
  categoryChipClass,
  categoryHref,
  categoryLabel,
  CategoryGlyph,
  categoryNavPillClass,
  categoryVerticalBarClass,
} from '@/lib/categories';
import { CATEGORY_INTRO, categoryFromSlug } from '@/lib/category-routes';
import { ArrowLeft, ExternalLink, Eye, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Props = {
  params: { slug: string };
  searchParams: { page?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = categoryFromSlug(params.slug);
  if (category) {
    const label = categoryLabel(category);
    const title = `${label} news`;
    const description =
      CATEGORY_INTRO[category] ||
      `Latest ${label} on ${siteName}, with clear headlines and source links.`;
    const canonical = absoluteUrl(`/news/${params.slug}`);
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title: `${label} | ${siteName}`,
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

  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Not found' };
  const url = absoluteUrl(`/news/${post.slug}`);
  const desc = clipMetaDescription(post.excerpt?.trim() || post.title);
  const ogImage = resolveOgImageUrl(post.image_url);
  const desk = categoryLabel(post.category);
  return {
    title: post.title,
    description: desc,
    keywords: [desk, `${desk} news`, siteName, 'PolicyDrift news'],
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: desc,
      url,
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      locale: 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: desc,
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

export default async function NewsSlugPage({ params, searchParams }: Props) {
  const category = categoryFromSlug(params.slug);
  if (category) {
    const listPage = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
    const [{ posts, total, limit }, categories, trending] = await Promise.all([
      getPosts({ page: listPage, limit: 12, category }),
      getCategories(),
      getTrending(5),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const label = categoryLabel(category);
    const intro = CATEGORY_INTRO[category] || `Latest ${label} coverage on ${siteName}.`;
    const countHere = categories.find((c) => c.category === category)?.count;
    const slugSegment = params.slug;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-white sm:px-6 sm:py-12">
          <div
            className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-7xl md:px-6">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              All news
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 ${categoryNavPillClass(category)}`}
              >
                <CategoryGlyph name={category} className="h-4 w-4" />
                {label}
              </span>
              {countHere != null ? (
                <span className="text-sm font-medium text-slate-400">{countHere} stories</span>
              ) : null}
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{label}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{intro}</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_min(380px,100%)] lg:items-start lg:gap-10">
            <div>
              {posts.length === 0 ? (
                <p className="text-slate-600">No posts in this category yet.</p>
              ) : (
                <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:gap-8">
                  {posts.map((p, i) => (
                    <li key={p.id} className="min-w-0">
                      <PostCard post={p} gridCell index={i} />
                    </li>
                  ))}
                </ul>
              )}

              {totalPages > 1 ? (
                <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
                  {listPage > 1 ? (
                    <CategoryPageLink slugSegment={slugSegment} page={listPage - 1} label="Previous" />
                  ) : (
                    <span className="rounded-lg px-4 py-2 text-sm text-slate-400">Previous</span>
                  )}
                  <span className="text-sm text-slate-600">
                    Page {listPage} of {totalPages}
                  </span>
                  {listPage < totalPages ? (
                    <CategoryPageLink slugSegment={slugSegment} page={listPage + 1} label="Next" />
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

  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const [relatedPack, breakingPack, trendingAll] = await Promise.all([
    getPosts({ page: 1, limit: 14, category: post.category }),
    post.category !== 'Breaking'
      ? getPosts({ page: 1, limit: 14, category: 'Breaking' })
      : Promise.resolve({ posts: [], total: 0, page: 1, limit: 14 }),
    getTrending(14),
  ]);

  const relatedPosts = relatedPack.posts.filter((p) => p.id !== post.id).slice(0, 6);
  const breakingPosts =
    post.category !== 'Breaking'
      ? breakingPack.posts.filter((p) => p.id !== post.id).slice(0, 6)
      : [];
  const trendingPosts = trendingAll.filter((p) => p.id !== post.id).slice(0, 6);

  const rawBody = post.body ?? '';
  const { html: articleHtml, hasContent: hasArticleBody } = prepareArticleBodyForDisplay(
    rawBody,
    post.original_url ?? '',
  );
  const url = absoluteUrl(`/news/${post.slug}`);
  const heroSrc = resolvePostImageUrl(post.image_url);
  const desc = clipMetaDescription(post.excerpt?.trim() || post.title);
  /** Full plain text of what readers see — matches page, no 8k cap (JSON-LD). */
  const articleBodyForSchema = hasArticleBody
    ? stripHtmlToPlain(articleHtml, Infinity).trim() || undefined
    : post.excerpt?.trim() || undefined;
  const jsonLd = newsArticleJsonLd({
    url,
    title: post.title,
    description: desc,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    imageUrls: [resolveOgImageUrl(post.image_url)],
    section: post.category,
    articleBody: articleBodyForSchema,
  });
  const feedHostname = feedSourceHostname(post.source_feed);

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 sm:pb-12 sm:pt-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(380px,100%)] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <article className="relative w-full max-w-2xl">
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

              <Link
                href="/news"
                className="group mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-accent"
              >
                <ArrowLeft
                  className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5"
                  strokeWidth={2.25}
                  aria-hidden
                />
                News
              </Link>

              <header className="border-b border-slate-200/90 pb-4">
                <nav className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  <Link href="/" className="transition hover:text-accent">
                    Home
                  </Link>
                  <span className="mx-1.5 text-slate-300">/</span>
                  <Link href="/news" className="transition hover:text-accent">
                    News
                  </Link>
                  <span className="mx-1.5 text-slate-300">/</span>
                  <Link href={categoryHref(post.category)} className="transition hover:text-accent">
                    {categoryLabel(post.category)}
                  </Link>
                </nav>

                <Link
                  href={categoryHref(post.category)}
                  aria-label={`Browse all ${categoryLabel(post.category)} stories`}
                  className={`mt-3 inline-flex w-fit max-w-full items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold shadow-sm ring-1 transition hover:brightness-[0.98] active:scale-[0.99] sm:px-4 sm:text-[0.9375rem] ${categoryChipClass(post.category)}`}
                >
                  <CategoryGlyph name={post.category} className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 text-left">{categoryLabel(post.category)}</span>
                </Link>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-500">
                  <time className="tabular-nums" dateTime={post.published_at} title={post.published_at}>
                    {formatPublishedAt(post.published_at)}
                  </time>
                  <span className="text-slate-300" aria-hidden>
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3 opacity-70" strokeWidth={2.25} aria-hidden />
                    {post.view_count.toLocaleString()} views
                  </span>
                </div>

                <h1 className="mt-3 text-left text-balance font-display text-[1.625rem] font-bold leading-snug tracking-tight text-ink sm:text-[1.875rem] sm:leading-tight">
                  {decodeHtmlEntities(post.title)}
                </h1>
                {post.excerpt ? (
                  <p className="mt-2.5 text-left text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
                    {decodeHtmlEntities(post.excerpt)}
                  </p>
                ) : null}
              </header>

              <div
                className={`mt-4 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100 shadow-sm ring-2 ring-offset-0 ring-offset-paper ${categoryArticleHeroRingClass(post.category)}`}
              >
                <div className="relative aspect-[16/10] w-full">
                  <RemoteStoryImage
                    src={heroSrc}
                    alt={decodeHtmlEntities(post.title)}
                    priority
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>

              {hasArticleBody ? (
                <div
                  className="article-prose article-detail-prose prose-policy mt-6 w-full overflow-x-auto text-left text-base! feed-article-body [overflow-wrap:anywhere] [word-break:break-word]"
                  dangerouslySetInnerHTML={{ __html: articleHtml }}
                  suppressHydrationWarning
                />
              ) : (
                <div className="mt-6 rounded-lg border border-amber-200/90 bg-amber-50/80 px-4 py-3 text-left text-sm leading-relaxed text-amber-950">
                  <p className="font-medium text-amber-900">No article text in this feed item.</p>
                  <p className="mt-1 text-[13px] text-amber-900/85">
                    Open the publisher link below for the full story.
                  </p>
                </div>
              )}

              <footer className="mt-8 border-t border-slate-200 pt-5">
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Text above is from the syndicated RSS feed (sanitized for safe display). For the latest version,
                  updates, and full context, use the publisher link.
                </p>
                <a
                  href={post.original_url}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark sm:w-auto sm:justify-center"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Open original
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
                </a>
                <Link
                  href="/news"
                  className="mt-5 flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-accent"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                  All news
                </Link>
              </footer>
            </article>

            {relatedPosts.length > 0 ? (
              <section
                className={`mt-10 w-full max-w-2xl border-t border-slate-200 border-l-4 pl-4 pt-6 sm:pl-5 ${categoryVerticalBarClass(post.category)}`}
                aria-labelledby="article-related-heading"
              >
                <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                  <div>
                    <h2
                      id="article-related-heading"
                      className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl"
                    >
                      {`More in ${categoryLabel(post.category)}`}
                    </h2>
                    <p className="mt-0.5 text-[12px] font-medium text-slate-500 sm:text-[13px]">
                      Same desk, different stories
                    </p>
                  </div>
                  <Link
                    href={categoryHref(post.category)}
                    className="shrink-0 text-sm font-semibold text-accent transition hover:text-accent-dark"
                  >
                    {`All ${categoryLabel(post.category)} →`}
                  </Link>
                </div>
                <ul className="mt-4 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 sm:gap-3">
                  {relatedPosts.map((p, i) => (
                    <li key={p.id} className="min-w-0">
                      <PostCard post={p} compact gridCell index={i} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24">
            <LiveMarketsAside />
            {breakingPosts.length > 0 ? (
              <SidebarPostList
                title="Breaking elsewhere"
                subtitle="Latest from the Breaking desk"
                posts={breakingPosts}
                icon={Zap}
                tone="breaking"
                footerHref={categoryHref('Breaking')}
                footerLabel="All breaking news →"
              />
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}

/** ~155–160 chars for SERP snippets; keeps primary keywords at the start when excerpt is long. */
function clipMetaDescription(text: string, max = 158): string {
  const t = text.trim();
  if (!t) return '';
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const i = slice.lastIndexOf(' ');
  return `${(i > 50 ? slice.slice(0, i) : slice).trimEnd()}…`;
}

function feedSourceHostname(sourceFeed: string | null): string | null {
  if (!sourceFeed?.trim()) return null;
  try {
    return new URL(sourceFeed).hostname.replace(/^www\./i, '');
  } catch {
    return null;
  }
}

function CategoryPageLink({
  slugSegment,
  page,
  label,
}: {
  slugSegment: string;
  page: number;
  label: string;
}) {
  const q = page > 1 ? `?page=${page}` : '';
  return (
    <Link
      href={`/news/${slugSegment}${q}`}
      className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
    >
      {label}
    </Link>
  );
}
