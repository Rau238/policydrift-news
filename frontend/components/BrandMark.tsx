'use client';

import { useId } from 'react';

type Props = {
  className?: string;
  sizeClass?: string;
  title?: string;
};

/** Circular NewsFree365 mark — bold hash (#) on teal. */
export function BrandMark({
  className = '',
  sizeClass = 'h-9 w-9',
  title = 'NewsFree365',
}: Props) {
  const uid = useId().replace(/:/g, '');
  const bg = `pd-bg-${uid}`;

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-full shadow-lg shadow-teal-900/35 ring-1 ring-white/20 ${sizeClass} ${className}`}
      title={title}
      role="img"
      aria-label={title}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={bg} x1="48" y1="24" x2="470" y2="490" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0f9f8f" />
            <stop offset="0.42" stopColor="#0f766e" />
            <stop offset="1" stopColor="#031f1d" />
          </linearGradient>
        </defs>
        <circle cx="256" cy="256" r="256" fill={`url(#${bg})`} />
        <circle cx="256" cy="256" r="228" fill="none" stroke="#ccfbf1" strokeOpacity="0.18" strokeWidth="8" />
        {/* Hash (#) — two uprights + two crossbars, slightly italic for motion */}
        <g fill="#ffffff" transform="translate(256 256) rotate(-8) translate(-256 -256)">
          <rect x="168" y="112" width="48" height="288" rx="14" />
          <rect x="296" y="112" width="48" height="288" rx="14" />
          <rect x="120" y="176" width="272" height="48" rx="14" />
          <rect x="120" y="288" width="272" height="48" rx="14" />
        </g>
      </svg>
    </span>
  );
}
