'use client';

import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface FootballTeamLogoProps {
  name: string;
  logoUrl?: string | null;
  sizeClass?: string;
  className?: string;
}

export function FootballTeamLogo({
  name,
  logoUrl,
  sizeClass = 'h-7 w-7',
  className = '',
}: FootballTeamLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Generate 2-3 letter abbreviation initials
  const initials = (() => {
    if (!name) return 'FC';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
    return words.slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  })();

  if (logoUrl && !imgError) {
    return (
      <div
        className={`relative inline-flex shrink-0 items-center justify-center rounded-full bg-white p-0.5 shadow-2xs border border-slate-200/90 overflow-hidden ${sizeClass} ${className}`}
      >
        <img
          src={logoUrl}
          alt={name}
          loading="lazy"
          className="h-full w-full object-contain rounded-full"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      title={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold text-[10px] tracking-tight shadow-2xs border border-slate-300/80 ${sizeClass} ${className}`}
    >
      {initials.length <= 2 ? (
        <span>{initials}</span>
      ) : (
        <Shield className="h-3.5 w-3.5 text-emerald-400" />
      )}
    </div>
  );
}
