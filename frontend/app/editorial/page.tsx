import Link from 'next/link';
import { LegalPageShell, legalMetadata } from '@/components/LegalPageShell';
import { editorialEmail } from '@/lib/site-trust';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Globe2,
  Flame,
  Shield,
  Layers,
} from 'lucide-react';

export const metadata = legalMetadata(
  'Editorial Standards & Sourcing Guidelines',
  'How PolicyDrift verifies, curates, attributes, and presents syndicated news with clarity and integrity.',
);

export default function EditorialPage() {
  return (
    <LegalPageShell
      title="Editorial Standards"
      subtitle="Our charter for factual verification, honest attribution, source diversity, and rapid corrections across all news desks."
      badge="Editorial Charter"
      lastUpdated="August 2026"
      activePath="/editorial"
    >
      {/* Section 1: Editorial Mission */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <BookOpen className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>1. Mission & Editorial Charter</span>
        </h2>
        <p>
          PolicyDrift is a modern, high-frequency newsroom dedicated to delivering concise, factual, and actionable
          briefs across global politics, law, governance, financial markets, and world affairs. Our objective is to
          eliminate sensationalism and information overload by providing clean, categorized intelligence that empowers
          readers to scan and comprehend what matters in seconds.
        </p>
        <p>
          We operate as a curated news synthesis service. We do not manufacture unverified rumors; rather, we synthesize,
          index, and highlight verified reporting from reputable global wire services, national press agencies, and official
          regulatory bodies.
        </p>
      </section>

      {/* Section 2: Source Selection & Attribution */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Globe2 className="h-5 w-5 text-cyan-400 shrink-0" />
          <span>2. Sourcing, Verification & Attribution</span>
        </h2>
        <p>
          Authenticity and intellectual honesty are fundamental to our work. Every story published on PolicyDrift adheres
          to strict attribution standards:
        </p>
        <ul className="space-y-2 list-disc pl-5 text-slate-300">
          <li>
            <strong className="text-white">Primary Source Crediting:</strong> Every article prominently credits its
            originating publisher (e.g., Reuters, PTI, ANI, Financial Times, Bloomberg, BBC) and provides a direct, stable
            canonical link to the original reporting.
          </li>
          <li>
            <strong className="text-white">Original Reporting Respect:</strong> We do not claim proprietary copyright over
            wire reporting. The primary publishing organization remains the definitive source of record.
          </li>
          <li>
            <strong className="text-white">Editorial Value-Add:</strong> Where permitted, our desk adds concise editorial framing,
            structured key takeaways, market telemetry, and background context to help readers assess macroeconomic or legal impact.
          </li>
        </ul>
      </section>

      {/* Section 3: Desks & Categorization */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Layers className="h-5 w-5 text-purple-400 shrink-0" />
          <span>3. Specialized Desk Organization</span>
        </h2>
        <p>
          Stories are categorized into dedicated thematic desks to provide structured coverage:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-3.5">
            <span className="font-bold text-white text-sm block mb-1">🏦 Banking & Economics</span>
            <p className="text-xs text-slate-400">
              Focus on interest rates, monetary policy (RBI, Fed, ECB), inflation benchmarks, and fiscal reforms with structured key takeaways.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-3.5">
            <span className="font-bold text-white text-sm block mb-1">⚖️ Governance & Law</span>
            <p className="text-xs text-slate-400">
              Legislative bills, Supreme Court rulings, regulatory amendments, and policy directives affecting business and civic life.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-3.5">
            <span className="font-bold text-white text-sm block mb-1">📈 Markets & Corporate</span>
            <p className="text-xs text-slate-400">
              Live index trackers, capital allocation decisions, corporate governance updates, and earnings developments.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-3.5">
            <span className="font-bold text-white text-sm block mb-1">🏏 Sports & Live Center</span>
            <p className="text-xs text-slate-400">
              Real-time ball-by-ball telemetry, verified match scorecards, tournaments, and global sporting championships.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Corrections & Retractions */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
          <span>4. Corrections, Clarifications & Retractions</span>
        </h2>
        <p>
          We are committed to correcting errors swiftly and transparently:
        </p>
        <ul className="space-y-2 list-disc pl-5 text-slate-300">
          <li>
            If an underlying wire service issues a correction, update, or retraction, our system updates the respective article brief promptly.
          </li>
          <li>
            Factual errors in editorial summaries or headlines are rectified immediately with updated timestamps.
          </li>
          <li>
            Readers, journalists, or publishers can report factual inaccuracies directly to{' '}
            <a href={`mailto:${editorialEmail()}`} className="font-semibold text-emerald-400 hover:underline">
              {editorialEmail()}
            </a>
            . We review correction requests within 24 hours.
          </li>
        </ul>
      </section>

      {/* Section 5: Journalistic Independence */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-rose-400 shrink-0" />
          <span>5. Journalistic Independence & Neutrality</span>
        </h2>
        <p>
          PolicyDrift is fully independent. Desk grouping, headline curation, and priority feeds are driven purely by
          newsworthiness, public interest, and verifiability. We maintain strict neutrality and do not endorse any political
          party, commercial sponsor, or ideological faction.
        </p>
      </section>
    </LegalPageShell>
  );
}
