'use client';

import React from 'react';

interface StoryProgressBarProps {
  totalSegments: number;
  currentIndex: number;
  currentProgress: number; // 0 to 100
}

export function StoryProgressBar({
  totalSegments,
  currentIndex,
  currentProgress,
}: StoryProgressBarProps) {
  return (
    <div className="flex items-center gap-1.5 w-full px-3 pt-3 pb-2 z-30">
      {Array.from({ length: totalSegments }).map((_, idx) => {
        let widthPercent = 0;
        if (idx < currentIndex) {
          widthPercent = 100;
        } else if (idx === currentIndex) {
          widthPercent = Math.min(100, Math.max(0, currentProgress));
        } else {
          widthPercent = 0;
        }

        return (
          <div
            key={idx}
            className="relative flex-1 h-1 rounded-full bg-white/30 overflow-hidden backdrop-blur-xs"
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-white rounded-full transition-all duration-75 ease-linear"
              style={{ width: `${widthPercent}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
