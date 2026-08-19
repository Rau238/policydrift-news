'use client';

import React, { useState } from 'react';
import type { TeamMeta } from '@/lib/cricket-flags';

export function CricketTeamFlag({
  team,
  sizeClass = 'h-6 w-6 text-xs',
}: {
  team: TeamMeta;
  sizeClass?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (team.flagUrl && !imgError) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-full border border-white/20 bg-slate-800 shadow-sm ${sizeClass} flex items-center justify-center`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={team.flagUrl}
          alt={team.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 rounded-full font-bold font-mono text-white shadow-sm flex items-center justify-center bg-gradient-to-br ${team.bgGradient || 'from-slate-700 to-slate-900'} border border-white/20 ${sizeClass}`}
      title={team.name}
    >
      {team.shortName.slice(0, 2)}
    </div>
  );
}
