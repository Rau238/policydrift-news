'use client';

import React from 'react';
import { Clock, Calendar, ChevronRight, Zap, Flame, ShieldAlert, Sparkles, Milestone } from 'lucide-react';
import { CategoryGlyph } from '@/lib/categories';
import { TimelineItem, extractTimelineFromContent } from '@/lib/story-timeline';

export type { TimelineItem };
export { extractTimelineFromContent };

interface StoryTimelineProps {
  timeline: TimelineItem[];
  category?: string;
  storyTitle?: string;
}

export function StoryTimeline({ timeline, category = 'General', storyTitle }: StoryTimelineProps) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <section className="relative my-6 pt-2">
      {/* Header */}
      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-xs">
            <Clock className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm sm:text-base font-bold text-slate-900">
                Story Timeline & Key Milestones
              </h3>
              <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-teal-700 ring-1 ring-inset ring-teal-600/20">
                {timeline.length} {timeline.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Chronological breakdown of key developments and verified updates
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-5 sm:pl-7">
        {/* Continuous Connecting Line */}
        <div
          className="absolute left-2 sm:left-3 top-2.5 bottom-2.5 w-0.5 bg-gradient-to-b from-teal-500 via-cyan-400 to-slate-200"
          aria-hidden="true"
        />

        <div className="space-y-4 sm:space-y-5">
          {timeline.map((item, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === timeline.length - 1;

            return (
              <div key={item.id || idx} className="group relative flex flex-col gap-1.5 sm:flex-row sm:gap-4">
                {/* Node Marker */}
                <div
                  className={`absolute -left-5 sm:-left-7 top-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border-2 bg-white transition-all group-hover:scale-110 shadow-xs ${
                    isFirst
                      ? 'border-teal-500 ring-4 ring-teal-500/15'
                      : isLast
                      ? 'border-cyan-500 ring-2 ring-cyan-500/10'
                      : 'border-slate-300 group-hover:border-teal-500'
                  }`}
                >
                  <div
                    className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${
                      isFirst ? 'bg-teal-500 animate-pulse' : 'bg-slate-400 group-hover:bg-teal-500'
                    }`}
                  />
                </div>

                {/* Content Card */}
                <div className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 sm:p-4 transition-all duration-200 hover:border-teal-300 hover:bg-teal-50/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-teal-800 shadow-2xs ring-1 ring-slate-200/90">
                      <Clock className="h-3 w-3 text-teal-600" />
                      <span className="tabular-nums">{item.time}</span>
                    </span>

                    {isFirst && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-100/80 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                        <Sparkles className="h-2.5 w-2.5 text-teal-600" />
                        Latest Update
                      </span>
                    )}
                  </div>

                  <h4 className="mt-1.5 text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>

                  {item.description && (
                    <p className="mt-1 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
