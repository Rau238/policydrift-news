import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { newsArticleJsonLd } from '@/lib/jsonld';
import { sanitizeArticleHtml } from '@/lib/sanitize';
import { resolveOgImageUrl, resolvePostImageUrl } from '@/lib/story-image';
import { absoluteUrl, siteName } from '@/lib/site';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { categoryChipClass, categoryHref, categoryLabel, CategoryGlyph } from '@/lib/categories';
import { ArrowLeft, ExternalLink, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Not found' };
  const url = absoluteUrl(`/blog/${post.slug}`);
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

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const cleanHtml = sanitizeArticleHtml(post.body);
  const url = absoluteUrl(`/blog/${post.slug}`);
  const heroSrc = resolvePostImageUrl(post.image_url);
  const desc = post.excerpt?.trim() || post.title;
  const jsonLd = newsArticleJsonLd({
    url,
    title: post.title,
    description: desc,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    imageUrls: [resolveOgImageUrl(post.image_url)],
    section: post.category,
    articleBody: post.excerpt?.trim() || undefined,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/80 via-white to-slate-50/90">
      <article className="relative mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <Link
          href="/blog"
          className="group mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-accent"
        >
          <ArrowLeft
            className="h-4 w-4 transition group-hover:-translate-x-0.5"
            strokeWidth={2.25}
            aria-hidden
          />
          All stories
        </Link>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="relative border-b border-slate-100 bg-gradient-to-br from-slate-50/90 via-white to-teal-50/20 px-6 py-8 sm:px-10 sm:py-10">
            <div
              className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-teal-400/15 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-slate-200/40 blur-3xl"
              aria-hidden
            />
            <nav className="relative text-xs font-medium uppercase tracking-wider text-slate-500">
              <Link href="/" className="transition hover:text-accent">
                Home
              </Link>
              <span className="mx-2 text-slate-300">/</span>
              <Link href="/blog" className="transition hover:text-accent">
                Stories
              </Link>
              <span className="mx-2 text-slate-300">/</span>
              <Link href={categoryHref(post.category)} className="transition hover:text-accent">
                {categoryLabel(post.category)}
              </Link>
            </nav>

            <header className="relative mt-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-600">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${categoryChipClass(post.category)}`}
                >
                  <CategoryGlyph name={post.category} className="h-3.5 w-3.5" />
                  {categoryLabel(post.category)}
                </span>
                <span className="hidden text-slate-300 sm:inline" aria-hidden>
                  ·
                </span>
                <time className="tabular-nums text-slate-600" dateTime={post.published_at}>
                  {formatDate(post.published_at)}
                </time>
                <span className="text-slate-300" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Eye className="h-3.5 w-3.5 opacity-70" strokeWidth={2.25} aria-hidden />
                  {post.view_count.toLocaleString()} views
                </span>
              </div>
              <h1 className="mt-5 max-w-4xl text-balance font-display text-3xl font-bold leading-[1.12] tracking-tight text-ink sm:text-4xl md:text-[2.65rem] md:leading-[1.1]">
                {post.title}
              </h1>
              {post.excerpt ? (
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">{post.excerpt}</p>
              ) : null}
            </header>
          </div>

          <div className="px-6 pb-2 pt-8 sm:px-10 sm:pt-10">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <div className="relative aspect-[16/9] w-full sm:aspect-[2/1]">
                <RemoteStoryImage
                  src={heroSrc}
                  alt={post.title}
                  priority
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent"
                  aria-hidden
                />
              </div>
            </div>
          </div>

          <div className="px-6 pb-10 pt-8 sm:px-10 sm:pb-12 sm:pt-10">
            <div
              className="article-prose prose-policy mx-auto"
              dangerouslySetInnerHTML={{ __html: cleanHtml }}
              suppressHydrationWarning
            />
          </div>

          <footer className="border-t border-slate-100 bg-slate-50/80 px-6 py-8 sm:px-10">
            <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{siteName}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                This summary is produced for readers on {siteName}. Always refer to the original publisher for full
                context and updates.
              </p>
              <a
                href={post.original_url}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-accent transition hover:border-accent/45 hover:bg-teal-50/80 sm:w-auto sm:justify-start"
                rel="noopener noreferrer"
                target="_blank"
              >
                Read original article
                <ExternalLink className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2.25} aria-hidden />
              </a>
            </div>
            <Link
              href="/blog"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-dark"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              Back to all stories
            </Link>
          </footer>
        </div>
      </article>
    </div>
  );
}
