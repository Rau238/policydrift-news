import Link from 'next/link';
import { LegalPageShell, legalMetadata } from '@/components/LegalPageShell';
import { Mail, MapPin, Building2, HelpCircle, PhoneCall, ShieldCheck } from 'lucide-react';
import { contactAddressLines, contactEmail, editorialEmail, privacyEmail } from '@/lib/site-trust';

export const metadata = legalMetadata(
  'Contact PolicyDrift News Desk',
  'Reach PolicyDrift for editorial corrections, publisher syndication, legal notices, and newsroom inquiries.',
);

export default function ContactPage() {
  const mainEmail = contactEmail();
  const edEmail = editorialEmail();
  const privEmail = privacyEmail();
  const addressLines = contactAddressLines();

  return (
    <LegalPageShell
      title="Contact Newsroom"
      subtitle="Reach the PolicyDrift desk for corrections, publisher partnerships, privacy requests, and operational inquiries."
      badge="Newsroom Desk"
      lastUpdated="August 2026"
      activePath="/contact"
    >
      {/* Section 1: Inquiries Overview */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Building2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>Newsroom & Media Contacts</span>
        </h2>
        <p>
          We welcome inquiries from readers, journalists, publishers, and research organizations.
          Please route your inquiry to the appropriate desk below for the fastest response.
        </p>
      </section>

      {/* Section 2: Dedicated Email Channels */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Mail className="h-5 w-5 text-cyan-400 shrink-0" />
          <span>Direct Desks & Email Channels</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Editorial & Corrections */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4 space-y-1.5">
            <span className="font-bold text-white text-sm block">📰 Editorial & Corrections Desk</span>
            <p className="text-xs text-slate-400">
              For reporting factual errors, wire attribution updates, or syndication concerns:
            </p>
            <a
              href={`mailto:${edEmail}`}
              className="text-xs font-semibold text-emerald-400 hover:underline block pt-1"
            >
              {edEmail}
            </a>
          </div>

          {/* Privacy & Compliance */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4 space-y-1.5">
            <span className="font-bold text-white text-sm block">🔒 Privacy & Compliance Desk</span>
            <p className="text-xs text-slate-400">
              For data protection, GDPR/DPDP inquiries, or cookie compliance requests:
            </p>
            <a
              href={`mailto:${privEmail}`}
              className="text-xs font-semibold text-emerald-400 hover:underline block pt-1"
            >
              {privEmail}
            </a>
          </div>

          {/* General Inquiries */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4 space-y-1.5 sm:col-span-2">
            <span className="font-bold text-white text-sm block">🌐 General & Operational Mail</span>
            <p className="text-xs text-slate-400">
              For general site inquiries, media queries, and institutional partnerships:
            </p>
            <a
              href={`mailto:${mainEmail}`}
              className="text-xs font-semibold text-emerald-400 hover:underline block pt-1"
            >
              {mainEmail}
            </a>
          </div>
        </div>
      </section>

      {/* Section 3: Physical Address */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <MapPin className="h-5 w-5 text-amber-400 shrink-0" />
          <span>Operational Newsroom Address</span>
        </h2>

        <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4 space-y-2">
          <address className="not-italic text-xs text-slate-300 space-y-1 font-sans">
            {addressLines.map((line, i) => (
              <span key={i} className="block text-slate-200 font-medium">
                {line}
              </span>
            ))}
          </address>
        </div>
      </section>
    </LegalPageShell>
  );
}
