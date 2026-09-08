'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { StoryGroup } from '@/lib/stories-data';
import { StoryCircleItem } from './StoryCircleItem';
import { StoryViewerModal } from './StoryViewerModal';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface StoryTrayProps {
  groups: StoryGroup[];
  title?: string;
  className?: string;
}

const STORAGE_KEY = 'newsfree365_viewed_stories';

export function StoryTray({
  groups,
  title = 'Visual Stories',
  className = '',
}: StoryTrayProps) {
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number | null>(null);
  const [viewedGroupIds, setViewedGroupIds] = useState<Set<string>>(new Set());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load viewed story IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setViewedGroupIds(new Set(parsed));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Update scroll arrow visibility
  const updateScrollState = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [groups]);

  const handleScroll = (dir: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = dir === 'left' ? -320 : 320;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleStoryViewed = (groupId: string) => {
    setViewedGroupIds((prev) => {
      if (prev.has(groupId)) return prev;
      const next = new Set(prev);
      next.add(groupId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  if (!groups || groups.length === 0) return null;

  return (
    <section
      aria-label={title}
      className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-3.5 sm:p-4 select-none ${className}`}
    >
      <div className="relative w-full">
        {/* Simple Clean Section Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-display text-sm sm:text-base font-bold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {title}
          </h3>

          {/* Desktop Left/Right Arrow Controls */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
              aria-label="Scroll stories left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
              aria-label="Scroll stories right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stories Circular Horizontal Rail */}
        <div className="relative group/rail">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-1 pt-0.5 pd-scrollbar-none snap-x scroll-smooth"
          >
            <div className="flex items-center gap-4 sm:gap-5 md:gap-6 min-w-max px-0.5">
              {groups.map((group, idx) => (
                <div key={group.id} className="snap-start">
                  <StoryCircleItem
                    group={group}
                    isViewed={viewedGroupIds.has(group.id)}
                    onClick={() => setSelectedGroupIdx(idx)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Story Viewer Modal */}
      {selectedGroupIdx !== null && (
        <StoryViewerModal
          groups={groups}
          initialGroupIndex={selectedGroupIdx}
          isOpen={selectedGroupIdx !== null}
          onClose={() => setSelectedGroupIdx(null)}
          onStoryViewed={handleStoryViewed}
        />
      )}
    </section>
  );
}
