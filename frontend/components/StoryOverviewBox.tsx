'use client';

import { decodeHtmlEntities } from '@/lib/sanitize';
import { cleanDisplayExcerpt } from '@/lib/article-body';
import { Sparkles } from 'lucide-react';

type Props = {
  excerpt?: string | null;
  takeawaysRaw?: string | null;
};

export function StoryOverviewBox({ excerpt, takeawaysRaw }: Props) {
  const cleanedExcerpt = cleanDisplayExcerpt(excerpt);

  // Parse dedicated key takeaways if available
  const takeawaysList = takeawaysRaw?.trim()
    ? takeawaysRaw
        .split(/\n+/)
        .map((l) => decodeHtmlEntities(l.trim()))
        .filter((l) => l.length > 5)
    : [];

  if (!cleanedExcerpt && takeawaysList.length === 0) return null;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Key Takeaways Callout */}
      {takeawaysList.length > 0 && (
        <div className="rounded-2xl border border-teal-200/80 bg-teal-50/40 p-4 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-teal-700" />
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal-900">
              Key Highlights
            </h3>
          </div>
          <ul className="space-y-2 list-none p-0 m-0">
            {takeawaysList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-600 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Story Excerpt Text (Only when not already displayed under headline) */}
      {cleanedExcerpt && (
        <div className="text-[15.5px] sm:text-[18px] leading-[1.75] sm:leading-[1.8] text-slate-800 font-normal">
          <p className="first-letter:float-left first-letter:text-[2.6rem] sm:first-letter:text-5xl first-letter:leading-[0.82] first-letter:font-bold first-letter:font-display first-letter:mr-2.5 first-letter:mt-1 first-letter:text-slate-950">
            {cleanedExcerpt}
          </p>
        </div>
      )}
    </div>
  );
}
