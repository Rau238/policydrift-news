'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Props = {
  href?: string;
  label?: string;
  className?: string;
  useHistory?: boolean;
};

export function AnimatedBackButton({
  href = '/news',
  label = 'All news',
  className = '',
  useHistory = true,
}: Props) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (useHistory && typeof window !== 'undefined' && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-teal-500/30 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 px-4 py-2 text-xs sm:text-[13px] font-bold text-white shadow-md shadow-slate-950/40 backdrop-blur-xl transition-all duration-300 ease-out hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/30 hover:scale-[1.03] active:scale-95 ${className}`}
    >
      {/* Animated Light Sweep Shimmer Effect */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-full bg-gradient-to-r from-transparent via-teal-400/20 to-transparent opacity-0 transition-all duration-700 ease-in-out group-hover:translate-x-full group-hover:opacity-100"
      />

      {/* Subtle Radial Glow on Hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-teal-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* `<<` Double Chevron Icon with Staggered Kinetic Wave */}
      <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/40 transition-all duration-300 group-hover:bg-teal-400 group-hover:text-slate-950 group-hover:ring-teal-300 group-hover:shadow-md group-hover:shadow-teal-400/50">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="overflow-visible"
        >
          {/* Lead Chevron (<) - Glides first */}
          <polyline
            points="11 17 6 12 11 7"
            className="transition-transform duration-300 ease-out group-hover:-translate-x-1"
          />
          {/* Follower Chevron (<) - Follows with elastic wave */}
          <polyline
            points="18 17 13 12 18 7"
            className="opacity-75 transition-all duration-300 ease-out group-hover:-translate-x-1 group-hover:opacity-100"
          />
        </svg>
      </div>

      {/* Button Text with Dynamic Letter-Spacing Transition */}
      <span className="relative font-sans tracking-wide text-slate-100 transition-colors duration-300 group-hover:text-white">
        {label}
      </span>
    </Link>
  );
}
