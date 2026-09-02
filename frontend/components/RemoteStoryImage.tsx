'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { STORY_FALLBACK_PATH } from '@/lib/story-image';
import { CategoryStoryPlaceholder } from '@/components/CategoryStoryPlaceholder';
import { BrandMark } from '@/components/BrandMark';
import { getCardBgHex } from '@/lib/category-theme';

function isLocalFallbackPath(s: string): boolean {
  return s === STORY_FALLBACK_PATH || s.endsWith(STORY_FALLBACK_PATH);
}

/**
 * Progressive story image:
 * Branded NewsFree365 logo with vibrant category shade while loading → full image fades in sharp once loaded.
 */
type Props = {
  src: string;
  alt: string;
  /** Defaults to `alt` (many SEO audits expect a title on images). */
  title?: string;
  className?: string;
  priority?: boolean;
  /** Desk name — drives shade + outline art when there is no photo */
  category?: string;
  /** Hex color to match parent card shade */
  cardBgHex?: string;
  /** Smaller placeholder (sidebar thumbs) */
  compact?: boolean;
  /** Hide caption on card placeholders (chip already shows desk) */
  hideCaption?: boolean;
};

export function RemoteStoryImage({
  src,
  alt,
  title,
  className,
  priority,
  category,
  cardBgHex,
  compact,
  hideCaption,
}: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [swapToFallback, setSwapToFallback] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(() => Boolean(priority));
  const useFallback = swapToFallback || isLocalFallbackPath(src);
  const safeAlt = alt.trim() || 'News story image';
  const safeTitle = (title ?? safeAlt).trim() || safeAlt;
  const bgHex = cardBgHex || (category ? getCardBgHex(category) : '#0f766e');

  useEffect(() => {
    if (priority) {
      setInView(true);
      return;
    }
    const el = wrapRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      // Start fetch slightly before visible so scroll still feels smooth
      { root: null, rootMargin: '180px 0px', threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [priority, src]);

  const onLoad = useCallback(() => setLoaded(true), []);
  const onError = useCallback(() => {
    setSwapToFallback(true);
    setLoaded(true);
  }, []);

  if (useFallback && category) {
    return (
      <CategoryStoryPlaceholder
        category={category}
        className={className}
        compact={compact}
        hideCaption={hideCaption}
      />
    );
  }

  if (useFallback) {
    return (
      <span ref={wrapRef} style={{ backgroundColor: bgHex }} className="relative block h-full w-full overflow-hidden">
        {inView ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={STORY_FALLBACK_PATH}
            alt={safeAlt}
            title={safeTitle}
            className={className}
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </span>
    );
  }

  return (
    <span ref={wrapRef} style={{ backgroundColor: bgHex }} className="relative block h-full w-full overflow-hidden">
      {/* Branded NewsFree365 Logo with Vibrant Card Shade while loading */}
      <span
        style={{
          background: `radial-gradient(circle at center, ${bgHex}d9 0%, ${bgHex} 100%)`,
        }}
        className={`pointer-events-none absolute inset-0 z-[1] flex items-center justify-center transition-opacity duration-500 ease-out ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden
      >
        <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-white/5 via-white/15 to-white/5" />
        <span className="relative flex flex-col items-center justify-center gap-2">
          <BrandMark sizeClass={compact ? 'h-8 w-8' : 'h-12 w-12'} className="animate-pulse shadow-black/40 ring-white/30" />
          {!compact ? (
            <span className="text-[10px] font-bold tracking-widest text-white/90 uppercase drop-shadow-sm">
              NewsFree365
            </span>
          ) : null}
        </span>
      </span>

      {inView ? (
        /* eslint-disable-next-line @next/next/no-img-element -- intentional for external news CDNs */
        <img
          src={src}
          alt={safeAlt}
          title={safeTitle}
          className={`${className ?? ''} pd-img-photo ${loaded ? 'pd-img-photo-ready' : 'pd-img-photo-loading'}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          referrerPolicy="no-referrer"
          onLoad={onLoad}
          onError={onError}
        />
      ) : null}
    </span>
  );
}
