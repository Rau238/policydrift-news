'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { PostListItem } from '@/lib/types';
import { resolvePostImageUrl } from '@/lib/story-image';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { categoryLabel, CategoryGlyph } from '@/lib/category-theme';
import { formatPublishedAt } from '@/lib/format';
import { decodeHtmlEntities } from '@/lib/sanitize';
import { cleanDisplayExcerpt } from '@/lib/article-body';
import { siteName } from '@/lib/site';
import {
  Sparkles,
  Clock,
  Feather,
  ArrowRight,
  ShieldCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';

interface EditorialSpotlightCarouselProps {
  posts: PostListItem[];
  title?: string;
  subtitle?: string;
}

const AUTOPLAY_INTERVAL = 6000; // 6s per slide

interface SlideTheme {
  cardGradient: string;
  border: string;
  glow1: string;
  glow2: string;
  badgeBg: string;
  btnBg: string;
  progressBar: string;
  activeBorder: string;
}

function getSlideTheme(cat?: string): SlideTheme {
  const norm = (cat || '').toLowerCase().trim();
  if (norm.includes('india')) {
    return {
      cardGradient: 'from-[#1c0d03] via-[#2d1405] to-[#0e0502]',
      border: 'border-amber-500/40',
      glow1: 'bg-amber-500/25',
      glow2: 'bg-orange-500/20',
      badgeBg: 'border-amber-400/40 bg-amber-500/20 text-amber-200',
      btnBg: 'from-amber-400 via-amber-500 to-orange-500 text-slate-950 shadow-amber-500/30 hover:from-amber-300 hover:to-orange-400',
      progressBar: 'from-amber-400 via-orange-400 to-amber-300',
      activeBorder: 'border-amber-500 ring-amber-500/30',
    };
  }
  if (norm.includes('politic') || norm.includes('legal') || norm.includes('governance')) {
    return {
      cardGradient: 'from-[#0a0e2a] via-[#141a4a] to-[#06081c]',
      border: 'border-indigo-400/40',
      glow1: 'bg-indigo-500/25',
      glow2: 'bg-purple-500/20',
      badgeBg: 'border-indigo-400/40 bg-indigo-500/20 text-indigo-200',
      btnBg: 'from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-indigo-500/30 hover:from-indigo-400 hover:to-purple-500',
      progressBar: 'from-indigo-400 via-purple-400 to-sky-300',
      activeBorder: 'border-indigo-500 ring-indigo-500/30',
    };
  }
  if (norm.includes('bank') || norm.includes('econom') || norm.includes('market') || norm.includes('stock')) {
    return {
      cardGradient: 'from-[#031813] via-[#083027] to-[#020e0b]',
      border: 'border-emerald-400/40',
      glow1: 'bg-emerald-500/25',
      glow2: 'bg-teal-500/20',
      badgeBg: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200',
      btnBg: 'from-emerald-400 via-teal-500 to-cyan-600 text-slate-950 shadow-emerald-500/30 hover:from-emerald-300 hover:to-teal-400',
      progressBar: 'from-emerald-400 via-teal-400 to-cyan-300',
      activeBorder: 'border-emerald-500 ring-emerald-500/30',
    };
  }
  if (norm.includes('business')) {
    return {
      cardGradient: 'from-[#160727] via-[#260d42] to-[#0c0216]',
      border: 'border-purple-400/40',
      glow1: 'bg-purple-500/25',
      glow2: 'bg-fuchsia-500/20',
      badgeBg: 'border-purple-400/40 bg-purple-500/20 text-purple-200',
      btnBg: 'from-purple-500 via-purple-600 to-indigo-600 text-white shadow-purple-500/30 hover:from-purple-400 hover:to-indigo-500',
      progressBar: 'from-purple-400 via-fuchsia-400 to-indigo-300',
      activeBorder: 'border-purple-500 ring-purple-500/30',
    };
  }
  if (norm.includes('world')) {
    return {
      cardGradient: 'from-[#061430] via-[#0e2759] to-[#030a1c]',
      border: 'border-blue-400/40',
      glow1: 'bg-blue-500/25',
      glow2: 'bg-sky-500/20',
      badgeBg: 'border-blue-400/40 bg-blue-500/20 text-blue-200',
      btnBg: 'from-blue-500 via-sky-500 to-cyan-600 text-white shadow-blue-500/30 hover:from-blue-400 hover:to-sky-400',
      progressBar: 'from-blue-400 via-sky-400 to-cyan-300',
      activeBorder: 'border-blue-500 ring-blue-500/30',
    };
  }
  // Default: Royal Nordic Sapphire & Teal
  return {
    cardGradient: 'from-[#07162b] via-[#0f2a4b] to-[#040e1c]',
    border: 'border-teal-400/40',
    glow1: 'bg-teal-500/25',
    glow2: 'bg-cyan-500/20',
    badgeBg: 'border-teal-400/40 bg-teal-500/20 text-teal-200',
    btnBg: 'from-teal-500 via-cyan-600 to-blue-600 text-white shadow-teal-500/30 hover:from-teal-400 hover:to-cyan-500',
    progressBar: 'from-teal-400 via-cyan-400 to-blue-300',
    activeBorder: 'border-teal-500 ring-teal-500/30',
  };
}

export function EditorialSpotlightCarousel({
  posts,
  title = 'Editorial Desk Spotlight',
  subtitle = 'Original policy intelligence, landmark investigative reports and deep-dive analysis published by our editors.',
}: EditorialSpotlightCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);
  const thumbnailRailRef = useRef<HTMLDivElement>(null);
  const isFirstMountRef = useRef(true);

  const cleanPosts = posts.filter(Boolean);
  const total = cleanPosts.length;

  const goToSlide = useCallback(
    (nextIdx: number, dir: number) => {
      if (total <= 1) return;
      setDirection(dir);
      setCurrentIndex(nextIdx);
      setProgress(0);
    },
    [total]
  );

  const handleNext = useCallback(() => {
    goToSlide((currentIndex + 1) % total, 1);
  }, [currentIndex, total, goToSlide]);

  const handlePrev = useCallback(() => {
    goToSlide((currentIndex - 1 + total) % total, -1);
  }, [currentIndex, total, goToSlide]);

  // Autoplay timer with fluid progress
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const stepMs = 30;
    const progressStep = (stepMs / AUTOPLAY_INTERVAL) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + progressStep;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [total, isPaused, handleNext]);

  // Keep active thumbnail centered in view
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    const container = thumbnailRailRef.current;
    if (!container) return;
    const activeBtn = container.children[currentIndex] as HTMLElement | undefined;
    if (activeBtn) {
      const targetLeft = activeBtn.offsetLeft - (container.clientWidth - activeBtn.clientWidth) / 2;
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    },
    [handlePrev, handleNext]
  );

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null) {
      if (touchDeltaXRef.current < -45) {
        handleNext();
      } else if (touchDeltaXRef.current > 45) {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
    setIsPaused(false);
  };

  if (!cleanPosts.length) return null;

  const currentPost = cleanPosts[currentIndex] || cleanPosts[0];
  const postAuthor = currentPost.author || currentPost.source_feed || `${siteName} Editorial Desk`;
  const currentTheme = getSlideTheme(currentPost.category);

  return (
    <section
      aria-label="Editorial Spotlight Carousel"
      className="relative my-6 sm:my-8 select-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header Bar with Interactive Navigation Controls */}
      <div className="mb-3.5 sm:mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-200/80 bg-amber-50 shadow-xs">
              <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" strokeWidth={2.25} aria-hidden />
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-slate-950">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Carousel Arrow Navigation Buttons */}
        {total > 1 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs hover:border-teal-500 hover:bg-teal-50 hover:text-teal-900 transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? 'Resume Auto-slide' : 'Pause Auto-slide'}
              title={isPaused ? 'Resume Auto-slide' : 'Pause Auto-slide'}
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
            >
              {isPaused ? <Play className="h-3 w-3 text-emerald-600" /> : <Pause className="h-3 w-3 text-slate-500" />}
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Slide"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs hover:border-teal-500 hover:bg-teal-50 hover:text-teal-900 transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Luxury Compact Hero Canvas */}
      <div
        className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border bg-gradient-to-br ${currentTheme.cardGradient} ${currentTheme.border} shadow-xl transition-all duration-500 ring-1 ring-white/10 h-[430px] sm:h-[380px] md:h-[305px] lg:h-[315px]`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Dynamic Vibrant Ambient Radial Glows */}
        <div
          className={`pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full ${currentTheme.glow1} blur-[90px] transition-all duration-700`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full ${currentTheme.glow2} blur-[90px] transition-all duration-700`}
          aria-hidden
        />

        {/* Floating Slide Counter Badge */}
        {total > 1 && (
          <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-20 flex items-center gap-1 rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 text-[11px] font-medium text-white shadow-md backdrop-blur-md">
            <span className="font-mono text-amber-300 font-bold">{String(currentIndex + 1).padStart(2, '0')}</span>
            <span className="text-white/35">/</span>
            <span className="font-mono text-slate-300">{String(total).padStart(2, '0')}</span>
          </div>
        )}

        {/* Smooth Animated Slide Container */}
        <div className="relative h-full w-full overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPost.id || currentIndex}
              custom={direction}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 grid grid-cols-1 md:grid-cols-12 h-full w-full"
            >
              {/* Cover Media Section (5 cols on desktop) */}
              <div className="relative h-[180px] sm:h-[185px] md:h-full w-full overflow-hidden md:col-span-5 lg:col-span-5">
                <Link
                  href={`/news/${currentPost.slug}`}
                  className="group/img block h-full w-full focus:outline-none"
                  tabIndex={-1}
                >
                  <RemoteStoryImage
                    src={resolvePostImageUrl(
                      currentPost.image_url,
                      currentPost.title,
                      currentPost.category
                    )}
                    alt={decodeHtmlEntities(currentPost.title)}
                    priority
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
                    category={currentPost.category}
                  />

                  {/* Gradient overlays for cinematic depth and smooth seamless blend */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent md:hidden"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 hidden md:block bg-gradient-to-r from-transparent via-black/25 to-black/85"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
                    aria-hidden
                  />
                </Link>

                {/* Badges on image for small screens */}
                <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5 md:hidden z-10">
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-black/75 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md shadow-md">
                    <Feather className="h-2.5 w-2.5 text-amber-400" />
                    Original
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-slate-200 backdrop-blur-md shadow-md">
                    <CategoryGlyph name={currentPost.category} className="h-2.5 w-2.5 text-amber-300" />
                    {categoryLabel(currentPost.category)}
                  </span>
                </div>
              </div>

              {/* Editorial Content Section (7 cols on desktop) */}
              <div className="relative flex flex-col justify-between p-4 sm:p-5 md:p-5 lg:p-6 md:col-span-7 lg:col-span-7 z-10 h-[250px] sm:h-[195px] md:h-full">
                {/* Header tags + Headline + Excerpt */}
                <div className="space-y-2">
                  {/* Category, Desk & Read Time Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border ${currentTheme.badgeBg} px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-md`}>
                      <Sparkles className="h-3 w-3" />
                      Editorial Deep Dive
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-slate-100 backdrop-blur-md">
                      <CategoryGlyph name={currentPost.category} className="h-2.5 w-2.5 text-amber-300" />
                      {categoryLabel(currentPost.category)}
                    </span>
                    {currentPost.reading_time_minutes ? (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-slate-200/80 bg-white/10 border border-white/15 rounded-full px-2 py-0.5 backdrop-blur-xs">
                        <Clock className="h-2.5 w-2.5 opacity-80" />
                        {currentPost.reading_time_minutes} min read
                      </span>
                    ) : null}
                  </div>

                  {/* Headline with elegant sizing and crisp line clamping */}
                  <h3 className="font-display text-base sm:text-lg md:text-xl lg:text-[1.32rem] font-bold leading-snug tracking-tight text-white line-clamp-2">
                    <Link
                      href={`/news/${currentPost.slug}`}
                      className="hover:text-amber-200 transition-colors focus:outline-none focus:underline"
                    >
                      {decodeHtmlEntities(currentPost.title)}
                    </Link>
                  </h3>

                  {/* Curated Excerpt */}
                  {currentPost.excerpt && (
                    <p className="text-xs sm:text-[13px] leading-relaxed text-slate-200/85 line-clamp-2 font-normal">
                      {cleanDisplayExcerpt(currentPost.excerpt, currentPost.title)}
                    </p>
                  )}
                </div>

                {/* Author Byline & CTA Section */}
                <div className="flex items-center justify-between gap-3 border-t border-white/15 pt-2.5 sm:pt-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-amber-300 shadow-xs backdrop-blur-md">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-100 truncate">
                        {postAuthor}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-300">
                        <time dateTime={currentPost.published_at}>
                          {formatPublishedAt(currentPost.published_at)}
                        </time>
                        {currentPost.view_count > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-200">
                              <Eye className="h-2.5 w-2.5 text-amber-300" />
                              {currentPost.view_count.toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sleek, Proportionate CTA Button */}
                  <Link
                    href={`/news/${currentPost.slug}`}
                    className={`group inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-gradient-to-r ${currentTheme.btnBg} px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold shadow-md transition-all hover:scale-[1.03] active:scale-[0.98] shrink-0`}
                  >
                    <span>Read Story</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dynamic Glowing Progress Bar along Bottom of Card */}
        {total > 1 && (
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10 overflow-hidden z-20">
            <div
              className={`h-full bg-gradient-to-r ${currentTheme.progressBar} transition-all duration-75 ease-linear shadow-sm`}
              style={{ width: `${progress}%` }}
              aria-hidden
            />
          </div>
        )}
      </div>

      {/* Interactive Story Selector Strip with Animated Active Indicators */}
      {total > 1 && (
        <div
          ref={thumbnailRailRef}
          className="mt-3 sm:mt-3.5 flex items-stretch gap-2.5 overflow-x-auto pt-1.5 pb-2 px-1 pd-scrollbar-none snap-x"
        >
          {cleanPosts.map((post, idx) => {
            const isSelected = idx === currentIndex;
            const itemTheme = getSlideTheme(post.category);
            return (
              <button
                key={post.id || idx}
                type="button"
                onClick={() => goToSlide(idx, idx > currentIndex ? 1 : -1)}
                className={`group relative flex h-[62px] sm:h-[66px] w-[210px] sm:w-[235px] shrink-0 items-center gap-2.5 rounded-2xl border p-2 text-left transition-all duration-200 snap-start focus:outline-none cursor-pointer ${
                  isSelected
                    ? `border-amber-500 bg-white shadow-md ring-2 ring-amber-400/30 -translate-y-0.5`
                    : 'border-slate-200/90 bg-white/95 hover:border-slate-300 hover:bg-white hover:shadow-xs'
                }`}
              >
                {/* Mini Thumbnail */}
                <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-xl bg-slate-900 shadow-xs">
                  <RemoteStoryImage
                    src={resolvePostImageUrl(post.image_url, post.title, post.category)}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    category={post.category}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-500/15 ring-1 ring-inset ring-amber-500 rounded-xl" />
                  )}
                  {/* Number Badge */}
                  <span className="absolute bottom-0.5 right-0.5 rounded-md bg-black/80 px-1 text-[8px] font-mono font-black text-white backdrop-blur-xs">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-700 truncate">
                    <CategoryGlyph name={post.category} className="h-2 w-2" />
                    <span>{categoryLabel(post.category)}</span>
                  </div>
                  <div
                    className={`mt-0.5 text-[11.5px] line-clamp-2 leading-tight ${
                      isSelected ? 'text-slate-950 font-bold' : 'text-slate-700 font-medium'
                    }`}
                  >
                    {decodeHtmlEntities(post.title)}
                  </div>
                </div>

                {/* Active Progress Bar on Top of Selected Card */}
                {isSelected && (
                  <div className="absolute -top-[1.5px] inset-x-3 h-[2.5px] rounded-full overflow-hidden bg-amber-200/60">
                    <div
                      className={`h-full bg-gradient-to-r ${itemTheme.progressBar} transition-all duration-75 ease-linear`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
