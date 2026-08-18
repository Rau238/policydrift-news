'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, LayoutGrid } from 'lucide-react';
import type { PostListItem } from '@/lib/types';
import { PostCard } from '@/components/PostCard';
import { categoryLabel, categoryHref, CategoryGlyph, categoryChipClass } from '@/lib/category-theme';

type Props = {
  mainTitle: string;
  originalUrl: string;
  sourceFeed?: string | null;
  category: string;
  relatedPosts: PostListItem[];
};

export function MultiSourceCoverage({
  category,
  relatedPosts,
}: Props) {
  if (!relatedPosts || relatedPosts.length === 0) return null;

  const deskName = categoryLabel(category);
  const deskLink = categoryHref(category);

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-7">
      {/* Section Header (Light Theme Aligned) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${categoryChipClass(category)}`}
            >
              <CategoryGlyph name={category} className="h-3.5 w-3.5 shrink-0" />
              <span>{deskName} Desk</span>
            </span>
          </div>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
            More in {deskName}
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Continue reading verified coverage and related developments on this desk.
          </p>
        </div>

        {/* View All Button */}
        <Link
          href={deskLink}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
        >
          <LayoutGrid className="h-3.5 w-3.5 text-slate-500" />
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((p, i) => (
          <div key={p.id} className="min-w-0">
            <PostCard post={p} gridCell index={i + 1} />
          </div>
        ))}
      </div>
    </section>
  );
}
