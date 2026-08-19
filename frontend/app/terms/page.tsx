import Link from 'next/link';
import { LegalPageShell, legalMetadata } from '@/components/LegalPageShell';
import {
  Scale,
  FileText,
  AlertTriangle,
  Copyright,
  CheckCircle,
  Ban,
  HelpCircle,
} from 'lucide-react';

export const metadata = legalMetadata(
  'Terms of Use & Service Agreement',
  'Terms and legal conditions governing the use of the PolicyDrift platform and news services.',
);

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Use"
      subtitle="The rules, conditions, and legal disclaimers governing your access to and use of the PolicyDrift platform."
      badge="Legal Agreement"
      lastUpdated="August 2026"
      activePath="/terms"
    >
      {/* Section 1: Acceptance */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Scale className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>1. Acceptance of Terms</span>
        </h2>
        <p>
          Welcome to PolicyDrift (<code>https://www.policydrift.live</code>). By accessing, browsing, or utilizing any portion of our website, real-time sports tickers, RSS feeds, or API endpoints, you agree to be bound by these Terms of Use and our associated{' '}
          <Link href="/privacy" className="text-emerald-400 font-semibold hover:underline">
            Privacy Policy
          </Link>
          . If you do not agree to these terms, please discontinue use of the platform immediately.
        </p>
      </section>

      {/* Section 2: Platform Purpose & Editorial Role */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-cyan-400 shrink-0" />
          <span>2. Platform Scope & News Syndication</span>
        </h2>
        <p>
          PolicyDrift is an editorial curation and news intelligence platform. We aggregate headlines, briefs, and official announcements from verified open syndication feeds and wire sources.
        </p>
        <ul className="space-y-2 list-disc pl-5 text-slate-300">
          <li>
            Article previews and excerpt texts are sanitized and presented with attribution to the originating publisher.
          </li>
          <li>
            We provide direct links to the source of record and encourage readers to view full reports on the original publisher&apos;s site.
          </li>
          <li>
            While we take rigorous steps to ensure timely and factual data, PolicyDrift makes no warranties regarding the absolute completeness, accuracy, or uninterrupted availability of third-party feeds.
          </li>
        </ul>
      </section>

      {/* Section 3: Professional Advice Disclaimers */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <span>3. Financial, Legal & Regulatory Disclaimers</span>
        </h2>
        <div className="rounded-xl border border-amber-500/20 bg-amber-950/30 p-4 text-xs text-amber-200/90 leading-relaxed space-y-2">
          <p className="font-bold text-amber-300 text-sm">IMPORTANT NOTICE:</p>
          <p>
            Content published on PolicyDrift—including economic key takeaways, market indices, regulatory summaries, and legal briefs—is provided exclusively for informational and educational purposes.
          </p>
          <p>
            Nothing on this website constitutes financial investment advice, legal counsel, or tax guidance. Always consult licensed financial advisors, legal attorneys, or official government gazettes before making commercial or legal decisions.
          </p>
        </div>
      </section>

      {/* Section 4: Intellectual Property */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Copyright className="h-5 w-5 text-purple-400 shrink-0" />
          <span>4. Intellectual Property Rights</span>
        </h2>
        <p>
          Original journalistic reporting, photography, and trademarks belong to their respective publishers and wire services. PolicyDrift claims no proprietary interest in third-party content.
        </p>
        <p>
          The PolicyDrift name, logo, site design, frontend software, editorial framing algorithms, and custom data visualizations are the intellectual property of PolicyDrift and are protected by applicable copyright and intellectual property laws.
        </p>
      </section>

      {/* Section 5: Acceptable Use */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Ban className="h-5 w-5 text-rose-400 shrink-0" />
          <span>5. Acceptable Use & Conduct</span>
        </h2>
        <p>You agree not to:</p>
        <ul className="space-y-2 list-disc pl-5 text-slate-300">
          <li>
            Deploy automated scrapers, bots, or crawlers that exceed reasonable request thresholds or ignore <code>robots.txt</code> rules.
          </li>
          <li>
            Attempt to probe, scan, or compromise the vulnerability of our servers, reverse proxies, or APIs.
          </li>
          <li>
            Misrepresent or republish PolicyDrift summaries in a misleading manner that strips source attribution.
          </li>
        </ul>
      </section>

      {/* Section 6: Limitation of Liability */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>6. Limitation of Liability & Governing Law</span>
        </h2>
        <p>
          To the maximum extent permitted by law, PolicyDrift and its operators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this platform or reliance on its syndicated reports.
        </p>
        <p>
          These Terms of Use shall be governed by and construed in accordance with applicable laws. Any legal disputes shall be subject to the exclusive jurisdiction of the competent courts.
        </p>
      </section>
    </LegalPageShell>
  );
}
