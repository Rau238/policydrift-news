'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

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
      className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-teal-500/30 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-sm backdrop-blur-md transition-all duration-200 ease-out hover:border-teal-400 hover:bg-slate-800 hover:text-white hover:shadow-teal-500/20 active:scale-95 ${className}`}
    >
      {/* Animated Light Sweep Shimmer Effect */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-full bg-gradient-to-r from-transparent via-teal-400/15 to-transparent opacity-0 transition-all duration-500 ease-in-out group-hover:translate-x-full group-hover:opacity-100"
      />

      {/* Crisp Left Arrow with Smooth Slide */}
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30 transition-all duration-200 group-hover:bg-teal-400 group-hover:text-slate-950 group-hover:ring-teal-300">
        <ArrowLeft className="h-3 w-3 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" strokeWidth={2.5} />
      </div>

      {/* Button Text */}
      <span className="relative font-sans tracking-tight">
        {label}
      </span>
    </Link>
  );
}
