import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import type { PostListItem } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { categoryLabel, CategoryGlyph } from '@/lib/category-theme';

export function TrendingAside({ posts }: { posts: PostListItem[] }) {
  if (!posts.length) return null;
  return (
    <aside className="relative overflow-hidden rounded-3xl border border-slate-200 bg-surface-card">
      <div
        className="pointer-events-none absolute left-0 top-0 h-full "
        aria-hidden
      />
      <div className="relative border-b border-slate-200/90   px-6 py-5 pl-7 sm:px-7 sm:pl-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white">
            <TrendingUp className="h-5 w-5 text-accent-dark" strokeWidth={2.5} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">Trending now</h2>
            <p className="text-xs font-medium text-ink-soft">Most read in the last 7 days</p>
          </div>
        </div>
      </div>
      <ol className="relative divide-y divide-slate-200/80 px-3 py-1 sm:px-4">
        {posts.map((p, i) => (
          <li key={p.id}>
            <div className="flex gap-3 rounded-xl py-3.5 pl-1 pr-1 transition hover:bg-surface/80 sm:pl-2 sm:pr-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent-soft text-sm font-black text-accent-dark">
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
