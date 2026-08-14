'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { STORY_FALLBACK_PATH } from '@/lib/story-image';
import { CategoryStoryPlaceholder } from '@/components/CategoryStoryPlaceholder';

function isLocalFallbackPath(s: string): boolean {
  return s === STORY_FALLBACK_PATH || s.endsWith(STORY_FALLBACK_PATH);
}

/**
 * Progressive story image (Zomato-style):
 * light shimmer / soft blur first → full image fades in sharp when loaded.
 * Bytes are requested only after the slot is near the viewport (unless `priority`).
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
  /** Smaller placeholder (sidebar thumbs) */
  compact?: boolean;
  /** Hide caption on card placeholders (chip already shows desk) */
  hideCaption?: boolean;
};

export function RemoteStoryImage({ src, alt, title, className, priority, category, compact, hideCaption }: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [swapToFallback, setSwapToFallback] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(() => Boolean(priority));
  const useFallback = swapToFallback || isLocalFallbackPath(src);
  const safeAlt = alt.trim() || 'News story image';
  const safeTitle = (title ?? safeAlt).trim() || safeAlt;

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
      <span ref={wrapRef} className="relative block h-full w-full overflow-hidden bg-slate-200/80">
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
    <span ref={wrapRef} className="relative block h-full w-full overflow-hidden bg-slate-200/90">
      {/* Lightweight blur / shimmer while waiting or loading bytes */}
      <span
        className={`pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500 ease-out ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden
      >
        <span className="absolute inset-0 pd-img-blur-wash" />
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
