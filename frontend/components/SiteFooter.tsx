import Link from 'next/link';
import { FileText, Fingerprint, Map, Rss, Scale, Shield } from 'lucide-react';
import { siteName } from '@/lib/site';
import { CATEGORY_ORDER, categoryHref, categoryLabel, CategoryGlyph } from '@/lib/category-theme';

const legalLinks = [
  { href: '/terms', label: 'Terms of use', Icon: Scale },
  { href: '/privacy', label: 'Privacy', Icon: Shield },
  { href: '/cookies', label: 'Cookies', Icon: Fingerprint },
  { href: '/editorial', label: 'Editorial standards', Icon: FileText },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-teal-900/30 bg-[#070b14] text-slate-400">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgb(13_148_136/0.18),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[min(100%,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-5">
            <p className="font-display text-[1.65rem] font-bold leading-tight tracking-tight text-white sm:text-3xl">
              {siteName}
            </p>
            <p className="mt-1 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-400/90">
              Policy & world briefs
            </p>
            <p className="mt-5 max-w-md text-sm leading-[1.7] text-slate-400">
              Curated desks, clear headlines, and sources on every story. Built for readers who want context without
              noise.
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-teal-300">
              <Rss className="h-3.5 w-3.5 text-teal-500" aria-hidden />
              Desks
            </p>
            <ul className="mt-6 space-y-3 text-[15px] leading-snug">
              {CATEGORY_ORDER.filter((c) => c !== 'General').map((c) => (
                <li key={c}>
                  <Link
                    href={categoryHref(c)}
                    className="group flex items-center gap-3 text-slate-400 transition hover:text-teal-200"
                  >
                    <CategoryGlyph
                      name={c}
                      className="h-4 w-4 shrink-0 text-teal-600/90 transition group-hover:text-teal-400"
                    />
                    <span className="border-b border-transparent group-hover:border-teal-500/40">
                      {categoryLabel(c)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-teal-300">
              <Map className="h-3.5 w-3.5 text-teal-500" aria-hidden />
              Site
            </p>
            <ul className="mt-6 space-y-3 text-[15px]">
              <li>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2.5 text-slate-400 transition hover:text-teal-200"
                >
                  <FileText className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  All news
                </Link>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  className="inline-flex items-center gap-2.5 text-slate-400 transition hover:text-teal-200"
                >
                  <Map className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  Sitemap
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-teal-300">
              <Scale className="h-3.5 w-3.5 text-teal-500" aria-hidden />
              Legal
            </p>
            <ul className="mt-6 space-y-3 text-[15px]">
              {legalLinks.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2.5 text-slate-400 transition hover:text-teal-200"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-white/[0.07] pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-slate-500">
            © {new Date().getFullYear()} {siteName}. Headlines and media belong to their respective publishers; we link
            to originals.
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-500" aria-label="Legal">
            <Link href="/privacy" className="transition hover:text-teal-300">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-teal-300">
              Terms
            </Link>
            <Link href="/cookies" className="transition hover:text-teal-300">
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
