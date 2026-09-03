'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ArrowUp,
  Building2,
  FileText,
  Fingerprint,
  Globe,
  Mail,
  Map,
  Radio,
  Rss,
  Scale,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { siteName } from '@/lib/site';
import { CATEGORY_ORDER, categoryHref, categoryLabel, CategoryGlyph } from '@/lib/category-theme';
import { BrandMark } from '@/components/BrandMark';
import { NewsletterSubscribeBox } from '@/components/NewsletterSubscribeBox';

const quickLinks = [
  { href: '/news', label: 'Global Wire', Icon: Rss },
  { href: '/trending-india', label: 'Trending Desk', Icon: TrendingUp },
  { href: '/about', label: 'Newsroom Mission', Icon: Building2 },
  { href: '/contact', label: 'Editorial Contact', Icon: Mail },
  { href: '/sitemap.xml', label: 'Sitemap', Icon: Map },
] as const;

const legalLinks = [
  { href: '/editorial', label: 'Editorial Standards', Icon: FileText },
  { href: '/privacy', label: 'Privacy Standards', Icon: Shield },
  { href: '/terms', label: 'Terms of Use', Icon: Scale },
  { href: '/cookies', label: 'Cookie Settings', Icon: Fingerprint },
] as const;

export function SiteFooter() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/[0.08] bg-[#050811] text-slate-400">
      {/* Aurora Ambient Glows */}
      <div
        className="pointer-events-none absolute -top-32 left-1/4 h-[22rem] w-[min(40rem,80vw)] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 right-1/4 h-[22rem] w-[min(40rem,80vw)] translate-x-1/2 rounded-full bg-purple-500/10 blur-[100px]"
        aria-hidden
      />

      {/* Micro Dot Matrix Pattern Overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px]"
        aria-hidden
      />

      {/* Top Accent Line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 via-[50%] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 2xl:max-w-[1440px]">


        {/* Global Newsletter Subscription Banner */}
        <div className="mb-10">
          <NewsletterSubscribeBox />
        </div>

        {/* Main 4-Column Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Col 1: Brand & Telemetry */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <BrandMark sizeClass="h-9 w-9 transition-transform duration-200 group-hover:scale-105" />
              <div>
                <span className="font-display text-xl font-bold tracking-tight text-white">
                  {siteName}
                </span>

              </div>
            </Link>

            <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-400">
              Clear, verified reporting. Every report links directly to primary sources.
            </p>

            {/* Telemetry Status Card */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-slate-300 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                8 Desks Operational
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Live
              </span>
            </div>
          </div>

          {/* Col 2: Global Desks Interactive Grid */}
          <div className="lg:col-span-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-400">
              <Rss className="h-3 w-3" aria-hidden />
              Global Coverage Desks
            </p>

            <div className="mt-3.5 grid grid-cols-2 gap-1.5">
              {CATEGORY_ORDER.filter((c) => c !== 'General').map((c) => (
                <Link
                  key={c}
                  href={categoryHref(c)}
                  className="group flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                >
                  <CategoryGlyph name={c} className="h-3 w-3 text-cyan-300 shrink-0" />
                  <span className="truncate">{categoryLabel(c)}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3: Navigation Platform */}
          <div className="lg:col-span-2">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-400">
              <Globe className="h-3 w-3" aria-hidden />
              Platform
            </p>
            <ul className="mt-3.5 space-y-2 text-xs">
              {quickLinks.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-2 text-slate-400 transition hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-cyan-400" aria-hidden />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Editorial Standards & Legal */}
          <div className="lg:col-span-2">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-400">
              <Scale className="h-3 w-3" aria-hidden />
              Standards & Legal
            </p>
            <ul className="mt-3.5 space-y-2 text-xs">
              {legalLinks.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-2 text-slate-400 transition hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-cyan-400" aria-hidden />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Symmetrical Copyright Bar + Legal Quicklinks */}
        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
          <p className="font-medium">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="/cookies" className="transition hover:text-white">
              Cookies
            </Link>
            <Link href="/sitemap.xml" className="transition hover:text-white">
              Sitemap
            </Link>

            <button
              onClick={scrollToTop}
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-300 backdrop-blur-md transition hover:border-white/30 hover:bg-white/10 hover:text-white active:scale-95"
              aria-label="Scroll back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* Giant Brand Typography Watermark - 100% Visible & Vector Scaled */}
        <div className="mt-8 -mb-4 w-full select-none pointer-events-none overflow-hidden">
          <svg
            viewBox="0 0 1350 170"
            className="w-full h-auto max-h-32 sm:max-h-44 md:max-h-56 lg:max-h-64"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="footerBrandGrad" x1="0" y1="0" x2="0" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#ffffff" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="62%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="url(#footerBrandGrad)"
              className="font-display font-black uppercase tracking-[0.08em]"
              style={{
                fontSize: '135px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-sora), system-ui, sans-serif',
              }}
            >
              {siteName.toUpperCase()}
            </text>
          </svg>
        </div>
      </div>
    </footer>
  );
}
