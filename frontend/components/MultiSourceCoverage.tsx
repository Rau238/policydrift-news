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
    <section className="mt-8 sm:mt-10">
      {/* Section Header (Seamless Light Theme) */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200/80 pb-3.5 sm:pb-4 mb-5 sm:mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide shadow-xs ring-1 ${categoryChipClass(category)}`}
            >
              <CategoryGlyph name={category} className="h-3.5 w-3.5 shrink-0" />
              <span>{deskName} Desk</span>
            </span>
          </div>
          <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            More in {deskName}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Continue reading verified coverage and related developments on this desk.
          </p>
        </div>

        {/* View All Button */}
        <Link
          href={deskLink}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-900 active:scale-95 shrink-0"
        >
          <LayoutGrid className="h-3.5 w-3.5 text-slate-500" />
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((p, i) => (
          <div key={p.id} className="min-w-0">
            <PostCard post={p} gridCell index={i + 1} />
          </div>
        ))}
      </div>
    </section>
  );
}
