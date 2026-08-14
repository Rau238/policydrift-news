import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, getCategories, getPosts, getTrending } from '@/lib/api';
import { formatPublishedAt } from '@/lib/format';
import { newsArticleJsonLd, serializeJsonLd } from '@/lib/jsonld';
import { buildNewsArticleBodyForSchema, isBodyRedundantWithExcerpt, prepareArticleBodyForDisplay } from '@/lib/article-body';
import { decodeHtmlEntities } from '@/lib/sanitize';
import { resolveOgImageUrl, resolvePostImageUrl } from '@/lib/story-image';
import { absoluteUrl, siteName } from '@/lib/site';
import { curatorImageSrc, curatorName, curatorProfileUrl } from '@/lib/site-trust';
import { ArticleKeyTakeaways } from '@/components/ArticleKeyTakeaways';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { PostCard } from '@/components/PostCard';
import { LiveMarketsAside } from '@/components/LiveMarketsAside';
import { SidebarPostList } from '@/components/SidebarPostList';
import { TrendingAside } from '@/components/TrendingAside';
import { CategoryDeskHero } from '@/components/CategoryDeskHero';
import { PaginationBar } from '@/components/PaginationBar';
import {
  categoryArticleHeroRingClass,
  categoryChipClass,
  categoryHref,
  categoryLabel,
  CategoryGlyph,
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
        <CategoryDeskHero category={category} intro={intro} storyCount={countHere} />

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

              <PaginationBar
                page={listPage}
                totalPages={totalPages}
                hrefForPage={(p) =>
                  p <= 1 ? `/news/${slugSegment}` : `/news/${slugSegment}?page=${p}`
                }
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
    post.title,
  );
  const bodyDuplicatesExcerpt =
    hasArticleBody && isBodyRedundantWithExcerpt(articleHtml, post.excerpt);
  /** Show the body block only when it adds substance beyond the deck under the headline. */
  const showArticleBody = hasArticleBody && !bodyDuplicatesExcerpt;
  const url = absoluteUrl(`/news/${post.slug}`);
  const heroSrc = resolvePostImageUrl(post.image_url);
  const desc = clipMetaDescription(post.excerpt?.trim() || post.title);
  const takeaways = post.key_takeaways?.trim() ?? '';
  /** Matches visible article text: headline, excerpt, curator, takeaways, full syndicated body (uncapped). */
  const articleBodyForSchema = buildNewsArticleBodyForSchema({
    title: post.title,
    excerpt: post.excerpt,
    articleHtml,
    hasArticleBody: showArticleBody,
    keyTakeawaysRaw: takeaways,
  });
  const jsonLd = newsArticleJsonLd({
    url,
    title: post.title,
    description: desc,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    imageUrls: [resolveOgImageUrl(post.image_url)],
    section: post.category,
    articleBody: articleBodyForSchema || undefined,
    curatorPerson: {
      name: curatorName(),
      url: curatorProfileUrl(),
      imageSrc: curatorImageSrc(),
    },
  });

  const excerptText = post.excerpt?.trim() ? decodeHtmlEntities(post.excerpt.trim()) : '';
  /** Deck under the headline only when we also have a longer unique body. */
  const showDeckUnderTitle = Boolean(excerptText) && showArticleBody;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="border-b border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/news"
              className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-300 transition hover:text-white"
            >
              <ArrowLeft
                className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5"
                strokeWidth={2.25}
                aria-hidden
              />
              All news
            </Link>
            <nav className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
              <Link href="/" className="transition hover:text-teal-200">
                Home
              </Link>
              <span className="mx-1.5 text-slate-600">/</span>
              <Link href="/news" className="transition hover:text-teal-200">
                News
              </Link>
              <span className="mx-1.5 text-slate-600">/</span>
              <Link href={categoryHref(post.category)} className="transition hover:text-teal-200">
                {categoryLabel(post.category)}
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(340px,100%)] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <article className="relative w-full max-w-3xl">
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
              />

              <header className="mb-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <Link
                    href={categoryHref(post.category)}
                    aria-label={`Browse all ${categoryLabel(post.category)} stories`}
                    className={`inline-flex w-fit max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold shadow-sm ring-1 transition hover:brightness-[0.98] ${categoryChipClass(post.category)}`}
                  >
                    <CategoryGlyph name={post.category} className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 text-left">{categoryLabel(post.category)}</span>
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-500">
                    <time className="tabular-nums" dateTime={post.published_at} title={post.published_at}>
                      {formatPublishedAt(post.published_at)}
                    </time>
                    <span className="text-slate-300" aria-hidden>
                      ·
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 opacity-70" strokeWidth={2.25} aria-hidden />
                      {post.view_count.toLocaleString()} views
                    </span>
                  </div>
                </div>

                <h1 className="mt-3.5 text-balance font-display text-[1.7rem] font-bold leading-[1.18] tracking-tight text-ink sm:text-[2.15rem] sm:leading-[1.12]">
                  {decodeHtmlEntities(post.title)}
                </h1>
                {showDeckUnderTitle ? (
                  <p className="mt-3 max-w-2xl text-[1.02rem] leading-relaxed text-slate-600 sm:text-[1.0625rem]">
                    {excerptText}
                  </p>
                ) : null}
              </header>

              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/5">
                <figure className={`relative bg-slate-900 ${categoryArticleHeroRingClass(post.category)}`}>
                  <div className="relative aspect-[16/9] w-full sm:aspect-[2/1]">
                    <RemoteStoryImage
                      src={heroSrc}
                      alt={decodeHtmlEntities(post.title)}
                      title={decodeHtmlEntities(post.title)}
                      category={post.category}
                      priority
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/40 to-transparent"
                      aria-hidden
                    />
                  </div>
                </figure>

                {takeaways ? (
                  <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                    <ArticleKeyTakeaways raw={takeaways} />
                  </div>
                ) : null}

                {showArticleBody ? (
                  <div className="border-b border-slate-100 px-4 py-6 sm:px-7 sm:py-7">
                    <div
                      className="article-prose article-detail-prose prose-policy w-full overflow-x-auto text-left feed-article-body [overflow-wrap:anywhere] [word-break:break-word]"
                      dangerouslySetInnerHTML={{ __html: articleHtml }}
                      suppressHydrationWarning
                    />
                  </div>
                ) : excerptText ? (
                  <div className="border-b border-slate-100 px-4 py-5 sm:px-7 sm:py-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700/90">Summary</p>
                    <p className="mt-2.5 font-display text-[1.125rem] font-medium leading-relaxed text-slate-800 sm:text-[1.2rem] sm:leading-[1.65]">
                      {excerptText}
                    </p>
                  </div>
                ) : null}

                <div className="bg-gradient-to-br from-slate-50 to-white px-4 py-5 sm:px-7 sm:py-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <a
                      href={post.original_url}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition hover:bg-accent-dark sm:flex-none sm:min-w-[16rem]"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Continue on publisher site
                      <ExternalLink className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
                    </a>
                    <Link
                      href={categoryHref(post.category)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold text-slate-600 transition hover:border-teal-200 hover:text-accent"
                    >
                      More in {categoryLabel(post.category)}
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                  {showArticleBody ? (
                    <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                      Syndicated feed text, sanitized for display. Publisher site may have updates.
                    </p>
                  ) : null}
                </div>
              </div>
            </article>

            {relatedPosts.length > 0 ? (
              <section
                className={`mt-8 w-full max-w-3xl rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 border-l-4 ${categoryVerticalBarClass(post.category)}`}
                aria-labelledby="article-related-heading"
              >
                <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                  <div>
                    <h2
                      id="article-related-heading"
                      className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl"
                    >
                      {`More in ${categoryLabel(post.category)}`}
                    </h2>
                    <p className="mt-1 text-[13px] font-medium text-slate-500">Continue reading on this desk</p>
                  </div>
                  <Link
                    href={categoryHref(post.category)}
                    className="shrink-0 text-sm font-semibold text-accent transition hover:text-accent-dark"
                  >
                    {`All ${categoryLabel(post.category)} →`}
                  </Link>
                </div>
                <ul className="mt-5 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
                  {relatedPosts.map((p, i) => (
                    <li key={p.id} className="min-w-0">
                      <PostCard post={p} compact gridCell index={i} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-24">
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
            {trendingPosts.length > 0 ? (
              <TrendingAside posts={trendingPosts} />
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
