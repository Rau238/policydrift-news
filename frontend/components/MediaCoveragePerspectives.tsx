'use client';

import React from 'react';
import { ExternalLink, Layers, Newspaper, ShieldCheck } from 'lucide-react';
import type { GoogleNewsItem } from '@/lib/article-body';

type Props = {
  items: GoogleNewsItem[];
  primaryUrl?: string | null;
  storyTitle?: string | null;
};

export function MediaCoveragePerspectives({ items, primaryUrl, storyTitle }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <section
      aria-label="Verified Press Coverage & Perspectives"
      className="my-6 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/50 p-4 sm:p-7 shadow-xs"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-teal-300 shadow-xs">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm sm:text-base font-bold tracking-tight text-slate-950">
                Verified Press Coverage & Source Perspectives
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 border border-teal-200/60">
                <ShieldCheck className="h-3 w-3" />
                Aggregated
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Independent coverage tracked from {items.length} verified news publications
            </p>
          </div>
        </div>
      </div>

      {/* Context explainer */}
      <div className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600">
        This story is being reported across several independent newsrooms. Compare published headlines, editorial angles, and original reporting from each source below:
      </div>

      {/* Perspective Cards */}
      <div className="mt-5 space-y-3 sm:space-y-3.5">
        {items.map((item, idx) => {
          const isPrimary = idx === 0;
          return (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md hover:shadow-slate-200/50"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                {/* Source Label & Index */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200 group-hover:bg-teal-50 group-hover:text-teal-800 group-hover:border-teal-200 transition-colors">
                    <Newspaper className="h-3 w-3 text-slate-500 group-hover:text-teal-600" />
                    {item.source}
                  </span>
                  {isPrimary && (
                    <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200/70">
                      Lead Outlet
                    </span>
                  )}
                </div>

                {/* Headline */}
                <h3 className="text-[14.5px] sm:text-[15.5px] font-semibold leading-snug text-slate-900 group-hover:text-teal-700 transition-colors">
                  {item.title}
                </h3>
              </div>

              {/* Action Button */}
              <div className="shrink-0 pt-1 sm:pt-0">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors group-hover:border-teal-500 group-hover:bg-teal-600 group-hover:text-white">
                  <span>Read report</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {/* Fallback Primary Link Footer */}
      {primaryUrl && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-4 text-xs text-slate-500">
          <span>Syndicated media stream curated for PolicyDrift News.</span>
          <a
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800 hover:underline"
          >
            <span>Open primary source feed</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </section>
  );
}
