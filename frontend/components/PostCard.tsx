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

export function PostCard({ post, priority, compact, gridCell }: Props) {
  const ring = categoryCardRingClass(post.category);
  const imageSrc = resolvePostImageUrl(post.image_url);
  const href = `/news/${post.slug}`;
  const thumbLabel = decodeHtmlEntities(post.title).trim() || 'News story';
  const title = decodeHtmlEntities(post.title);

  return (
    <article
      className={`min-h-0 ${compact ? (gridCell ? 'h-full w-full min-w-0' : 'h-full w-[min(280px,calc(100vw-2rem))] shrink-0 snap-start sm:w-[280px]') : gridCell ? 'h-full min-w-0' : ''}`}
    >
      <Link
        href={href}
        className={`group flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:rounded-2xl ${ring}`}
      >
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-200/80">
          <RemoteStoryImage
            src={imageSrc}
            alt={thumbLabel}
            title={thumbLabel}
            category={post.category}
            priority={priority}
            className="h-full w-full object-cover object-center transition duration-500 ease-out group-hover:scale-[1.03]"
            hideCaption
          />
        </div>
        <div
          className={`h-[2px] w-full shrink-0 bg-gradient-to-r ${categoryCardStripeClass(post.category)}`}
          aria-hidden
        />
        <div className={`flex min-h-0 flex-1 flex-col ${compact ? 'gap-1.5 p-3' : 'gap-2 p-3.5 sm:p-4'}`}>
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${categoryChipClass(post.category)}`}
            >
              <CategoryGlyph name={post.category} className="h-3 w-3 shrink-0" />
              <span>{categoryLabel(post.category)}</span>
            </span>
            <ArrowUpRight
              className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-accent"
              strokeWidth={2.25}
              aria-hidden
            />
          </div>
          <h2
            className={`font-display font-bold tracking-tight text-ink ${
              compact
                ? 'text-[0.9rem] leading-snug sm:text-[0.95rem]'
                : 'text-[0.98rem] leading-snug sm:text-[1.05rem] sm:leading-snug'
            }`}
          >
            {title}
          </h2>
          <time
            dateTime={post.published_at}
            title={post.published_at}
            className="mt-auto pt-2 text-[11px] font-semibold tabular-nums text-slate-400"
          >
            {formatPublishedAt(post.published_at)}
          </time>
        </div>
      </Link>
    </article>
  );
}
