import { LegalPageShell, legalMetadata } from '@/components/LegalPageShell';

export const metadata = legalMetadata(
  'Terms of use',
  'Rules for using the PolicyDrift website and content.',
);

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of use"
      description="By using PolicyDrift you agree to these terms. Last updated March 2026."
    >
      <p>
        These terms govern use of the PolicyDrift website. If you do not agree, please do not use the site.
      </p>

      <h2>What PolicyDrift provides</h2>
      <p>
        We present news-style content aggregated from public RSS feeds and similar sources, sometimes summarized or
        reformatted for readability. We aim for accuracy but do not guarantee completeness or timeliness.
      </p>

      <h2>Not professional advice</h2>
      <p>
        Nothing on this site is financial, legal, medical, or other professional advice. Always verify important
        information with primary sources and qualified professionals.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Original articles belong to their publishers. PolicyDrift’s layout, branding, and original text we add are
        ours unless stated otherwise. Do not scrape or redistribute the site in a way that violates publishers’ terms
        or applicable law.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>No unlawful, harassing, or harmful use of the site or related systems.</li>
        <li>No attempt to disrupt service, probe security, or overload infrastructure.</li>
        <li>No automated access that violates robots.txt or fair use of the service.</li>
      </ul>

      <h2>Disclaimer</h2>
      <p>
        The site is provided “as is.” To the fullest extent permitted by law, we disclaim warranties and limit
        liability arising from use of the site or reliance on its content.
      </p>

      <h2>Changes</h2>
      <p>We may change these terms; continued use after updates means you accept the new terms.</p>
    </LegalPageShell>
  );
}
