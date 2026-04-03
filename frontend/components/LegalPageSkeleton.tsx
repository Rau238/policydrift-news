import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

/** Matches `LegalPageShell`: back link, title band, disclaimer strip, prose block (about, contact, legal pages). */
export function LegalPageSkeleton() {
  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-slate-50 to-white" aria-busy="true" aria-label="Loading page">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-dark"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-8">
          <Skeleton className="h-9 w-[min(100%,20rem)] rounded-md sm:h-11" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
          <Skeleton className="mt-2 h-4 w-full max-w-lg" />
          <div className="mt-4 rounded-lg border border-slate-200/80 bg-slate-100 px-4 py-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-full max-w-md" />
          </div>
        </header>

        <div className="mt-10 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full max-w-[95%]" />
          <Skeleton className="h-4 w-full max-w-[88%]" />
          <Skeleton className="mt-6 h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </div>
    </div>
  );
}
