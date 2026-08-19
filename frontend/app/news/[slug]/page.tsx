import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, getCategories, getPosts, getTrending } from '@/lib/api';
import { formatPublishedAt } from '@/lib/format';
import { newsArticleJsonLd, serializeJsonLd } from '@/lib/jsonld';
import { buildNewsArticleBodyForSchema, isBodyRedundantWithExcerpt, prepareArticleBodyForDisplay } from '@/lib/article-body';
import { decodeHtmlEntities } from '@/lib/sanitize';
import { resolveOgImageUrl, resolvePostImageUrl, extractArticleImages } from '@/lib/story-image';
import { absoluteUrl, siteName } from '@/lib/site';
import { curatorImageSrc, curatorName, curatorProfileUrl } from '@/lib/site-trust';
import { ArticleKeyTakeaways } from '@/components/ArticleKeyTakeaways';
import { StoryOverviewBox } from '@/components/StoryOverviewBox';
import { ParticleStoryImageStack } from '@/components/ParticleStoryImageStack';
import { PublisherCreditCard } from '@/components/PublisherCreditCard';
import { AnimatedBackButton } from '@/components/AnimatedBackButton';
import { ArticleEngagementBar } from '@/components/ArticleEngagementBar';
import { MultiSourceCoverage } from '@/components/MultiSourceCoverage';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { PostCard } from '@/components/PostCard';
import { LiveMarketsAside } from '@/components/LiveMarketsAside';
import { SidebarPostList } from '@/components/SidebarPostList';
import { TrendingAside } from '@/components/TrendingAside';
import { CategoryDeskView } from '@/components/CategoryDeskView';
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
    const title = `${label} News & Latest Updates`;
    const description =
      CATEGORY_INTRO[category] ||
      `Latest ${label} news on ${siteName} with clear headlines, fact-checked summaries, and verified source attribution.`;
    const canonical = absoluteUrl(`/news/${params.slug}`);
    const ogImage = resolveOgImageUrl(null, { title: `${label} News & Policy Analysis`, category: label });

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title: `${label} | ${siteName}`,
        description,
        url: canonical,
        siteName,
        type: 'website',
        locale: 'en_US',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${label} news coverage on ${siteName}`,
            type: 'image/png',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${label} | ${siteName}`,
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

  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Not found' };
  const url = absoluteUrl(`/news/${post.slug}`);
  const desc = clipMetaDescription(post.excerpt?.trim() || post.title);
  const desk = categoryLabel(post.category);
  const ogImage = resolveOgImageUrl(post.image_url, {
    title: post.title,
    category: desk,
    date: formatPublishedAt(post.published_at),
  });

  return {
    title: post.title,
    description: desc,
    keywords: [
      desk,
      `${desk} news`,
      'policy news',
      'current affairs',
      'breaking news',
      siteName,
      'PolicyDrift news',
    ],
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: desc,
      url,
      siteName,
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      section: desk,
      authors: [siteName],
      locale: 'en_US',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
          type: ogImage.includes('.png') ? 'image/png' : 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: desc,
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

export default async function NewsSlugPage({ params, searchParams }: Props) {
  const category = categoryFromSlug(params.slug);
  if (category) {
    const listPage = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
    const [{ posts, total, limit }, categories] = await Promise.all([
      getPosts({ page: listPage, limit: 17, category }),
      getCategories(),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const label = categoryLabel(category);
    const intro = CATEGORY_INTRO[category] || `Latest ${label} coverage on ${siteName}.`;
    const countHere = categories.find((c) => c.category === category)?.count;
    const slugSegment = params.slug;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <CategoryDeskHero category={category} intro={intro} storyCount={countHere} />
        <CategoryDeskView
          category={category}
          posts={posts}
          total={total}
          listPage={listPage}
          totalPages={totalPages}
          slugSegment={slugSegment}
        />
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
  const storyImages = extractArticleImages(
    post.image_url,
    decodeHtmlEntities(post.title),
    post.category,
    rawBody || articleHtml,
  );
  const heroSrc = storyImages[0]?.src || resolvePostImageUrl(post.image_url);
  const relatedImages = storyImages.slice(1);
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
  const desk = categoryLabel(post.category);
  const ogImage = resolveOgImageUrl(post.image_url, {
    title: post.title,
    category: desk,
    date: formatPublishedAt(post.published_at),
  });
  const jsonLd = newsArticleJsonLd({
    url,
    title: post.title,
    description: desc,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    imageUrls: [ogImage],
    section: post.category,
    articleBody: articleBodyForSchema || undefined,
    keyTakeaways: takeaways || undefined,
    sourceFeed: post.source_feed,
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
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <AnimatedBackButton href="/news" label="All news" />
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

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8 2xl:max-w-[1440px]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <article className="relative w-full min-w-0" itemScope itemType="https://schema.org/NewsArticle">
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
              />

              <header className="mb-6 space-y-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <Link
                    href={categoryHref(post.category)}
                    aria-label={`Browse all ${categoryLabel(post.category)} stories`}
                    className={`inline-flex w-fit max-w-full items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-bold shadow-sm ring-1 transition hover:brightness-[0.98] ${categoryChipClass(post.category)}`}
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

                <h1
                  id="article-headline"
                  itemProp="headline"
                  className="text-balance font-display text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-[2.25rem] lg:leading-[1.15]"
                >
                  {decodeHtmlEntities(post.title)}
                </h1>
                {showDeckUnderTitle ? (
                  <p
                    id="article-excerpt"
                    itemProp="description"
                    className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg"
                  >
                    {excerptText}
                  </p>
                ) : null}

                {/* Top Engagement Bar (Likes, Bookmarks, Share) */}
                <ArticleEngagementBar
                  postId={post.id}
                  slug={post.slug}
                  title={post.title}
                  initialLikes={post.like_count}
                />
              </header>

              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/5">
                {/* Particle.news Style 3D Overlapping Image Stack / Hero Section */}
                <div className="p-4 sm:p-6 lg:p-8 pb-0 sm:pb-0 lg:pb-0">
                  <ParticleStoryImageStack
                    mainImageSrc={heroSrc}
                    mainTitle={post.title}
                    category={post.category}
                    relatedImages={relatedImages}
                  />
                </div>

                {/* Unified Editorial Article Story Content with Generous Padding */}
                <div className="p-6 sm:p-8 lg:p-10 border-b border-slate-100 space-y-6">
                  <StoryOverviewBox
                    excerpt={excerptText}
                    takeawaysRaw={takeaways}
                  />

                  {showArticleBody ? (
                    <div className="pt-6 border-t border-slate-100">
                      <div
                        className="article-prose article-detail-prose prose-policy w-full overflow-x-auto text-left feed-article-body [overflow-wrap:anywhere] [word-break:break-word] text-base leading-relaxed text-slate-800"
                        dangerouslySetInnerHTML={{ __html: articleHtml }}
                        suppressHydrationWarning
                      />
                    </div>
                  ) : null}
                </div>

                {/* News Publisher Credit & Original Source Attribution */}
                <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100">
                  <PublisherCreditCard
                    originalUrl={post.original_url}
                    sourceFeed={post.source_feed}
                    author={post.author}
                    publishedAt={post.published_at}
                    category={post.category}
                  />
                </div>

                {/* Navigation and Desk Link */}
                <div className="bg-white p-5 sm:p-6 lg:px-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                      href={categoryHref(post.category)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 transition hover:text-teal-800"
                    >
                      <span>Explore all {categoryLabel(post.category)} stories</span>
                      <span aria-hidden>→</span>
                    </Link>
                    <p className="text-[11px] text-slate-400">
                      Syndicated feed content with full publisher credit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Multi-Source Perspectives & Related Web Coverage */}
              <div className="mt-8">
                <MultiSourceCoverage
                  mainTitle={post.title}
                  originalUrl={post.original_url}
                  sourceFeed={post.source_feed}
                  category={post.category}
                  relatedPosts={relatedPosts}
                />
              </div>

              {/* More Stories from this Desk Grid */}
              {relatedPosts.length > 0 ? (
                <section className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold tracking-tight text-slate-950">
                        More from {categoryLabel(post.category)}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Latest developments and reports from the desk
                      </p>
                    </div>
                    <Link
                      href={categoryHref(post.category)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800"
                    >
                      All stories →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedPosts.slice(0, 3).map((p, i) => (
                      <PostCard key={p.id} post={p} gridCell index={i} priority={false} />
                    ))}
                  </div>
                </section>
              ) : null}
            </article>
          </div>

          <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-20">
            {trendingPosts.length > 0 ? (
              <TrendingAside posts={trendingPosts} />
            ) : null}
            {breakingPosts.length > 0 ? (
              <SidebarPostList
                title="Breaking desk"
                subtitle="Live flash reports elsewhere"
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
