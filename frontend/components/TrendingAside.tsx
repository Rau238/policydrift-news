import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import type { PostListItem } from '@/lib/types';
import { formatPublishedAt } from '@/lib/format';
import { categoryLabel, CategoryGlyph } from '@/lib/category-theme';

export function TrendingAside({ posts }: { posts: PostListItem[] }) {
  if (!posts.length) return null;
  const displayPosts = posts.slice(0, 5);

  return (
    <aside className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="relative border-b border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 ring-1 ring-amber-400/30">
              <TrendingUp className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-sm font-bold tracking-tight text-slate-900">
                Trending Wire
              </h2>
              <p className="text-[10.5px] font-medium text-slate-500">
                Most read across all desks
              </p>
            </div>
          </div>
          <Link
            href="/trending-india"
            className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline"
          >
            See all
          </Link>
        </div>
      </div>

      <ol className="relative divide-y divide-slate-100 p-2">
        {displayPosts.map((p, i) => (
          <li key={p.id}>
            <Link
              href={`/news/${p.slug}`}
              className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50/90"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-black text-slate-700 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.2 text-[9.5px] font-bold text-slate-700">
                    <CategoryGlyph name={p.category} className="h-2.5 w-2.5 text-teal-600" />
                    {categoryLabel(p.category)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    • {formatPublishedAt(p.published_at)}
                  </span>
                </div>
                <h3 className="mt-1 line-clamp-2 text-xs font-bold leading-snug text-slate-900 transition-colors group-hover:text-teal-700">
                  {p.title}
                </h3>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
