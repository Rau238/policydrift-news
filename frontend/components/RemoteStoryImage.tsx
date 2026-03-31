'use client';

import { useState } from 'react';
import { STORY_FALLBACK_PATH } from '@/lib/story-image';

function isLocalFallbackPath(s: string): boolean {
  return s === STORY_FALLBACK_PATH || s.endsWith(STORY_FALLBACK_PATH);
}

/**
 * Plain <img> for third-party RSS URLs — avoids Next/Image edge cases and sets referrer policy
 * so more CDNs (BBC, Guardian, etc.) allow hotlinking. Falls back to the local SVG if the remote URL fails.
 */
type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function RemoteStoryImage({ src, alt, className, priority }: Props) {
  const [swapToFallback, setSwapToFallback] = useState(false);
  const effectiveSrc = swapToFallback || isLocalFallbackPath(src) ? STORY_FALLBACK_PATH : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- intentional for external news CDNs
    <img
      src={effectiveSrc}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (!swapToFallback && !isLocalFallbackPath(src)) setSwapToFallback(true);
      }}
    />
  );
}
