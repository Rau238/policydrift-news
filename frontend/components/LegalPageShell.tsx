import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  ChevronRight,
  BookOpen,
  ShieldCheck,
  Scale,
  Cookie,
  Mail,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

import { siteName } from '@/lib/site';
import { storyFallbackImageUrl } from '@/lib/story-image';
import { editorialEmail, privacyEmail, contactEmail } from '@/lib/site-trust';

type Props = {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  lastUpdated?: string;
  activePath?: '/editorial' | '/privacy' | '/terms' | '/cookies' | '/about' | '/contact';
  children: ReactNode;
};

export function legalMetadata(title: string, description: string): Metadata {
  const ogImage = storyFallbackImageUrl({ title: `${title} | ${siteName}`, category: 'EDITORIAL' });
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      siteName,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title, type: 'image/png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteName}`,
      description,
      site: '@newsfree365',
      creator: '@newsfree365',
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

const LEGAL_NAV = [
  { href: '/editorial', label: 'Editorial Standards', icon: BookOpen },
  { href: '/privacy', label: 'Privacy Policy', icon: ShieldCheck },
  { href: '/terms', label: 'Terms of Use', icon: Scale },
  { href: '/cookies', label: 'Cookie Settings', icon: Cookie },
] as const;

export function LegalPageShell({
  title,
  subtitle,
  description,
  badge = 'Policy & Standards',
  lastUpdated = 'August 2026',
  activePath,
  children,
}: Props) {
  const summaryText = subtitle || description || '';
  const edEmail = editorialEmail();
  const privEmail = privacyEmail();
  const mainEmail = contactEmail();

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 pb-24">
      {/* Top Breadcrumb Nav - Full Standard 7xl Grid */}
      <div className="border-b border-white/[0.08] bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Link href="/" className="hover:text-cyan-300 transition">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-400">Standards & Legal</span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-emerald-400 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {title}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Header Strip - Full Standard 7xl Grid */}
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#0b1329] via-[#080d1d] to-[#050811] py-8 sm:py-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
              {badge}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Last updated: {lastUpdated}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            {title}
          </h1>
          {summaryText && (
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
              {summaryText}
            </p>
          )}

          {/* Quick Nav Segmented Buttons */}
          <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-white/[0.08]">
            {LEGAL_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950 border border-emerald-500/40'
                      : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Layout - Full Standard 7xl Grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px] py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Prose Body */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8 text-slate-300 leading-relaxed font-sans">
              {children}
            </div>
          </div>

          {/* Sidebar: Desk Contact & Trust Badges */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Contact Desk */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span>Contact Desk</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                For corrections, legal inquiries, or publisher syndication questions:
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <div>
                  <span className="block text-[11px] text-slate-500 font-mono">Editorial Team:</span>
                  <a
                    href={`mailto:${edEmail}`}
                    className="font-semibold text-emerald-400 hover:underline"
                  >
                    {edEmail}
                  </a>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500 font-mono">Privacy & Compliance:</span>
                  <a
                    href={`mailto:${privEmail}`}
                    className="font-semibold text-emerald-400 hover:underline"
                  >
                    {privEmail}
                  </a>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500 font-mono">General Desk:</span>
                  <a
                    href={`mailto:${mainEmail}`}
                    className="font-semibold text-emerald-400 hover:underline"
                  >
                    {mainEmail}
                  </a>
                </div>
              </div>
            </div>

            {/* Trust & Transparency Box */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>Our Principles</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Full Source Attribution:</strong> Every story explicitly cites its reporting source.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Reader First:</strong> No paywalls or invasive tracking scripts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Rapid Correction:</strong> Honest handling of retractions and updates.</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md space-y-2.5 text-xs">
              <span className="font-bold text-white uppercase tracking-wider block text-[11px]">Related Information</span>
              <Link href="/about" className="flex items-center justify-between text-slate-300 hover:text-white group">
                <span>About NewsFree365</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </Link>
              <Link href="/contact" className="flex items-center justify-between text-slate-300 hover:text-white group">
                <span>Contact Newsroom</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
