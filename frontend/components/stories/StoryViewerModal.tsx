'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryGroup } from '@/lib/stories-data';
import { StoryProgressBar } from './StoryProgressBar';
import { StorySlideContent } from './StorySlideContent';
import { ChevronLeft, ChevronRight, X, Pause, Play } from 'lucide-react';
import { CategoryGlyph, categoryLabel } from '@/lib/category-theme';

interface StoryViewerModalProps {
  groups: StoryGroup[];
  initialGroupIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onStoryViewed?: (groupId: string) => void;
}

const SLIDE_DURATION_MS = 5500; // 5.5s per slide

export function StoryViewerModal({
  groups,
  initialGroupIndex,
  isOpen,
  onClose,
  onStoryViewed,
}: StoryViewerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentGroupIdx, setCurrentGroupIdx] = useState(initialGroupIndex);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initial group index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentGroupIdx(initialGroupIndex);
      setCurrentSlideIdx(0);
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, initialGroupIndex]);

  const activeGroup = groups[currentGroupIdx];
  const slides = activeGroup?.slides || [];
  const activeSlide = slides[currentSlideIdx];

  // Notify parent that story group has been viewed
  useEffect(() => {
    if (isOpen && activeGroup && onStoryViewed) {
      onStoryViewed(activeGroup.id);
    }
  }, [isOpen, activeGroup, onStoryViewed]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

  const nextSlide = useCallback(() => {
    if (!activeGroup) return;

    if (currentSlideIdx < slides.length - 1) {
      setCurrentSlideIdx((prev) => prev + 1);
      setProgress(0);
    } else {
      // Move to next group
      if (currentGroupIdx < groups.length - 1) {
        setCurrentGroupIdx((prev) => prev + 1);
        setCurrentSlideIdx(0);
        setProgress(0);
      } else {
        // Finished all stories
        onClose();
      }
    }
  }, [activeGroup, currentSlideIdx, slides.length, currentGroupIdx, groups.length, onClose]);

  const prevSlide = useCallback(() => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx((prev) => prev - 1);
      setProgress(0);
    } else {
      // Move to previous group
      if (currentGroupIdx > 0) {
        const prevGroup = groups[currentGroupIdx - 1];
        setCurrentGroupIdx((prev) => prev - 1);
        setCurrentSlideIdx(prevGroup ? prevGroup.slides.length - 1 : 0);
        setProgress(0);
      }
    }
  }, [currentSlideIdx, currentGroupIdx, groups]);

  // Autoplay ticker
  useEffect(() => {
    if (!isOpen || isPaused || !activeSlide) return;

    const tickMs = 40;
    const increment = (tickMs / SLIDE_DURATION_MS) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + increment;
      });
    }, tickMs);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, activeSlide, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose]);

  if (!mounted || !isOpen || !activeGroup || !activeSlide) return null;

  // Handle tap on left / right sides
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If user was long-holding, don't trigger click navigation
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;

    if (xRatio < 0.3) {
      prevSlide();
    } else if (xRatio > 0.7) {
      nextSlide();
    } else {
      // Center tap toggles pause
      setIsPaused((prev) => !prev);
    }
  };

  // Hold to pause
  const handlePointerDown = () => {
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      setIsPaused(true);
    }, 180);
  };

  const handlePointerUp = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (isHoldingRef.current) {
      setIsPaused(false);
      // reset after small delay so click handler knows
      setTimeout(() => {
        isHoldingRef.current = false;
      }, 50);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-2xl"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Desktop Prev Group Button */}
        {currentGroupIdx > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentGroupIdx((prev) => prev - 1);
              setCurrentSlideIdx(0);
              setProgress(0);
            }}
            className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md transition hover:bg-white/25 hover:scale-110 active:scale-95 cursor-pointer z-30"
            aria-label="Previous story desk"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Desktop Next Group Button */}
        {currentGroupIdx < groups.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentGroupIdx((prev) => prev + 1);
              setCurrentSlideIdx(0);
              setProgress(0);
            }}
            className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md transition hover:bg-white/25 hover:scale-110 active:scale-95 cursor-pointer z-30"
            aria-label="Next story desk"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Story Card Container (Phone aspect ratio on desktop, full screen on mobile) */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative h-full w-full sm:h-[90vh] sm:max-h-[820px] sm:w-[410px] sm:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20 bg-slate-950"
          onClick={handleContainerClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Top Progress Bars */}
          <div className="absolute top-0 inset-x-0 z-30 pointer-events-none">
            <StoryProgressBar
              totalSegments={slides.length}
              currentIndex={currentSlideIdx}
              currentProgress={progress}
            />

            {/* Top Bar Details & Controls */}
            <div className="flex items-center justify-between px-3.5 pt-1 text-white">
              {/* Desk / Category Badge */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 border border-white/20 backdrop-blur-md">
                  <CategoryGlyph name={activeGroup.category} className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <div className="text-xs font-bold tracking-tight text-white drop-shadow-sm">
                  {activeGroup.title}
                </div>
                {activeGroup.badgeText && (
                  <span className="rounded bg-rose-600 px-1.5 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
                    {activeGroup.badgeText}
                  </span>
                )}
              </div>

              {/* Pause indicator & Close Button */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPaused((prev) => !prev);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 border border-white/20 text-white backdrop-blur-md transition hover:bg-black/60"
                  aria-label={isPaused ? 'Resume story' : 'Pause story'}
                >
                  {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 border border-white/20 text-white backdrop-blur-md transition hover:bg-black/60 hover:scale-110"
                  aria-label="Close story viewer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Story Slide Visual Content */}
          <StorySlideContent slide={activeSlide} onLinkClick={onClose} />
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
