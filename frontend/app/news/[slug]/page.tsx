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
import { TrendingAside } from '@/components/TrendingAside';
import {
  categoryChipClass,
  categoryHref,
  categoryLabel,
  CategoryGlyph,
  categoryNavPillClass,
} from '@/lib/categories';
import { CATEGORY_INTRO, categoryFromSlug } from '@/lib/category-routes';
import { ArrowLeft, ExternalLink, Eye } from 'lucide-react';

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
  const desc = post.excerpt?.trim() || post.title;
  const ogImage = resolveOgImageUrl(post.image_url);
  return {
    title: post.title,
    description: desc,
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

  const rawBody = post.body ?? '';
  const { html: articleHtml, hasContent: hasArticleBody } = prepareArticleBodyForDisplay(
    rawBody,
    post.original_url ?? '',
  );
  const url = absoluteUrl(`/news/${post.slug}`);
  const heroSrc = resolvePostImageUrl(post.image_url);
  const desc = post.excerpt?.trim() || post.title;
  const articleBodyPlain = stripHtmlToPlain(rawBody);
  const jsonLd = newsArticleJsonLd({
    url,
    title: post.title,
    description: desc,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    imageUrls: [resolveOgImageUrl(post.image_url)],
    section: post.category,
    articleBody: articleBodyPlain || post.excerpt?.trim() || undefined,
  });
  const feedHostname = feedSourceHostname(post.source_feed);

  return (
    <div className="min-h-screen bg-paper">
      <article className="relative mx-auto max-w-2xl px-4 pb-12 pt-5 sm:px-6 sm:pb-14 sm:pt-7">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <Link
          href="/news"
          className="group mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-accent"
        >
          <ArrowLeft
            className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5"
            strokeWidth={2.25}
            aria-hidden
          />
          News
        </Link>

        <header className="border-b border-slate-200/90 pb-5">
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

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-500">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${categoryChipClass(post.category)}`}
            >
              <CategoryGlyph name={post.category} className="h-3 w-3" />
              {categoryLabel(post.category)}
            </span>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <time className="tabular-nums" dateTime={post.published_at} title={post.published_at}>
              {formatPublishedAt(post.published_at)}
            </time>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3 opacity-70" strokeWidth={2.25} aria-hidden />
              {post.view_count.toLocaleString()}
            </span>
          </div>

          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
            Syndicated article
            {feedHostname ? (
              <>
                {' '}
                <span className="font-normal normal-case tracking-normal text-slate-500">
                  · via {feedHostname}
                </span>
              </>
            ) : null}
          </p>

          <h1 className="mt-4 text-left text-balance font-display text-[1.625rem] font-bold leading-snug tracking-tight text-ink sm:text-[1.875rem] sm:leading-tight">
            {decodeHtmlEntities(post.title)}
          </h1>
          {post.excerpt ? (
            <p className="mt-3 text-left text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
              {decodeHtmlEntities(post.excerpt)}
            </p>
          ) : null}
        </header>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100 shadow-sm ring-1 ring-slate-900/[0.03]">
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
            className="article-prose article-detail-prose prose-policy feed-article-body mt-7 w-full overflow-x-auto text-left [overflow-wrap:anywhere] [word-break:break-word]"
            dangerouslySetInnerHTML={{ __html: articleHtml }}
            suppressHydrationWarning
          />
        ) : (
          <div className="mt-7 rounded-lg border border-amber-200/90 bg-amber-50/80 px-4 py-3 text-left text-sm leading-relaxed text-amber-950">
            <p className="font-medium text-amber-900">No article text in this feed item.</p>
            <p className="mt-1 text-[13px] text-amber-900/85">
              Open the publisher link below for the full story.
            </p>
          </div>
        )}

        <footer className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Text above is from the syndicated RSS feed (sanitized for safe display). For the latest version, updates,
            and full context, use the publisher link.
          </p>
          <a
            href={post.original_url}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark sm:w-auto sm:justify-center"
            rel="noopener noreferrer"
            target="_blank"
          >
            Open original
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
          </a>
          <Link
            href="/news"
            className="mt-6 flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
            All news
          </Link>
        </footer>
      </article>
    </div>
  );
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
