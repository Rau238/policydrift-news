'use client';

import React, { useState } from 'react';
import { Globe, Flame } from 'lucide-react';

export interface CountryFlagProps {
  iso?: string;
  flag?: string; // Emoji like '🇮🇳' or '🇺🇸'
  country?: string; // 'IN', 'US', 'GLOBAL', etc.
  className?: string;
  size?: number; // width in px, default 20
  alt?: string;
}

/**
 * Normalizes input to ISO-2 country code or special token
 */
function resolveIso(iso?: string, flag?: string, country?: string): string {
  if (iso) {
    const c = iso.toLowerCase().trim();
    if (c === 'india') return 'in';
    if (c === 'usa' || c === 'united states') return 'us';
    if (c === 'uk' || c === 'britain') return 'gb';
    return c;
  }
  if (country) {
    const c = country.toLowerCase().trim();
    if (c === 'in' || c === 'india') return 'in';
    if (c === 'us' || c === 'usa' || c === 'united states') return 'us';
    if (c === 'eu' || c === 'europe') return 'eu';
    if (c === 'gb' || c === 'uk') return 'gb';
    if (c === 'global' || c === 'both') return 'global';
    return c;
  }
  if (flag) {
    if (flag.includes('🇮🇳')) return 'in';
    if (flag.includes('🇺🇸')) return 'us';
    if (flag.includes('🇪🇺')) return 'eu';
    if (flag.includes('🇬🇧')) return 'gb';
    if (flag.includes('🌐')) return 'global';
    if (flag.includes('🛢️') || flag.includes('🔥')) return 'commodities';
  }
  return 'global';
}

function flagCdnPair(size: number): { oneX: string; twoX: string; width: number; height: number } {
  if (size <= 18) return { oneX: '20x15', twoX: '40x30', width: 16, height: 12 };
  if (size <= 24) return { oneX: '20x15', twoX: '40x30', width: 20, height: 15 };
  if (size <= 32) return { oneX: '24x18', twoX: '48x36', width: 26, height: 19 };
  return { oneX: '32x24', twoX: '64x48', width: 32, height: 24 };
}

export function CountryFlag({
  iso,
  flag,
  country,
  className = '',
  size = 20,
  alt,
}: CountryFlagProps) {
  const [error, setError] = useState(false);
  const code = resolveIso(iso, flag, country);

  if (code === 'global') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`} title="Global">
        <Globe size={Math.max(12, Math.round(size * 0.75))} className="text-violet-400" />
      </span>
    );
  }

  if (code === 'commodities') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`} title="Commodities">
        <Flame size={Math.max(12, Math.round(size * 0.75))} className="text-orange-400" />
      </span>
    );
  }

  const { oneX, twoX, width, height } = flagCdnPair(size);
  const flagLabel = alt || `${code.toUpperCase()} flag`;

  if (error || !/^[a-z]{2}$/.test(code)) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-[2px] bg-slate-800 px-1 font-mono text-[9px] font-bold text-slate-300 border border-slate-700 ${className}`}
        style={{ minWidth: width, height }}
      >
        {code.toUpperCase().slice(0, 2)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${oneX}/${code}.png`}
      srcSet={`https://flagcdn.com/${twoX}/${code}.png 2x`}
      width={width}
      height={height}
      alt={flagLabel}
      title={flagLabel}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      className={`inline-block shrink-0 rounded-[2.5px] object-cover shadow-xs ring-1 ring-white/20 ${className}`}
    />
  );
}

export default CountryFlag;
