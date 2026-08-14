import Link from 'next/link';
import { TrendingUp, ArrowUpRight, Eye } from 'lucide-react';
import type { PostListItem } from '@/lib/types';
import { formatPublishedAt } from '@/lib/format';
import { decodeHtmlEntities } from '@/lib/sanitize';
import { resolvePostImageUrl } from '@/lib/story-image';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import {
  categoryChipClass,
  categoryLabel,
  CategoryGlyph,
} from '@/lib/category-theme';

const MAX_ITEMS = 6;

export function PopularSection({
  posts,
}: {
  posts: PostListItem[];
  period?: string;
}) {
  if (!posts.length) return null;

  const items = posts.slice(0, MAX_ITEMS);

  return (
    <section
      aria-labelledby="popular-section-heading"
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04] lg:rounded-3xl"
    >
      {/* Header */}
      <div className="border-b border-slate-200/80 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-200/80 bg-teal-50 text-teal-600 shadow-xs sm:rounded-2xl">
              <TrendingUp className="h-5 w-5 text-teal-600" strokeWidth={2.25} aria-hidden />
              <span className="absolute inset-0 animate-ping rounded-xl bg-teal-400/20 sm:rounded-2xl" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2
                id="popular-section-heading"
                className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl"
              >
                Most Popular
              </h2>
              <p className="text-[11px] font-medium text-ink-soft sm:text-xs">
                Top stories with highest reader engagement
              </p>
            </div>
          </div>


        </div>
      </div>

      {/* Stories List */}
      <div className="divide-y divide-slate-100 p-2 sm:p-3">
        {items.map((post, index) => {
          const title = decodeHtmlEntities(post.title);
          const imageSrc = resolvePostImageUrl(post.image_url);
          const views = post.period_views ?? post.view_count ?? 0;
          const rank = index + 1;

          return (
            <Link
              key={post.id}
              href={`/news/${post.slug}`}
              className="group flex items-start gap-3.5 rounded-xl p-2.5 transition duration-200 hover:bg-teal-50/40 sm:gap-4 sm:p-3"
            >
              {/* Thumbnail with Rank Badge */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200/80 shadow-xs sm:h-22 sm:w-22">
                <RemoteStoryImage
                  src={imageSrc}
                  alt={title}
                  title={title}
                  category={post.category}
                  className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                  hideCaption
                />
                <span
                  className={`absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black shadow-xs ${rank === 1
                      ? 'bg-teal-600 text-white'
                      : rank === 2
                        ? 'bg-teal-700/90 text-white'
                        : rank === 3
                          ? 'bg-teal-800/80 text-white'
                          : 'bg-slate-900/70 text-white backdrop-blur-xs'
                    }`}
                >
                  {rank}
                </span>
              </div>

              {/* Story Content */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${categoryChipClass(post.category)}`}
                  >
                    <CategoryGlyph name={post.category} className="h-3 w-3 shrink-0" />
                    <span>{categoryLabel(post.category)}</span>
                  </span>

                  {views > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200/60">
                      <Eye className="h-3 w-3" />
                      {views.toLocaleString()} {views === 1 ? 'view' : 'views'}
                    </span>
                  )}
                </div>

                <h3 className="mt-1.5 font-display text-sm font-bold leading-snug text-ink transition duration-200 group-hover:text-teal-700 line-clamp-2 sm:text-[15px]">
                  {title}
                </h3>

                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                  <time dateTime={post.published_at}>
                    {formatPublishedAt(post.published_at)}
                  </time>
                  <ArrowUpRight
                    size={14}
                    className="ml-auto text-slate-300 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-teal-600"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

