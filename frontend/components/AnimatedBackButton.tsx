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
      className={`group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-teal-500/25 bg-slate-900/90 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-white shadow-xs backdrop-blur-md transition-all duration-200 ease-out hover:border-teal-400 hover:bg-slate-900 hover:shadow-sm hover:shadow-teal-500/20 active:scale-95 ${className}`}
    >
      {/* Animated Light Sweep Shimmer Effect */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-full bg-gradient-to-r from-transparent via-teal-400/15 to-transparent opacity-0 transition-all duration-500 ease-in-out group-hover:translate-x-full group-hover:opacity-100"
      />

      {/* `<<` Double Chevron Icon with Staggered Kinetic Wave */}
      <div className="relative flex h-4 w-4 sm:h-4.5 sm:w-4.5 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30 transition-all duration-200 group-hover:bg-teal-400 group-hover:text-slate-950">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="overflow-visible sm:w-2.5 sm:h-2.5"
        >
          {/* Lead Chevron (<) */}
          <polyline
            points="11 17 6 12 11 7"
            className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
          />
          {/* Follower Chevron (<) */}
          <polyline
            points="18 17 13 12 18 7"
            className="opacity-75 transition-all duration-200 ease-out group-hover:-translate-x-0.5 group-hover:opacity-100"
          />
        </svg>
      </div>

      {/* Button Text */}
      <span className="relative font-sans tracking-tight text-slate-200 transition-colors duration-200 group-hover:text-white">
        {label}
      </span>
    </Link>
  );
}
