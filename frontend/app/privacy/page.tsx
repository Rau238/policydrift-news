import Link from 'next/link';
import { LegalPageShell, legalMetadata } from '@/components/LegalPageShell';
import { privacyEmail } from '@/lib/site-trust';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  UserCheck,
  Cookie,
  Mail,
  FileCheck2,
} from 'lucide-react';

export const metadata = legalMetadata(
  'Privacy Policy & Data Protection',
  'NewsFree365 is built privacy-first. Learn how we handle server telemetry, cookies, and protect user data.',
);

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      subtitle="Transparency on how NewsFree365 handles technical data, respects your privacy, and safeguards your digital rights."
      badge="Privacy & Security"
      lastUpdated="August 2026"
      activePath="/privacy"
    >
      {/* Section 1: Introduction */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>1. Commitment to Reader Privacy</span>
        </h2>
        <p>
          At NewsFree365 (<code>https://www.newsfree365.live</code>), we believe reading the news should never come at the cost of your personal privacy.
          Our architecture is built privacy-first: <strong>we do not sell user data, we do not deploy invasive cross-site tracking beacons, and we do not require account registration to read our stories.</strong>
        </p>
        <p>
          This Privacy Policy explains what limited technical information is processed when you visit our website, how it is secured, and your rights under global privacy frameworks including GDPR (EU), CCPA (California), and the Digital Personal Data Protection (DPDP) Act (India).
        </p>
      </section>

      {/* Section 2: Data We Collect */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Server className="h-5 w-5 text-cyan-400 shrink-0" />
          <span>2. Information We Process</span>
        </h2>
        <p>
          We strictly limit data collection to what is necessary for delivering secure, reliable, and performant news services:
        </p>
        <div className="space-y-3 pt-1">
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4 space-y-1.5">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>Standard Server & Edge Logs</span>
            </span>
            <p className="text-xs text-slate-400">
              When you load a page or stream scores, edge infrastructure and reverse proxies (e.g., NGINX, Cloudflare) record standard technical metadata: IP address (anonymized/truncated for analytics), user-agent string, requested URI, referrer, and request timestamp. These logs are used exclusively for DDoS prevention, rate limiting, and system diagnosis.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4 space-y-1.5">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-purple-400" />
              <span>No Forced User Accounts</span>
            </span>
            <p className="text-xs text-slate-400">
              General readership on NewsFree365 does not require creating an account, supplying email addresses, or sharing phone numbers. Administrative portals are restricted to authorized editorial staff.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4 space-y-1.5">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <Cookie className="h-4 w-4 text-amber-400" />
              <span>Client-Side Local Storage & Preferences</span>
            </span>
            <p className="text-xs text-slate-400">
              We store lightweight user preferences directly in your browser&apos;s LocalStorage (such as theme preferences and reading modes). This data never leaves your device.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Cookies & Analytics */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Cookie className="h-5 w-5 text-amber-400 shrink-0" />
          <span>3. Cookies & Tracking Technologies</span>
        </h2>
        <p>
          NewsFree365 uses essential, non-invasive cookies for load balancing, security session integrity, and edge caching. For comprehensive details on cookie categorization and how to manage browser storage settings, review our dedicated{' '}
          <Link href="/cookies" className="font-semibold text-emerald-400 hover:underline">
            Cookie Policy
          </Link>
          .
        </p>
      </section>

      {/* Section 4: Third-Party Links */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <FileCheck2 className="h-5 w-5 text-sky-400 shrink-0" />
          <span>4. Outbound Links & External Publishers</span>
        </h2>
        <p>
          NewsFree365 provides direct canonical links to original news publishers and official sources. Once you click an outbound link to an external website, their respective privacy policies and terms apply. We encourage you to review the privacy statements of any external properties you visit.
        </p>
      </section>

      {/* Section 5: Data Retention & Security */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Lock className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>5. Data Retention & Security Measures</span>
        </h2>
        <p>
          All data in transit is encrypted using modern TLS (HTTPS) with HSTS headers enabled. Diagnostic server logs are automatically rotated and purged on a 30-day rolling cycle. No persistent profiling databases are maintained on public readers.
        </p>
      </section>

      {/* Section 6: Your Legal Rights & Inquiries */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <UserCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>6. Your Rights & Privacy Inquiries</span>
        </h2>
        <p>
          Under applicable data protection laws, you retain rights to request information regarding any data processed, request deletion, or lodge inquiries regarding our privacy practices.
        </p>
        <p>
          For privacy inquiries or compliance requests, contact our Data Protection Desk at{' '}
          <a href={`mailto:${privacyEmail()}`} className="font-semibold text-emerald-400 hover:underline">
            {privacyEmail()}
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
