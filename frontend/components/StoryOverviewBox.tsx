'use client';

import { decodeHtmlEntities } from '@/lib/sanitize';
import { Sparkles } from 'lucide-react';

type Props = {
  excerpt?: string | null;
  takeawaysRaw?: string | null;
};

/**
 * Cleans boilerplate from RSS excerpts (e.g. "Continue reading...", "•", duplicated phrases)
 */
function cleanExcerpt(raw: string): string {
  let text = decodeHtmlEntities(raw || '').trim();

  // Remove boilerplate phrases
  text = text
    .replace(/\bcontinue\s+reading(\.{3}|…)?/gi, '')
    .replace(/\bread\s+more(\.{3}|…)?/gi, '')
    .replace(/\bthe\s+best\s+of\s+[^–-]+–\s*in\s+pictures/gi, '')
    .replace(/•/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove trailing cutoffs like "Using ‘equestrian…"
  text = text.replace(/\s+[\w‘'"][^.!?]{0,30}(…|\.{3})$/g, '.');

  return text;
}

export function StoryOverviewBox({ excerpt, takeawaysRaw }: Props) {
  const cleanedExcerpt = cleanExcerpt(excerpt || '');

  // Parse dedicated key takeaways if available
  const takeawaysList = takeawaysRaw?.trim()
    ? takeawaysRaw
        .split(/\n+/)
        .map((l) => decodeHtmlEntities(l.trim()))
        .filter((l) => l.length > 8)
    : [];

  if (!cleanedExcerpt && takeawaysList.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Key Takeaways Callout (Only if multiple points explicitly provided) */}
      {takeawaysList.length > 1 && (
        <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-teal-700" />
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-teal-900">
              Key Highlights
            </h3>
          </div>
          <ul className="space-y-2 list-none p-0 m-0">
            {takeawaysList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm font-medium text-slate-800 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-600 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Story Narrative Text */}
      {cleanedExcerpt && (
        <div className="text-[17px] sm:text-[18.5px] leading-[1.8] text-slate-800 font-normal">
          <p className="first-letter:float-left first-letter:text-[2.6rem] first-letter:leading-[0.8] first-letter:font-bold first-letter:font-display first-letter:mr-2.5 first-letter:text-slate-900">
            {cleanedExcerpt}
          </p>
        </div>
      )}
    </div>
  );
}
