'use client';

import { useEffect, useState } from 'react';
import { siteName } from '@/lib/site';

const SPLASH_MS = 1400;

function isStandalonePwa() {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia('(display-mode: standalone)').matches;
  const ios =
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || ios;
}

/**
 * Launch splash for installed PWA only (never desktop / browser tabs).
 */
export function PwaSplash() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!isStandalonePwa()) return;

    setVisible(true);

    const exitAt = window.setTimeout(() => setExiting(true), SPLASH_MS);
    const goneAt = window.setTimeout(() => setVisible(false), SPLASH_MS + 380);

    return () => {
      window.clearTimeout(exitAt);
      window.clearTimeout(goneAt);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`pd-splash fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#042f2e] ${
        exiting ? 'pd-splash-exit' : ''
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading NewsFree365"
    >
      <div className="pd-splash-orb pd-splash-orb-a" aria-hidden />
      <div className="pd-splash-orb pd-splash-orb-b" aria-hidden />

      <div className="pd-splash-mark relative z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/brand-logo.svg"
          alt=""
          width={96}
          height={96}
          draggable={false}
          className="h-20 w-20 rounded-full shadow-2xl shadow-teal-950/50 ring-1 ring-white/15 sm:h-24 sm:w-24"
        />
      </div>

      <p className="pd-splash-title relative z-10 mt-5 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {siteName}
      </p>
      <p className="pd-splash-sub relative z-10 mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal-200/80">
        News desk
      </p>

      <div className="pd-splash-bar relative z-10 mt-10 h-0.5 w-28 overflow-hidden rounded-full bg-white/15" aria-hidden>
        <span className="pd-splash-bar-fill absolute inset-y-0 left-0 w-1/2 rounded-full bg-teal-300" />
      </div>
    </div>
  );
}
