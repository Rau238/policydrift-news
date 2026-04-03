import { LegalPageShell, legalMetadata } from '@/components/LegalPageShell';
import { Mail, MapPin } from 'lucide-react';
import { contactAddressLines, contactEmail } from '@/lib/site-trust';

export const metadata = legalMetadata(
  'Contact PolicyDrift',
  'Reach the PolicyDrift desk for corrections, partnerships, and publisher inquiries.',
);

export default function ContactPage() {
  const email = contactEmail();
  const addressLines = contactAddressLines();

  return (
    <LegalPageShell
      title="Contact"
      description="Corrections, syndication questions, and operational mail for the PolicyDrift news desk."
    >
      <p>
        Use the details below for editorial corrections, feed or attribution issues, and good-faith partnership
        inquiries. We are not a law firm; legal notices should follow the process described in our{' '}
        <a href="/terms" className="font-semibold text-accent hover:text-accent-dark">
          Terms of use
        </a>
        .
      </p>

      <h2>Email</h2>
      {email ? (
        <p className="flex flex-wrap items-center gap-2">
          <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          <a href={`mailto:${email}`} className="font-semibold text-accent hover:text-accent-dark">
            {email}
          </a>
        </p>
      ) : (
        <p className="rounded-lg border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          Set <code className="rounded bg-amber-100/80 px-1 py-0.5 text-[13px]">NEXT_PUBLIC_CONTACT_EMAIL</code> in your
          deployment environment so a reachable address appears here — a visible contact is a strong trust signal for
          news sites.
        </p>
      )}

      <h2>Mailing address</h2>
      {addressLines.length > 0 ? (
        <address className="not-italic">
          <p className="flex gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span className="text-slate-800">
              {addressLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </span>
          </p>
        </address>
      ) : (
        <p className="rounded-lg border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          Set{' '}
          <code className="rounded bg-amber-100/80 px-1 py-0.5 text-[13px]">NEXT_PUBLIC_CONTACT_ADDRESS</code> with line
          breaks in the value (one address line per line) to show your registered or operational address. Google&apos;s
          quality raters look for real-world contact signals on YMYL and news properties.
        </p>
      )}
    </LegalPageShell>
  );
}
