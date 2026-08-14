import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  page: number;
  totalPages: number;
  /** Build href for a 1-based page number */
  hrefForPage: (page: number) => string;
  className?: string;
};

function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const set = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    set.add(2);
    set.add(3);
    set.add(4);
  }
  if (current >= total - 2) {
    set.add(total - 1);
    set.add(total - 2);
    set.add(total - 3);
  }

  const sorted = Array.from(set)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('…');
    out.push(sorted[i]);
  }
  return out;
}

export function PaginationBar({ page, totalPages, hrefForPage, className = '' }: Props) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? hrefForPage(page - 1) : null;
  const next = page < totalPages ? hrefForPage(page + 1) : null;
  const pages = pageWindow(page, totalPages);

  return (
    <nav
      className={`mt-10 flex flex-col items-center gap-4 sm:mt-12 ${className}`}
      aria-label="Pagination"
    >
      <p className="text-xs font-semibold tabular-nums tracking-wide text-slate-500">
        Page <span className="text-ink">{page}</span>
        <span className="mx-1 text-slate-300">/</span>
        <span className="text-ink">{totalPages}</span>
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {prev ? (
          <Link
            href={prev}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-300">
            <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </span>
        )}

        <div className="flex items-center gap-1">
          {pages.map((p, i) =>
            p === '…' ? (
              <span
                key={`e-${i}`}
                className="px-1.5 text-sm font-semibold text-slate-300"
                aria-hidden
              >
                …
              </span>
            ) : p === page ? (
              <span
                key={p}
                aria-current="page"
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 px-2.5 text-sm font-bold tabular-nums text-white shadow-md shadow-teal-900/20 ring-1 ring-teal-500/30"
              >
                {p}
              </span>
            ) : (
              <Link
                key={p}
                href={hrefForPage(p)}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-semibold tabular-nums text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900"
              >
                {p}
              </Link>
            ),
          )}
        </div>

        {next ? (
          <Link
            href={next}
            className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-teal-900/25 ring-1 ring-teal-500/30 transition hover:from-teal-500 hover:to-teal-700"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-300">
            Next
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </span>
        )}
      </div>
    </nav>
  );
}
