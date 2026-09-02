import Link from 'next/link';
import { LegalPageShell, legalMetadata } from '@/components/LegalPageShell';
import { BookOpen, Award, CheckCircle2, Shield, ArrowUpRight, Sparkles, Layers } from 'lucide-react';
import { contactEmail, editorialEmail } from '@/lib/site-trust';

export const metadata = legalMetadata(
  'About NewsFree365 Newsroom',
  'NewsFree365 is an editorial newsroom synthesizing law, governance, markets, and world intelligence.',
);

export default function AboutPage() {
  return (
    <LegalPageShell
      title="About NewsFree365"
      subtitle="A modern, noise-free newsroom for law, macroeconomic policy, financial markets, and world events with honest attribution."
      badge="About Our Newsroom"
      lastUpdated="August 2026"
      activePath="/about"
    >
      {/* Section 1: Introduction */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <BookOpen className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>Who We Are</span>
        </h2>
        <p>
          NewsFree365 brings together headlines and reporting from verified RSS and syndication feeds across breaking news, world politics, India, business, banking, and real-time sports.
        </p>
        <p>
          Our mission is to help readers scan what matters with clear labels, stable URLs, transparent sourcing, and plain-language summaries—without replacing the dedicated field reporters and editors who produce the primary reporting.
        </p>
      </section>

      {/* Section 2: Original Value */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
          <span>Editorial Value-Add on Syndicated Reporting</span>
        </h2>
        <p>
          Pure aggregation without context creates information overload. NewsFree365 adds value through:
        </p>
        <ul className="space-y-2 list-disc pl-5 text-slate-300">
          <li>
            <strong className="text-white">Structured Desk Categorization:</strong> Clean separation across Banking, Markets, Politics, and Sports.
          </li>
          <li>
            <strong className="text-white">Macroeconomic Key Takeaways:</strong> On our Banking & Economics desk, we craft concise framing highlighting the impact on interest rates, inflation, and financial stability.
          </li>
          <li>
            <strong className="text-white">Permanent Canonical Attribution:</strong> Direct outbound links to the original publisher for full quotes, photojournalism, and original reporting.
          </li>
        </ul>
      </section>

      {/* Section 3: Transparency & Accountability */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-cyan-400 shrink-0" />
          <span>Transparency & Contact</span>
        </h2>
        <p>
          For questions regarding our editorial workflow or to submit a correction, please review our{' '}
          <Link href="/editorial" className="font-semibold text-emerald-400 hover:underline">
            Editorial Standards
          </Link>{' '}
          or reach out directly via our{' '}
          <Link href="/contact" className="font-semibold text-emerald-400 hover:underline">
            Contact Newsroom
          </Link>{' '}
          page.
        </p>
      </section>
    </LegalPageShell>
  );
}
