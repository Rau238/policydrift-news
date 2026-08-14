/** Always-animating outline trending icon (respects reduced motion). */
export function AnimatedTrendingIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pd-trend-icon ${className}`}
      aria-hidden
    >
      <path
        className="pd-trend-line"
        d="M3 17 L8 12 L12 15 L16 8 L21 4"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="pd-trend-arrow"
        d="M14 4 H21 V11"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className="pd-trend-dot" cx="21" cy="4" r="1.6" fill="currentColor" />
    </svg>
  );
}
