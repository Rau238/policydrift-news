import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import type { PostListItem } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { categoryLabel, CategoryGlyph } from '@/lib/category-theme';

export function TrendingAside({ posts }: { posts: PostListItem[] }) {
  if (!posts.length) return null;
  return (
    <aside className="relative overflow-hidden rounded-2xl border border-slate-200 bg-surface-card max-lg:rounded-2xl max-lg:shadow-sm lg:rounded-3xl">
      <div
        className="pointer-events-none absolute left-0 top-0 h-full "
        aria-hidden
      />
      <div className="relative border-b border-slate-200/90 px-4 py-4 pl-5 max-lg:px-4 max-lg:py-3.5 max-lg:pl-5 sm:px-7 sm:py-5 sm:pl-8">
        <div className="flex items-center gap-2.5 max-lg:gap-2.5 sm:gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white max-lg:h-10 max-lg:w-10 sm:h-11 sm:w-11">
            <TrendingUp className="h-[1.15rem] w-[1.15rem] text-accent-dark max-lg:h-[1.15rem] max-lg:w-[1.15rem] sm:h-5 sm:w-5" strokeWidth={2.5} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
              Trending now
            </h2>
            <p className="text-[11px] font-medium text-ink-soft sm:text-xs">
              Most read in the last 7 days
            </p>
          </div>
        </div>
      </div>
      <ol className="relative divide-y divide-slate-200/80 px-2 py-0.5 max-lg:px-2 sm:px-4 sm:py-1">
        {posts.map((p, i) => (
          <li key={p.id}>
            <div className="flex gap-2.5 rounded-lg py-3 pl-0.5 pr-0.5 transition hover:bg-surface/80 max-lg:gap-2.5 max-lg:py-2.5 sm:gap-3 sm:rounded-xl sm:py-3.5 sm:pl-2 sm:pr-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent-soft text-xs font-black text-accent-dark max-lg:h-8 max-lg:w-8 max-lg:text-xs sm:h-9 sm:w-9 sm:text-sm">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200/90 bg-surface px-2 py-0.5 text-[10px] font-bold text-accent-dark">
                  <CategoryGlyph name={p.category} className="h-3 w-3 text-accent" />
                  {categoryLabel(p.category)}
                </span>
                <Link
                  href={`/blog/${p.slug}`}
                  className="mt-1.5 block line-clamp-2 text-sm font-semibold leading-snug text-ink transition hover:text-accent-dark"
                >
                  {p.title}
                </Link>
                <p className="mt-1 text-[11px] text-ink-soft">
                  {formatDate(p.published_at)} · {p.view_count.toLocaleString()} views
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
