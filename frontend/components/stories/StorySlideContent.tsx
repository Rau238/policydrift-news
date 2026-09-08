'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { StorySlide } from '@/lib/stories-data';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { categoryLabel, CategoryGlyph } from '@/lib/category-theme';
import { formatPublishedAt } from '@/lib/format';
import { decodeHtmlEntities } from '@/lib/sanitize';
import { ArrowUpRight, Clock, Eye, Sparkles } from 'lucide-react';

interface StorySlideContentProps {
  slide: StorySlide;
  onLinkClick?: () => void;
}

export function StorySlideContent({ slide, onLinkClick }: StorySlideContentProps) {
  const cleanTitle = decodeHtmlEntities(slide.title);
  const cleanExcerpt = slide.excerpt ? decodeHtmlEntities(slide.excerpt) : null;
  const author = slide.author || slide.source_feed || 'NewsFree365 Desk';

  return (
    <div className="relative h-full w-full overflow-hidden select-none bg-slate-950 flex flex-col justify-between">
      {/* Background Visual Media with Subtle Slow Pan */}
      <motion.div
        key={slide.id}
        initial={{ scale: 1.08, opacity: 0.85 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute inset-0 h-full w-full"
      >
        <RemoteStoryImage
          src={slide.image_url || ''}
          alt={cleanTitle}
          className="h-full w-full object-cover"
          category={slide.category}
          priority
        />

        {/* Dual Gradient Vignettes for Superior Readability */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent z-10"
          aria-hidden
        />
      </motion.div>

      {/* Top Header Placeholder (spacer for progress bar + controls) */}
      <div className="h-16 w-full shrink-0 z-20" />

      {/* Bottom Content Area */}
      <div className="relative z-20 flex flex-col justify-end p-5 sm:p-6 text-white pb-6 sm:pb-8">
        {/* Category & Time Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2.5 py-0.5 text-xs font-semibold text-amber-300 backdrop-blur-md shadow-sm">
            <CategoryGlyph name={slide.category} className="h-3 w-3 text-amber-300" />
            <span>{categoryLabel(slide.category)}</span>
          </span>

          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-xs">
            <Clock className="h-3 w-3 opacity-80" />
            <time dateTime={slide.published_at}>{formatPublishedAt(slide.published_at)}</time>
          </span>

          {slide.reading_time_minutes ? (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-xs">
              <Sparkles className="h-3 w-3 text-teal-300" />
              {slide.reading_time_minutes} min read
            </span>
          ) : null}
        </div>

        {/* Headline */}
        <h2 className="font-display text-xl sm:text-2xl font-bold leading-tight tracking-tight text-white mb-2 line-clamp-3">
          {cleanTitle}
        </h2>

        {/* Excerpt / Summary */}
        {cleanExcerpt && (
          <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed line-clamp-2 mb-4 font-normal">
            {cleanExcerpt}
          </p>
        )}

        {/* Byline & Read Full Story CTA Button */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/15">
          <div className="min-w-0 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-300 truncate">
              {author}
            </span>
            {slide.view_count && slide.view_count > 0 ? (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                <Eye className="h-3 w-3 text-amber-300" />
                {slide.view_count.toLocaleString()}
              </span>
            ) : null}
          </div>

          <Link
            href={`/news/${slide.slug}`}
            onClick={onLinkClick}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <span>Read Article</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
