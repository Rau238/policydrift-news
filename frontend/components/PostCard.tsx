'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { PostListItem } from '@/lib/types';
import { formatPublishedAt } from '@/lib/format';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import {
  categoryCardRingClass,
  categoryCardStripeClass,
  categoryChipClass,
  categoryLabel,
  CategoryGlyph,
} from '@/lib/category-theme';
import { resolvePostImageUrl } from '@/lib/story-image';
import { decodeHtmlEntities } from '@/lib/sanitize';

type Props = {
  post: PostListItem;
  priority?: boolean;
  compact?: boolean;
  gridCell?: boolean;
  index?: number;
};

export function PostCard({ post, priority, compact, gridCell, index = 0 }: Props) {
  const ring = categoryCardRingClass(post.category);
  const imageSrc = resolvePostImageUrl(post.image_url);
  const href = `/news/${post.slug}`;
  const thumbLabel = decodeHtmlEntities(post.title).trim() || 'News story';

  const bodyClass = compact ? 'gap-2 p-4 sm:p-4' : 'gap-2.5 p-3.5 sm:p-5';
  const titleClass = compact
    ? 'font-display text-[0.9375rem] font-bold leading-snug tracking-tight text-ink line-clamp-3 sm:text-base'
    : 'font-display text-lg font-bold leading-snug tracking-tight text-ink line-clamp-3 max-lg:text-base sm:text-[1.125rem] sm:leading-snug';

  return (
    <article
      className={`min-h-0 ${compact ? (gridCell ? 'h-full w-full min-w-0' : 'h-full w-[min(300px,calc(100vw-2rem))] shrink-0 snap-start sm:w-[300px]') : gridCell ? 'h-full min-w-0' : ''}`}
    >
      <Link
        href={href}
        className={`group flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 max-lg:rounded-xl sm:rounded-2xl ${compact ? '' : 'hover:ring-accent/12'} ${ring}`}
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-200/80">
          <RemoteStoryImage
            src={imageSrc}
            alt={thumbLabel}
            title={thumbLabel}
            priority={priority}
            className="h-full w-full object-cover object-center transition duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <div
          className={`h-[3px] w-full shrink-0 bg-gradient-to-r ${categoryCardStripeClass(post.category)}`}
          aria-hidden
        />
        <div className={`flex min-h-0 flex-1 flex-col ${bodyClass}`}>
          <div className="flex items-start justify-between gap-2">
            <span
              className={`inline-flex max-w-[calc(100%-2rem)] items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-[11px] ${categoryChipClass(post.category)}`}
            >
              <CategoryGlyph name={post.category} className="h-3 w-3 shrink-0" />
              <span className="truncate">{categoryLabel(post.category)}</span>
            </span>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-accent"
              strokeWidth={2.25}
              aria-hidden
            />
          </div>
          <h2 className={`mt-2 ${titleClass}`}>{post.title}</h2>
          {!compact && post.excerpt ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 sm:line-clamp-3">{post.excerpt}</p>
          ) : null}
          {compact && post.excerpt ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">{post.excerpt}</p>
          ) : null}
          <time
            dateTime={post.published_at}
            title={post.published_at}
            className={`mt-auto pt-2 font-semibold tabular-nums text-slate-400 ${compact ? 'text-[11px]' : 'text-xs'}`}
          >
            {formatPublishedAt(post.published_at)}
          </time>
        </div>
      </Link>
    </article>
  );
}
