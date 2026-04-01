import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { PostListItem } from '@/lib/types';
import { formatPublishedAt } from '@/lib/format';
import { categoryLabel, CategoryGlyph } from '@/lib/category-theme';

type Tone = 'neutral' | 'breaking' | 'accent';

export function SidebarPostList({
  title,
  subtitle,
  posts,
  icon: Icon,
  tone = 'neutral',
  showRank = false,
  footerHref,
  footerLabel,
}: {
  title: string;
  subtitle?: string;
  posts: PostListItem[];
  icon: LucideIcon;
  tone?: Tone;
  showRank?: boolean;
  footerHref?: string;
  footerLabel?: string;
}) {
  if (!posts.length) return null;

  const iconWrap =
    tone === 'breaking'
      ? 'border-rose-200/90 bg-rose-50'
      : tone === 'accent'
        ? 'border-teal-200/90 bg-teal-50'
        : 'border-slate-200/90 bg-white';

  const rankClass =
    tone === 'breaking'
      ? 'border-rose-200/80 bg-rose-50 text-rose-800'
      : tone === 'accent'
        ? 'border-teal-200/80 bg-teal-50 text-teal-900'
        : 'border-accent/20 bg-accent-soft text-accent-dark';

  return (
    <aside className="relative overflow-hidden rounded-2xl border border-slate-200 bg-surface-card shadow-sm max-lg:rounded-2xl lg:rounded-3xl">
      <div className="relative border-b border-slate-200/90 px-4 py-4 pl-5 sm:px-7 sm:py-5 sm:pl-8">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border sm:h-11 sm:w-11 ${iconWrap}`}
          >
            <Icon
              className={`h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5 ${tone === 'breaking' ? 'text-rose-600' : tone === 'accent' ? 'text-teal-700' : 'text-accent-dark'}`}
              strokeWidth={2.5}
              aria-hidden
            />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">{title}</h2>
            {subtitle ? (
              <p className="text-[11px] font-medium text-ink-soft sm:text-xs">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>
      <ol className="relative divide-y divide-slate-200/80 px-2 py-0.5 sm:px-4 sm:py-1">
        {posts.map((p, i) => (
          <li key={p.id}>
            <div
              className={`flex gap-2.5 rounded-lg py-3 pr-0.5 transition hover:bg-surface/80 sm:gap-3 sm:rounded-xl sm:py-3.5 sm:pr-2 ${showRank ? 'pl-0.5 sm:pl-2' : 'pl-3 sm:pl-5'}`}
            >
              {showRank ? (
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-black max-lg:h-8 max-lg:w-8 sm:h-9 sm:w-9 sm:text-sm ${rankClass}`}
                >
                  {i + 1}
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200/90 bg-surface px-2 py-0.5 text-[10px] font-bold text-accent-dark">
                  <CategoryGlyph name={p.category} className="h-3 w-3 text-accent" />
                  {categoryLabel(p.category)}
                </span>
                <Link
                  href={`/news/${p.slug}`}
                  className="mt-1.5 block line-clamp-2 text-sm font-semibold leading-snug text-ink transition hover:text-accent-dark"
                >
                  {p.title}
                </Link>
                <p className="mt-1 text-[11px] text-ink-soft">
                  {formatPublishedAt(p.published_at)} · {p.view_count.toLocaleString()} views
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
      {footerHref && footerLabel ? (
        <div className="border-t border-slate-200/80 px-4 py-3 sm:px-6">
          <Link
            href={footerHref}
            className="text-sm font-semibold text-accent transition hover:text-accent-dark"
          >
            {footerLabel}
          </Link>
        </div>
      ) : null}
    </aside>
  );
}
