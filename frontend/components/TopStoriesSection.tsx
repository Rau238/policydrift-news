import Link from 'next/link';
import { Star, ArrowRight, Clock } from 'lucide-react';
import type { PostListItem } from '@/lib/types';
import { formatPublishedAt } from '@/lib/format';
import { decodeHtmlEntities } from '@/lib/sanitize';
import { resolvePostImageUrl } from '@/lib/story-image';
import {
  categoryChipClass,
  categoryLabel,
  CategoryGlyph,
  categoryHref,
} from '@/lib/category-theme';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { PostCard } from '@/components/PostCard';

/** Rough reading-time estimate: ~200 wpm, based on excerpt length proxy. */
function readingTimeMin(title: string, excerpt: string | null): number {
  const words = ((excerpt ?? '') + ' ' + title).split(/\s+/).length;
  return Math.max(1, Math.round((words / 200) * 10));
}

export function TopStoriesSection({ posts }: { posts: PostListItem[] }) {
  if (!posts.length) return null;

  const [hero, ...rest] = posts.slice(0, 6);
  const gridPosts = rest.slice(0, 5);

  const heroTitle = decodeHtmlEntities(hero.title);
  const heroExcerpt = hero.excerpt ? decodeHtmlEntities(hero.excerpt) : null;
  const heroImageSrc = resolvePostImageUrl(hero.image_url);
  const heroHref = `/news/${hero.slug}`;
  const heroReadMin = readingTimeMin(heroTitle, hero.excerpt);

  return (
    <section aria-labelledby="top-stories-heading">
      {/* Section header */}
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200/80 bg-amber-50">
            <Star
              className="h-4 w-4 text-amber-500"
              strokeWidth={2.25}
              aria-hidden
            />
          </span>
          <h2
            id="top-stories-heading"
            className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl"
          >
            Top Stories
          </h2>
        </div>
        <Link
          href="/news?sort=top"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-sm transition hover:border-accent/40 hover:text-accent-dark"
        >
          View more top stories
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        </Link>
      </div>

      {/* Hero card */}
      <Link
        href={heroHref}
        className="group relative mb-5 flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04] transition duration-300 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:mb-6 sm:flex-row sm:rounded-3xl"
      >
        {/* Image */}
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-200/80 sm:aspect-auto sm:h-auto sm:w-[55%]">
          <RemoteStoryImage
            src={heroImageSrc}
            alt={heroTitle}
            title={heroTitle}
            category={hero.category}
            className="h-full w-full object-cover object-center transition duration-500 ease-out group-hover:scale-[1.03]"
          />
          {/* "Top" badge */}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950 shadow-sm">
            <Star className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            Top
          </span>
        </div>

        {/* Copy */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 p-5 sm:p-7">
          {/* Category chip */}
          <span
            className={`inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${categoryChipClass(hero.category)}`}
          >
            <CategoryGlyph name={hero.category} className="h-3 w-3 shrink-0" />
            <span>{categoryLabel(hero.category)}</span>
          </span>

          <h3 className="font-display text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl md:text-3xl">
            {heroTitle}
          </h3>

          {heroExcerpt && (
            <p className="text-[0.925rem] leading-relaxed text-ink-soft sm:text-base">
              {heroExcerpt}
            </p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold tabular-nums text-slate-400">
            <time dateTime={hero.published_at}>
              {formatPublishedAt(hero.published_at)}
            </time>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" strokeWidth={2.25} aria-hidden />
              {heroReadMin} min read
            </span>
          </div>
        </div>
      </Link>

      {/* Grid of remaining posts */}
      {gridPosts.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {gridPosts.map((p, i) => (
            <li key={p.id} className="min-w-0">
              <PostCard post={p} gridCell index={i} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
