import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

/** Body line: matches legal prose line height (~1.25rem). */
function ProseLine({ className = '' }: { className?: string }) {
  return <Skeleton className={`h-4 rounded-sm bg-slate-200/85 ${className}`} />;
}

/** Matches `.pd-legal-prose h2` (mt-10 text-xl). */
function H2Block() {
  return (
    <Skeleton className="mt-10 h-7 w-[min(100%,15rem)] rounded-sm bg-slate-300/75 sm:h-8 sm:w-[min(100%,19rem)]" />
  );
}

type Props = {
  /**
   * `standard`: intro + repeating h2 + paragraphs (+ list block like Terms).
   * `contact`: intro + Email / mailing sections with icon row + panel shapes.
   */
  variant?: 'standard' | 'contact';
  /** Optional hero/illustration (e.g. About) so layout matches pages that add a figure. */
  showMediaBlock?: boolean;
};

/**
 * Mirrors `LegalPageShell` + `.pd-legal-prose`: back link, display-scale title, one meta line,
 * grey disclaimer panel, then sectioned body (and optional image band).
 */
export function LegalPageSkeleton({ variant = 'standard', showMediaBlock = false }: Props) {
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
          {/* h1: font-display text-3xl sm:text-4xl */}
          <Skeleton className="h-9 w-[min(100%,20rem)] rounded-sm bg-slate-300/80 sm:h-11 sm:w-[min(100%,26rem)]" />
          {/* Single description line like shell `mt-3 text-slate-600` */}
          <Skeleton className="mt-3 h-[1.125rem] w-full max-w-2xl rounded-sm bg-slate-200/70" />
          {/* Same panel as shell: rounded-lg bg-slate-100 px-4 py-3 text-xs */}
          <div className="mt-4 rounded-lg bg-slate-100 px-4 py-3">
            <Skeleton className="h-3 w-full rounded-sm bg-slate-200/90" />
            <Skeleton className="mt-2 h-3 w-full max-w-[98%] rounded-sm bg-slate-200/90" />
            <Skeleton className="mt-2 h-3 w-full max-w-lg rounded-sm bg-slate-200/90" />
          </div>
        </header>

        {variant === 'contact' ? (
          <div className="pd-legal-prose mt-10">
            <div className="mt-4 space-y-2.5">
              <ProseLine className="w-full" />
              <ProseLine className="w-full max-w-[96%]" />
              <ProseLine className="w-[78%]" />
            </div>

            <H2Block />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Skeleton className="h-9 w-9 shrink-0 rounded-md bg-slate-200/90" />
              <Skeleton className="h-4 w-[min(100%,14rem)] max-w-full flex-1 rounded-sm bg-slate-200/85" />
            </div>
            <div className="mt-4 rounded-lg border border-amber-200/85 bg-amber-50/90 px-4 py-3">
              <Skeleton className="h-3 w-full rounded-sm bg-amber-200/60" />
              <Skeleton className="mt-2 h-3 w-full max-w-[92%] rounded-sm bg-amber-200/60" />
              <Skeleton className="mt-2 h-3 w-[70%] rounded-sm bg-amber-200/60" />
            </div>

            <H2Block />
            <div className="mt-4 space-y-2">
              <ProseLine className="w-full" />
              <ProseLine className="w-[88%]" />
              <ProseLine className="w-[62%]" />
            </div>
          </div>
        ) : (
          <div className="pd-legal-prose mt-10">
            <div className="mt-4 space-y-2.5">
              <ProseLine className="w-full" />
              <ProseLine className="w-full max-w-[97%]" />
              <ProseLine className="w-[84%]" />
            </div>

            {showMediaBlock ? (
              <figure className="mt-8 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100 shadow-sm">
                <Skeleton className="aspect-[16/9] w-full rounded-none bg-slate-200/80" />
                <figcaption className="px-3 py-2.5">
                  <Skeleton className="h-3 w-44 rounded-sm bg-slate-200/80" />
                </figcaption>
              </figure>
            ) : null}

            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i}>
                <H2Block />
                <div className="mt-4 space-y-2.5">
                  <ProseLine className="w-full" />
                  <ProseLine className="w-full max-w-[95%]" />
                  {i === 1 || i === 3 ? <ProseLine className="w-[72%]" /> : null}
                </div>
                {i === 2 ? (
                  <ul className="mt-4 list-none space-y-2.5 pl-6">
                    {[0, 1, 2].map((j) => (
                      <li key={j} className="flex gap-3">
                        <Skeleton className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300/90" />
                        <Skeleton className="h-4 min-w-0 flex-1 rounded-sm bg-slate-200/85 sm:max-w-lg" />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
