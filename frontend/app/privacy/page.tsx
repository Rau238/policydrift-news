import Link from 'next/link';
import { LegalPageShell, legalMetadata } from '@/components/LegalPageShell';

export const metadata = legalMetadata(
  'Privacy policy',
  'How PolicyDrift handles information when you use this site.',
);

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy policy"
      description="How we treat information when you read PolicyDrift. Last updated March 2026."
    >
      <p>
        PolicyDrift is a news aggregation and reading experience. This policy describes what data may be involved
        when you use the public website.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Server logs.</strong> Like most sites, hosting infrastructure may log requests (for example IP
          address, user agent, time, and URL). We use this only to operate and secure the service.
        </li>
        <li>
          <strong>Analytics (if enabled).</strong> If you later add analytics, disclose the provider and what they
          collect here.
        </li>
        <li>
          <strong>No accounts on this build.</strong> This template does not require sign-in for reading articles.
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        See our <Link href="/cookies">Cookie policy</Link> for details. Essential cookies may be used for basic site
        function; optional cookies should only run after consent if you add a banner.
      </p>

      <h2>Third-party content</h2>
      <p>
        Articles may link to original publishers. Those sites have their own privacy practices. We do not control how
        they handle data when you leave PolicyDrift.
      </p>

      <h2>Retention</h2>
      <p>
        Log retention depends on your hosting provider and configuration. Align this section with your actual
        infrastructure.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, or delete personal data. Contact details
        should be added here when you operate a production site.
      </p>

      <h2>Changes</h2>
      <p>We may update this page; the date at the top will change when we do.</p>
    </LegalPageShell>
  );
}
