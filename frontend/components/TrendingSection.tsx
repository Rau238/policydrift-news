import Link from 'next/link';
import { Flame, ArrowUpRight } from 'lucide-react';
import type { PostListItem } from '@/lib/types';
import { formatPublishedAt } from '@/lib/format';
import { decodeHtmlEntities } from '@/lib/sanitize';
import {
  categoryChipClass,
  categoryLabel,
  CategoryGlyph,
} from '@/lib/category-theme';

const MAX_ITEMS = 6;

export function TrendingSection({ posts }: { posts: PostListItem[] }) {
  if (!posts.length) return null;

  const items = posts.slice(0, MAX_ITEMS);

  return (
    <aside
      aria-labelledby="trending-section-heading"
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04] lg:rounded-3xl"
    >
      {/* Header */}
      <div className="border-b border-slate-200/80 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-200/80 bg-rose-50 text-rose-600">
            <Flame
              className="h-5 w-5 text-rose-500"
              strokeWidth={2.25}
              aria-hidden
            />
            <span
              className="absolute inset-0 animate-ping rounded-full bg-rose-400/20"
              aria-hidden
            />
          </span>
          <div className="min-w-0">
            <h2
              id="trending-section-heading"
              className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl"
            >
              Trending Stories
            </h2>
            <p className="text-[11px] font-medium text-ink-soft sm:text-xs">
              Fastest velocity and engagement in the last hour
            </p>
          </div>
        </div>
      </div>

      {/* Numbered list */}
      <ol className="divide-y divide-slate-100 p-2 sm:p-3">
        {items.map((p, i) => {
          const title = decodeHtmlEntities(p.title);
          const rank = i + 1;
          const views = p.views_1h ?? p.view_count ?? 0;

          return (
            <li key={p.id}>
              <Link
                href={`/news/${p.slug}`}
                className="group flex items-start gap-3.5 rounded-xl p-2.5 transition hover:bg-slate-50/80 sm:gap-4 sm:p-3"
              >
                {/* Rank badge */}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black sm:h-9 sm:w-9 sm:text-sm ${
                    rank === 1
                      ? 'border border-rose-200 bg-rose-50 text-rose-600'
                      : rank === 2
                        ? 'border border-orange-200 bg-orange-50 text-orange-600'
                        : rank === 3
                          ? 'border border-amber-200 bg-amber-50 text-amber-600'
                          : 'border border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {rank}
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Category chip */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${categoryChipClass(p.category)}`}
                    >
                      <CategoryGlyph
                        name={p.category}
                        className="h-3 w-3 shrink-0"
                      />
                      <span>{categoryLabel(p.category)}</span>
                    </span>

                    {views > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-200/60">
                        {views.toLocaleString()} {views === 1 ? 'view' : 'views'} this hour
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className="mt-1.5 font-display text-sm font-bold leading-snug text-ink transition group-hover:text-rose-600 line-clamp-2 sm:text-[15px]"
                    title={title}
                  >
                    {title}
                  </h3>

                  {/* Meta row */}
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                    <time dateTime={p.published_at}>
                      {formatPublishedAt(p.published_at)}
                    </time>
                    <ArrowUpRight
                      size={14}
                      className="ml-auto text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-rose-500"
                    />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
