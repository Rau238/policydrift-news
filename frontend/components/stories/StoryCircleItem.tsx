'use client';

import React from 'react';
import type { StoryGroup } from '@/lib/stories-data';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { CategoryGlyph } from '@/lib/category-theme';

interface StoryCircleItemProps {
  group: StoryGroup;
  isViewed: boolean;
  onClick: () => void;
}

export function StoryCircleItem({ group, isViewed, onClick }: StoryCircleItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-1.5 shrink-0 focus:outline-none cursor-pointer transition-transform duration-200 active:scale-95"
      aria-label={`View ${group.title} stories (${group.slides.length} stories)`}
    >
      {/* Outer Circular Ring with Vibrant Warm Editorial Gradient */}
      <div
        className={`relative rounded-full transition-all duration-200 ${
          isViewed
            ? 'p-[2px] bg-slate-600/70 group-hover:bg-slate-500'
            : 'p-[2.5px] bg-gradient-to-tr from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] group-hover:scale-105'
        }`}
      >
        {/* Inner Dark Padding Ring */}
        <div className="rounded-full bg-slate-950 p-[2px] [clip-path:circle(50%_at_50%_50%)]">
          {/* Avatar Photo */}
          <div className="relative h-16 w-16 sm:h-[4.25rem] sm:w-[4.25rem] rounded-full overflow-hidden bg-slate-900 [clip-path:circle(50%_at_50%_50%)]">
            <RemoteStoryImage
              src={group.coverImage}
              alt={group.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 [clip-path:circle(50%_at_50%_50%)]"
              category={group.category}
              compact
              hideCaption
            />
          </div>
        </div>

        {/* Category Glyph Badge on Bottom Right of Circle */}
        <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-slate-900 text-amber-400">
          <CategoryGlyph name={group.category} className="h-2.5 w-2.5 text-amber-400" />
        </div>

        {/* LIVE badge for Breaking desk */}
        {group.badgeText && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider text-white ring-1 ring-white/40">
            {group.badgeText}
          </div>
        )}
      </div>

      {/* Story Desk Name */}
      <span
        className={`text-xs font-semibold tracking-tight truncate max-w-[80px] sm:max-w-[88px] text-center transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
          isViewed
            ? 'text-slate-200 group-hover:text-white'
            : 'text-white group-hover:text-amber-300'
        }`}
      >
        {group.title}
      </span>
    </button>
  );
}
