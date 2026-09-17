import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, getCategories, getPosts, getTrending } from '@/lib/api';
import { formatPublishedAt } from '@/lib/format';
import { newsArticleJsonLd, serializeJsonLd } from '@/lib/jsonld';
import {
  buildNewsArticleBodyForSchema,
  cleanDisplayExcerpt,
  isBodyRedundantWithExcerpt,
  isMarkdownStory,
  parseGoogleNewsItems,
  prepareArticleBodyForDisplay,
} from '@/lib/article-body';
import { decodeHtmlEntities, stripHtmlToPlain } from '@/lib/sanitize';
import { MediaCoveragePerspectives } from '@/components/MediaCoveragePerspectives';
import { resolveOgImageUrl, resolvePostImageUrl, extractArticleImages } from '@/lib/story-image';
import { absoluteUrl, siteName } from '@/lib/site';
import { curatorImageSrc, curatorName, curatorProfileUrl } from '@/lib/site-trust';
import { ArticleKeyTakeaways } from '@/components/ArticleKeyTakeaways';
import { StoryOverviewBox } from '@/components/StoryOverviewBox';
import { StoryTimeline } from '@/components/StoryTimeline';
import { extractTimelineFromContent } from '@/lib/story-timeline';
import { ParticleStoryImageStack } from '@/components/ParticleStoryImageStack';
import { PublisherCreditCard } from '@/components/PublisherCreditCard';
import { AnimatedBackButton } from '@/components/AnimatedBackButton';
import { ArticleEngagementBar } from '@/components/ArticleEngagementBar';
import { ArticleAudioPlayer } from '@/components/ArticleAudioPlayer';
import { MultiSourceCoverage } from '@/components/MultiSourceCoverage';
import { CommunityJoinBanner } from '@/components/CommunityJoinBanner';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { PostCard } from '@/components/PostCard';
import { LiveMarketsAside } from '@/components/LiveMarketsAside';
import { SidebarPostList } from '@/components/SidebarPostList';
import { TrendingAside } from '@/components/TrendingAside';
import { RichStoryBody } from '@/components/RichStoryBody';
import { RenderTextWithFlags } from '@/components/CountryFlag';
import { CategoryDeskView } from '@/components/CategoryDeskView';
import { CategoryDeskHero } from '@/components/CategoryDeskHero';
import { LiveCricketTicker } from '@/components/LiveCricketTicker';
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
export const revalidate = 60;

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
      alternates: {
        canonical,
        types: {
          'application/rss+xml': absoluteUrl(`/feed/${params.slug}.xml`),
        },
      },
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
        site: '@newsfree365',
        creator: '@newsfree365',
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
  const desc = clipMetaDescription(cleanDisplayExcerpt(post.excerpt, post.title));
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
      'NewsFree365 news',
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
      site: '@newsfree365',
      creator: '@newsfree365',
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
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
        {category === 'Sports' && (
          <div className="border-b border-slate-800/80 bg-slate-950">
            <LiveCricketTicker />
          </div>
        )}
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
    getPosts({ page: 1, limit: 6, category: post.category }),
    post.category !== 'Breaking'
      ? getPosts({ page: 1, limit: 6, category: 'Breaking' })
      : Promise.resolve({ posts: [], total: 0, page: 1, limit: 6 }),
    getTrending(6),
  ]);

  const relatedPosts = relatedPack.posts.filter((p) => p.id !== post.id).slice(0, 6);
  const breakingPosts =
    post.category !== 'Breaking'
      ? breakingPack.posts.filter((p) => p.id !== post.id).slice(0, 6)
      : [];
  const trendingPosts = trendingAll.filter((p) => p.id !== post.id).slice(0, 6);

  const rawBody = post.body ?? '';
  const googleNewsItems = parseGoogleNewsItems(rawBody);
  const isGoogleNews = googleNewsItems.length > 0;
  const { html: articleHtml, hasContent: hasArticleBody } = prepareArticleBodyForDisplay(
    rawBody,
    post.original_url ?? '',
    post.title,
  );
  const bodyDuplicatesExcerpt =
    hasArticleBody && isBodyRedundantWithExcerpt(articleHtml, post.excerpt);
  /** Show the body block only when it adds substance beyond the deck under the headline. */
  const showArticleBody = (hasArticleBody && !bodyDuplicatesExcerpt) || isGoogleNews;
  const url = absoluteUrl(`/news/${post.slug}`);
  const storyImages = extractArticleImages(
    post.image_url,
    decodeHtmlEntities(post.title),
    post.category,
    rawBody || articleHtml,
  );
  const heroSrc = storyImages[0]?.src || resolvePostImageUrl(post.image_url);
  const relatedImages = storyImages.slice(1);
  const desc = clipMetaDescription(cleanDisplayExcerpt(post.excerpt, post.title));
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

  const normalizedTitle = decodeHtmlEntities(post.title).trim();
  let displayDescription = post.excerpt ? cleanDisplayExcerpt(post.excerpt) : '';

  // Clean trailing desk suffixes often present in feeds (e.g. "| World News", "| India")
  if (displayDescription) {
    displayDescription = displayDescription
      .replace(/\s*\|\s*(World News|World|India|Politics|Business|Sports|Technology|Tech|Science|Health|General|Economy|Entertainment)[^.]*$/i, '')
      .trim();
  }

  // If missing or identical to the title, attempt to extract the opening summary sentence from rawBody
  if (!displayDescription || displayDescription.toLowerCase() === normalizedTitle.toLowerCase()) {
    if (rawBody && !isGoogleNews) {
      const plain = stripHtmlToPlain(rawBody);
      if (plain && plain.toLowerCase() !== normalizedTitle.toLowerCase()) {
        displayDescription = cleanDisplayExcerpt(plain, null, 280);
      }
    }
  }

  // Final check: if displayDescription equals title, don't show an exact duplicate
  if (displayDescription.toLowerCase() === normalizedTitle.toLowerCase()) {
    displayDescription = '';
  }

  const excerptText = displayDescription || cleanDisplayExcerpt(post.excerpt, post.title);
  const storyTimeline = extractTimelineFromContent(post.body || '');

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="pd-subnav-bar border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-3 py-1.5 sm:px-6 sm:py-2 lg:px-8 2xl:max-w-[1440px]">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <AnimatedBackButton href="/news" label="All news" />
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-hidden text-[10px] sm:text-[11px] font-medium tracking-wide text-slate-400">
              <Link href="/" className="shrink-0 transition hover:text-teal-200">
                Home
              </Link>
              <span className="text-slate-600">/</span>
              <Link href="/news" className="hidden xs:inline shrink-0 transition hover:text-teal-200">
                News
              </Link>
              <span className="hidden xs:inline text-slate-600">/</span>
              <Link href={categoryHref(post.category)} className="truncate text-teal-300/95 font-semibold transition hover:text-teal-200">
                {categoryLabel(post.category)}
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="pd-article-container mx-auto max-w-7xl px-3.5 pb-14 pt-4 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8 2xl:max-w-[1440px]">
        <div className="pd-article-layout-grid grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10">
          <div className="min-w-0 w-full">
            <article className="pd-main-article relative w-full min-w-0" itemScope itemType="https://schema.org/NewsArticle">
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
              />

              <header className="pd-article-header mb-6 sm:mb-8 w-full space-y-3.5 sm:space-y-4">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs">
                  <Link
                    href={categoryHref(post.category)}
                    aria-label={`Browse all ${categoryLabel(post.category)} stories`}
                    className={`inline-flex w-fit max-w-full items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] sm:text-[12px] font-bold shadow-xs ring-1 transition hover:brightness-[0.98] ${categoryChipClass(post.category)}`}
                  >
                    <CategoryGlyph name={post.category} className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 text-left">{categoryLabel(post.category)}</span>
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-[12px] text-slate-500 font-medium">
                    <time className="tabular-nums" dateTime={post.published_at} title={post.published_at}>
                      {formatPublishedAt(post.published_at)}
                    </time>
                    <span className="text-slate-300" aria-hidden>
                      ·
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Eye className="h-3.5 w-3.5 opacity-70" strokeWidth={2.25} aria-hidden />
                      {post.view_count.toLocaleString()} views
                    </span>
                  </div>
                </div>

                <h1
                  id="article-headline"
                  itemProp="headline"
                  className="w-full font-display text-2xl xs:text-3xl font-bold leading-[1.24] tracking-tight text-slate-950 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.18] [overflow-wrap:anywhere]"
                >
                  <RenderTextWithFlags text={decodeHtmlEntities(post.title)} flagSize={28} />
                </h1>

                {displayDescription ? (
                  <p
                    id="article-excerpt"
                    itemProp="description"
                    className="w-full text-base sm:text-lg lg:text-[1.2rem] leading-relaxed sm:leading-[1.65] font-normal text-slate-600 sm:text-slate-700 [overflow-wrap:anywhere]"
                  >
                    {displayDescription}
                  </p>
                ) : null}

                {/* Top Engagement Bar (Likes, Bookmarks, Share) */}
                <div className="pt-1 sm:pt-2 space-y-3">
                  <ArticleEngagementBar
                    postId={post.id}
                    slug={post.slug}
                    title={post.title}
                    category={post.category}
                    initialLikes={post.like_count}
                  />

                  {/* AI Listen to Article Audio Player */}
                  <ArticleAudioPlayer
                    title={post.title}
                    excerpt={displayDescription || excerptText}
                    takeaways={takeaways}
                    body={rawBody || articleHtml}
                    category={post.category}
                  />
                </div>
              </header>

              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs shadow-slate-900/5">
                {/* Story Hero Image */}
                <div className="w-full">
                  <ParticleStoryImageStack
                    mainImageSrc={heroSrc}
                    mainTitle={post.title}
                    category={post.category}
                    relatedImages={relatedImages}
                  />
                </div>

                {/* Unified Editorial Article Story Content with Generous Padding */}
                <div className="p-4 sm:p-8 lg:p-10 border-b border-slate-100 space-y-5 sm:space-y-6">
                  <StoryOverviewBox
                    excerpt={displayDescription ? null : excerptText}
                    takeawaysRaw={takeaways}
                  />

                  {storyTimeline && storyTimeline.length > 0 && (
                    <StoryTimeline
                      timeline={storyTimeline}
                      category={post.category}
                      storyTitle={post.title}
                    />
                  )}

                  {isGoogleNews ? (
                    <div className="pt-5 sm:pt-6 border-t border-slate-100">
                      <MediaCoveragePerspectives
                        items={googleNewsItems}
                        primaryUrl={post.original_url}
                        storyTitle={post.title}
                      />
                    </div>
                  ) : showArticleBody ? (
                    <div className="pt-5 sm:pt-6 border-t border-slate-100">
                      {isMarkdownStory(rawBody) ? (
                        <RichStoryBody content={rawBody} theme="light" />
                      ) : (
                        <div
                          className="article-prose article-detail-prose prose-policy w-full max-w-none overflow-x-auto text-left feed-article-body [overflow-wrap:anywhere] [word-break:break-word] text-[15px] sm:text-base leading-relaxed text-slate-800"
                          dangerouslySetInnerHTML={{ __html: articleHtml }}
                          suppressHydrationWarning
                        />
                      )}
                    </div>
                  ) : null}
                </div>

                {/* News Publisher Credit & Original Source Attribution */}
                <div className="p-4 sm:p-8 bg-slate-50/50 border-b border-slate-100">
                  <PublisherCreditCard
                    originalUrl={post.original_url}
                    sourceFeed={post.source_feed}
                    author={post.author}
                    publishedAt={post.published_at}
                    category={post.category}
                  />
                </div>

                {/* Navigation and Desk Link */}
                <div className="bg-white p-4 sm:p-6 lg:px-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                      href={categoryHref(post.category)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 transition hover:text-teal-800"
                    >
                      <span>Explore all {categoryLabel(post.category)} stories</span>
                      <span aria-hidden>→</span>
                    </Link>
                    <p className="text-[11px] text-slate-400">
                      {!post.original_url || post.source_feed === 'PolicyDrift Editorial Desk'
                        ? 'PolicyDrift Editorial Desk · Independent in-depth reporting.'
                        : 'Syndicated feed content with full publisher credit.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* VIP WhatsApp & Telegram Instant Community Channel Hub */}
              <CommunityJoinBanner variant="full" className="mt-8" />

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
