'use client';

import Link from 'next/link';
import type { PostListItem } from '@/lib/types';
import { formatTimeAgoUpper, formatPublishedAt } from '@/lib/format';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { getCardBgHex, categoryLabel } from '@/lib/category-theme';
import { resolvePostImageUrl } from '@/lib/story-image';
import { decodeHtmlEntities } from '@/lib/sanitize';
import { cleanDisplayExcerpt } from '@/lib/article-body';
import { RenderTextWithFlags } from '@/components/CountryFlag';

type Props = {
  post: PostListItem;
  priority?: boolean;
  compact?: boolean;
  gridCell?: boolean;
  index?: number;
};

export function PostCard({ post, priority, compact, gridCell, index }: Props) {
  const imageSrc = resolvePostImageUrl(post.image_url, post.title, post.category);
  const href = `/news/${post.slug}`;
  const thumbLabel = decodeHtmlEntities(post.title).trim() || 'News story';
  const title = decodeHtmlEntities(post.title);
  const excerpt = post.excerpt ? cleanDisplayExcerpt(post.excerpt, post.title) : null;
  const timeAgo = formatTimeAgoUpper(post.published_at);
  const fullDate = formatPublishedAt(post.published_at);
  const cardBgHex = getCardBgHex(post.category, index, post.id);
  const deskLabel = categoryLabel(post.category).toUpperCase();

  return (
    <article
      className={`pd-post-card min-h-0 ${compact ? (gridCell ? 'h-full w-full min-w-0' : 'h-full w-[min(290px,calc(100vw-2rem))] shrink-0 snap-start sm:w-[290px]') : gridCell ? 'h-full min-w-0' : ''}`}
    >
      <Link
        href={href}
        style={{
          backgroundColor: cardBgHex,
          boxShadow: `0 8px 26px -4px ${cardBgHex}50, 0 4px 12px -2px rgba(0,0,0,0.12)`,
        }}
        className="group flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 sm:rounded-[22px]"
      >
        {/* Card Header Image with Seamless Color Flush */}
        <div
          style={{ backgroundColor: cardBgHex }}
          className="relative aspect-[16/10] w-full shrink-0 overflow-hidden"
        >
          <RemoteStoryImage
            src={imageSrc}
            alt={thumbLabel}
            title={thumbLabel}
            category={post.category}
            cardBgHex={cardBgHex}
            priority={priority}
            className="h-full w-full object-cover object-center"
            hideCaption
          />
          {/* Smooth gradient flush merging photo directly into background color */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16"
            style={{
              background: `linear-gradient(to top, ${cardBgHex} 0%, ${cardBgHex}f2 25%, ${cardBgHex}a6 55%, ${cardBgHex}40 80%, transparent 100%)`,
            }}
            aria-hidden
          />
        </div>

        {/* Card Body with Vibrant Solid/Rich Background */}
        <div
          style={{ backgroundColor: cardBgHex }}
          className={`flex min-h-0 flex-1 flex-col justify-start text-white ${
            compact ? 'gap-1.5 px-3.5 pt-1.5 pb-3' : 'gap-2 px-3.5 pt-1.5 pb-3.5 sm:px-4 sm:pt-2 sm:pb-4'
          }`}
        >
          <div className="min-w-0 space-y-1">
            {/* Top Meta: Category / Desk & Relative Time */}
            <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 sm:text-[10.5px]">
              <span className="truncate">{deskLabel}</span>
              <time dateTime={post.published_at} title={fullDate} className="shrink-0 tracking-wider tabular-nums text-white/75">
                {timeAgo}
              </time>
            </div>

            {/* Headline Title */}
            <h2
              className={`font-sans font-bold leading-[1.28] tracking-tight text-white ${
                compact
                  ? 'text-[0.85rem] line-clamp-2 sm:text-[0.9rem]'
                  : 'text-[0.92rem] line-clamp-2 sm:text-[0.98rem]'
              }`}
            >
              <RenderTextWithFlags text={title} flagSize={16} />
            </h2>
          </div>

          {/* Excerpt / Summary */}
          {excerpt ? (
            <p
              className={`font-sans text-white/85 font-normal leading-[1.38] ${
                compact ? 'text-[11px] line-clamp-2' : 'text-[12px] line-clamp-2 sm:text-[12.5px]'
              }`}
            >
              {excerpt}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
