'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  categoryHref,
  categoryLabel,
  categoryNavPillClass,
  CategoryGlyph,
} from '@/lib/category-theme';
import {
  ChevronDown,
  ChevronRight,
  CalendarDays,
  TrendingUp,
  Building2,
  Rocket,
  Coins,
  Flame,
  ArrowRight,
  ExternalLink,
  Compass,
  X,
  Clapperboard,
  Atom,
  HeartPulse,
  Car,
  Vote,
  Globe,
  Award,
  Trophy,
} from 'lucide-react';
import { CountryFlag } from '@/components/CountryFlag';

function deskPillClass(themeClass: string, extra = '') {
  return `inline-flex items-center gap-1 rounded-full font-semibold ring-1 transition active:scale-[0.98] ${themeClass} ${extra}`;
}

type CalendarSubmenuCard = {
  title: string;
  desc: string;
  href: string;
  badge: string;
  badgeColor: string;
  icon: typeof TrendingUp;
  iconColor: string;
  cardBorder: string;
  region: 'india' | 'global' | 'both';
};

const CALENDAR_SUBMENU_CARDS: CalendarSubmenuCard[] = [
  {
    title: 'Macro Economic Calendar',
    desc: 'RBI Repo Rate, US Fed FOMC, CPI Inflation, GDP & IIP Prints',
    href: '/calendar/macro',
    badge: 'CENTRAL BANKS',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    icon: TrendingUp,
    iconColor: 'text-cyan-400 bg-cyan-950/80 border-cyan-700/60 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    cardBorder: 'border-slate-800/80 hover:border-cyan-500/50 hover:bg-gradient-to-br hover:from-cyan-950/30 hover:to-slate-900/80',
    region: 'both',
  },
  {
    title: 'Market & Exchange Holidays',
    desc: 'NSE, BSE, MCX & NYSE trading schedules, closures & special sessions',
    href: '/calendar/holidays',
    badge: 'EXCHANGES',
    badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    icon: Building2,
    iconColor: 'text-indigo-400 bg-indigo-950/80 border-indigo-700/60 group-hover:border-indigo-400 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]',
    cardBorder: 'border-slate-800/80 hover:border-indigo-500/50 hover:bg-gradient-to-br hover:from-indigo-950/30 hover:to-slate-900/80',
    region: 'both',
  },

  {
    title: 'Commodities & Energy Agenda',
    desc: 'OPEC+ output decisions, EIA crude inventories & bullion expiry',
    href: '/calendar/commodities',
    badge: 'COMMODITIES',
    badgeColor: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    icon: Flame,
    iconColor: 'text-orange-400 bg-orange-950/80 border-orange-700/60 group-hover:border-orange-400 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]',
    cardBorder: 'border-slate-800/80 hover:border-orange-500/50 hover:bg-gradient-to-br hover:from-orange-950/30 hover:to-slate-900/80',
    region: 'global',
  },
];

const EXTENDED_MORE_DESKS = [
  {
    name: 'Cricket',
    label: 'Cricket & Live Matches',
    desc: 'Live ball-by-ball scorecards, tournament fixtures & telemetry',
    icon: Trophy,
    color: 'text-emerald-400 bg-emerald-950/80 border-emerald-700/50',
    href: '/sports/cricket',
  },
  {
    name: 'Entertainment',
    label: 'Entertainment & Cinema',
    desc: 'Movies, OTT releases, box office tracking & pop culture',
    icon: Clapperboard,
    color: 'text-pink-400 bg-pink-950/80 border-pink-700/50',
    href: '/news/entertainment',
  },
  {
    name: 'Science',
    label: 'Science & Space',
    desc: 'Space exploration, astronomy, climate research & discoveries',
    icon: Atom,
    color: 'text-teal-400 bg-teal-950/80 border-teal-700/50',
    href: '/news/science',
  },
  {
    name: 'Health',
    label: 'Health & Wellness',
    desc: 'Medical breakthroughs, healthcare alerts & fitness science',
    icon: HeartPulse,
    color: 'text-rose-400 bg-rose-950/80 border-rose-700/50',
    href: '/news/health',
  },
  {
    name: 'Auto',
    label: 'Auto & Mobility',
    desc: 'Electric vehicles (EV), automotive industry & transport tech',
    icon: Car,
    color: 'text-amber-400 bg-amber-950/80 border-amber-700/50',
    href: '/news/auto',
  },
  {
    name: 'Startups',
    label: 'Startups & Venture Capital',
    desc: 'Funding rounds, unicorns, tech founders & ecosystem briefings',
    icon: Rocket,
    color: 'text-purple-400 bg-purple-950/80 border-purple-700/50',
    href: '/news/startups',
  },
  {
    name: 'Politics',
    label: 'Politics & Governance',
    desc: 'Elections, government legislation, diplomacy & policy',
    icon: Vote,
    color: 'text-indigo-400 bg-indigo-950/80 border-indigo-700/50',
    href: '/news/politics',
  },
  {
    name: 'Crypto',
    label: 'Crypto & Digital Assets',
    desc: 'Bitcoin, Ethereum, DeFi, regulatory updates & tokenomics',
    icon: Coins,
    color: 'text-orange-400 bg-orange-950/80 border-orange-700/50',
    href: '/news/crypto',
  },
];

const PRIMARY_NAV_KEYS = [
  'Breaking',
  'World News',
  'India',
  'Sports',
  'Business',
  'Banking & Economics',
  'Stocks & Markets',
  'Technology',
  'Crypto',
] as const;

export function CategoryNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [mobileTop, setMobileTop] = useState<number>(106);
  const [moreMobileTop, setMoreMobileTop] = useState<number>(106);

  const containerRef = useRef<HTMLDivElement>(null);
  const moreContainerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const moreCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Position Economy Calendar popover cleanly below the category button on mobile
  useEffect(() => {
    if (!menuOpen) return;
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMobileTop(Math.round(rect.bottom + 8));
      }
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [menuOpen]);

  // Position More Desks popover cleanly below the category button on mobile
  useEffect(() => {
    if (!moreMenuOpen) return;
    const updatePosition = () => {
      if (moreContainerRef.current) {
        const rect = moreContainerRef.current.getBoundingClientRect();
        setMoreMobileTop(Math.round(rect.bottom + 8));
      }
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [moreMenuOpen]);

  // Close on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setMenuOpen(false);
      }
      if (moreContainerRef.current && !moreContainerRef.current.contains(target)) {
        setMoreMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setMoreMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (moreCloseTimeoutRef.current) clearTimeout(moreCloseTimeoutRef.current);
    };
  }, []);

  function handleMouseEnter() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMoreMenuOpen(false);
    setMenuOpen(true);
  }

  function handleMouseLeave() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 220);
  }

  function handleMoreMouseEnter() {
    if (moreCloseTimeoutRef.current) {
      clearTimeout(moreCloseTimeoutRef.current);
      moreCloseTimeoutRef.current = null;
    }
    setMenuOpen(false);
    setMoreMenuOpen(true);
  }

  function handleMoreMouseLeave() {
    if (moreCloseTimeoutRef.current) {
      clearTimeout(moreCloseTimeoutRef.current);
    }
    moreCloseTimeoutRef.current = setTimeout(() => {
      setMoreMenuOpen(false);
    }, 220);
  }

  const filteredCalendarCards = CALENDAR_SUBMENU_CARDS;

  return (
    <nav
      className="relative flex flex-nowrap items-center gap-1.5 sm:gap-2 overflow-x-auto sm:overflow-visible scroll-py-1 pb-1 pt-0.5 pd-scrollbar-none"
      aria-label="News desks"
    >
      {PRIMARY_NAV_KEYS.map((key) => {
        const isBankingAndEconomics = key === 'Banking & Economics';

        return (
          <span key={key} className="contents">
            {/* Standard Category Pill */}
            <span className="snap-start shrink-0">
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

            {/* Dedicated Economy Calendar Category Button (Placed immediately after Banking & Economics) */}
            {isBankingAndEconomics && (
              <div
                ref={containerRef}
                className={`relative snap-start shrink-0 ${menuOpen ? 'z-50' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setMoreMenuOpen(false);
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      setMobileTop(Math.round(rect.bottom + 8));
                    }
                    setMenuOpen((prev) => !prev);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 transition-all duration-200 active:scale-[0.98] px-2.5 py-1 text-[11px] leading-tight max-md:shadow-sm max-md:shadow-black/20 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs cursor-pointer ${menuOpen
                    ? 'bg-cyan-500/25 text-cyan-100 ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                    : 'bg-gradient-to-r from-cyan-500/15 via-teal-500/15 to-blue-500/15 text-cyan-200 ring-cyan-400/35 hover:bg-cyan-500/25 hover:ring-cyan-400/55 hover:text-white'
                    }`}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  title="Toggle Economic & Financial Calendar Submenu"
                >
                  <CalendarDays className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-cyan-300 shrink-0" />
                  <span className="whitespace-nowrap font-bold">Economy Calendar</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 shrink-0 ${menuOpen ? 'rotate-180 text-cyan-200' : 'text-cyan-400/90'
                      }`}
                  />
                </button>

                {/* Mobile Backdrop Only - Hidden on Desktop to Prevent Hover Flicker */}
                {menuOpen && (
                  <div
                    className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xs sm:hidden animate-in fade-in duration-100"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />
                )}

                {/* Economy Calendar Submenu (Seamless Hover Bridge on Desktop & Positioned Cleanly Below Button on Mobile) */}
                {menuOpen && (
                  <div
                    style={{ '--mobile-top': `${mobileTop}px` } as React.CSSProperties}
                    className="fixed left-2.5 right-2.5 top-[var(--mobile-top,106px)] sm:top-full sm:left-1/2 sm:-translate-x-1/2 sm:w-[740px] lg:w-[840px] sm:max-w-[calc(100vw-2rem)] sm:absolute sm:pt-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    role="menu"
                    aria-label="Economy and Calendar Navigation"
                  >
                    <div
                      style={{ backgroundColor: '#080e1a' }}
                      className="relative overflow-hidden sm:overflow-y-auto rounded-2xl border border-cyan-500/40 p-3 sm:p-5 shadow-[0_25px_60px_-15px_rgba(6,182,212,0.4)]"
                    >
                      {/* ── Mobile Compact View (< sm): 100% Non-Scrollable & Perfectly Fitted ── */}
                      <div className="sm:hidden space-y-2">
                        {/* Mobile Header Bar */}
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                            <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                              Financial Calendar Desks
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMenuOpen(false)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white transition"
                            aria-label="Close menu"
                          >
                            <X size={13} />
                          </button>
                        </div>

                        {/* 3 Compact Desk Links (Fits within ~150px) */}
                        <div className="space-y-1.5">
                          {CALENDAR_SUBMENU_CARDS.map((item) => {
                            const IconComponent = item.icon;
                            return (
                              <Link
                                key={item.title}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                style={{ backgroundColor: '#0e1626' }}
                                className={`flex items-center justify-between gap-2.5 rounded-xl border p-2 transition ${item.cardBorder} active:scale-[0.98]`}
                                role="menuitem"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${item.iconColor}`}
                                  >
                                    <IconComponent size={14} />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-white truncate">
                                      {item.title}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 truncate">
                                      {item.desc}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span
                                    className={`rounded px-1.5 py-0.2 text-[8px] font-black border uppercase tracking-wider ${item.badgeColor}`}
                                  >
                                    {item.badge}
                                  </span>
                                  <ChevronRight size={13} className="text-slate-500" />
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        {/* Mobile Open Full Hub Action */}
                        <Link
                          href="/calendar"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-900/50 hover:text-white transition"
                        >
                          <span>Open Full Calendar Hub</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>

                      {/* ── Desktop View (>= sm): Full Matrix with Interactive Cards & Filters ── */}
                      <div className="hidden sm:block">
                        {/* Header Bar */}
                        <div className="mb-3.5 flex items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                            <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                              Financial &amp; Economic Calendar Matrix
                            </span>
                            <span className="rounded bg-cyan-950/80 px-1.5 py-0.5 text-[9px] font-extrabold text-cyan-400 border border-cyan-800/60">
                              3 LIVE DESKS
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setMenuOpen(false)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white transition"
                              aria-label="Close menu"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Category Cards Grid (3-column layout) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {filteredCalendarCards.map((item) => {
                            const IconComponent = item.icon;
                            return (
                              <Link
                                key={item.title}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                style={{ backgroundColor: '#0e1626' }}
                                className={`group flex flex-col justify-between rounded-xl border p-3 transition-all duration-200 ${item.cardBorder} hover:shadow-lg`}
                                role="menuitem"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                                    <div
                                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${item.iconColor} transition-transform group-hover:scale-105`}
                                    >
                                      <IconComponent size={15} />
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {item.region === 'india' ? (
                                        <CountryFlag iso="in" size={14} />
                                      ) : item.region === 'global' ? (
                                        <Globe size={12} className="text-slate-400" />
                                      ) : null}
                                      <span
                                        className={`rounded px-1.5 py-0.5 text-[9px] font-black border tracking-wider shrink-0 ${item.badgeColor}`}
                                      >
                                        {item.badge}
                                      </span>
                                    </div>
                                  </div>

                                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                                    {item.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug group-hover:text-slate-300 transition-colors">
                                    {item.desc}
                                  </p>
                                </div>

                                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-semibold text-slate-400 group-hover:text-cyan-300 transition-colors">
                                  <span>View desk schedule</span>
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800/60 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-all group-hover:translate-x-0.5">
                                    <ArrowRight size={11} />
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </span>
        );
      })}

      {/* "More Desks ▾" Side Category Dropdown Button */}
      <div
        ref={moreContainerRef}
        className={`relative snap-start shrink-0 ${moreMenuOpen ? 'z-50' : ''}`}
        onMouseEnter={handleMoreMouseEnter}
        onMouseLeave={handleMoreMouseLeave}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen(false);
            if (moreContainerRef.current) {
              const rect = moreContainerRef.current.getBoundingClientRect();
              setMoreMobileTop(Math.round(rect.bottom + 8));
            }
            setMoreMenuOpen((prev) => !prev);
          }}
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 transition-all duration-200 active:scale-[0.98] px-2.5 py-1 text-[11px] leading-tight max-md:shadow-sm max-md:shadow-black/20 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs cursor-pointer ${moreMenuOpen
            ? 'bg-purple-500/25 text-purple-100 ring-2 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.35)]'
            : 'bg-purple-500/15 text-purple-200 ring-purple-400/30 hover:bg-purple-500/25 hover:ring-purple-400/50 hover:text-white'
            }`}
          aria-expanded={moreMenuOpen}
          aria-haspopup="menu"
          title="Toggle Extended Categories"
        >
          <Compass className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-300 shrink-0" />
          <span className="whitespace-nowrap font-bold">More Desks</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 shrink-0 ${moreMenuOpen ? 'rotate-180 text-purple-200' : 'text-purple-400/90'
              }`}
          />
        </button>

        {/* Mobile Backdrop Only - Hidden on Desktop to Prevent Hover Flicker */}
        {moreMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xs sm:hidden animate-in fade-in duration-100"
            onClick={() => setMoreMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* More Desks Submenu (Seamless Hover Bridge on Desktop) */}
        {moreMenuOpen && (
          <div
            style={{ '--more-mobile-top': `${moreMobileTop}px` } as React.CSSProperties}
            className="fixed left-3 right-3 top-[var(--more-mobile-top,106px)] sm:top-full sm:right-0 sm:left-auto sm:w-80 lg:w-96 sm:absolute sm:pt-2 z-50 animate-in fade-in zoom-in-95 duration-150"
            role="menu"
            aria-label="Extended Categories Menu"
          >
            <div
              style={{ backgroundColor: '#080e1a' }}
              className="relative max-h-[82vh] sm:max-h-[75vh] overflow-y-auto rounded-2xl border border-purple-500/40 p-3.5 shadow-[0_25px_60px_-15px_rgba(168,85,247,0.4)]"
            >
              {/* Header */}
              <div className="mb-2.5 flex items-center justify-between border-b border-slate-800/80 pb-2 px-1">
                <div className="flex items-center gap-2">
                  <Compass size={14} className="text-purple-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                    Explore Specialized Beats
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white transition"
                  aria-label="Close menu"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Desk List */}
              <div className="space-y-1.5">
                {EXTENDED_MORE_DESKS.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMoreMenuOpen(false)}
                      style={{ backgroundColor: '#0e1626' }}
                      className="group flex items-center justify-between gap-3 rounded-xl p-2.5 transition border border-slate-800/80 hover:border-purple-500/50 hover:bg-purple-950/40"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${item.color} transition-transform group-hover:scale-105`}
                        >
                          <IconComp size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                            {item.label}
                          </span>
                          <p className="text-[11px] text-slate-300 line-clamp-1 group-hover:text-white transition-colors mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/40 group-hover:text-purple-300 transition-all group-hover:translate-x-0.5">
                        <ArrowRight size={12} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
