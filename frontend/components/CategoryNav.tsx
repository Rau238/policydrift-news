import Link from 'next/link';
import {
  CATEGORY_ORDER,
  categoryHref,
  categoryLabel,
  categoryNavPillClass,
  CategoryGlyph,
} from '@/lib/category-theme';

function deskPillClass(themeClass: string, extra = '') {
  return `inline-flex items-center gap-1 rounded-full font-semibold ring-1 transition active:scale-[0.98] ${themeClass} ${extra}`;
}

export function CategoryNav() {
  return (
    <nav
      className="flex snap-x snap-mandatory items-center gap-1.5 overflow-x-auto overflow-y-hidden scroll-py-1 px-4 pb-1.5 pt-1 pd-scrollbar-none sm:mx-0 sm:flex-wrap sm:items-center sm:justify-end sm:gap-2 sm:overflow-visible sm:px-3 sm:pb-0 sm:pt-0.5"
      aria-label="News desks"
    >
      {CATEGORY_ORDER.filter((c) => c !== 'General').map((key) => (
        <span key={key} className="snap-start shrink-0">
          <Link
            href={categoryHref(key)}
            className={deskPillClass(
              categoryNavPillClass(key),
              'px-2.5 py-1 text-[11px] leading-tight text-white max-md:shadow-sm max-md:shadow-black/20 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs',
            )}
          >
            <CategoryGlyph name={key} className="h-3 w-3 opacity-95 sm:h-3.5 sm:w-3.5" />
            <span className="whitespace-nowrap">{categoryLabel(key)}</span>
          </Link>
        </span>
      ))}
    </nav>
  );
}
