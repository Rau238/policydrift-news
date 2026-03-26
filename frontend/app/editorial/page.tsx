import { LegalPageShell, legalMetadata } from '@/components/LegalPageShell';

export const metadata = legalMetadata(
  'Editorial standards',
  'How PolicyDrift selects and presents stories.',
);

export default function EditorialPage() {
  return (
    <LegalPageShell
      title="Editorial standards"
      description="How we choose feeds, attribute sources, and present the newsroom. Last updated March 2026."
    >
      <p>
        PolicyDrift pulls from configured RSS feeds and similar open syndication. Our goal is a fast, readable
        overview of major desks — breaking, world, business, and more — with clear links back to publishers.
      </p>

      <h2>Sources</h2>
      <p>
        Each story credits its origin and links to the original article where available. We do not claim ownership of
        wire or publisher content.
      </p>

      <h2>Summaries and formatting</h2>
      <p>
        Headlines and body text may be shortened or lightly edited for clarity and SEO. Automated or human review
        should avoid introducing factual claims that are not supported by the source.
      </p>

      <h2>Corrections</h2>
      <p>
        If you believe something is wrong or misleading, contact the site operator. Serious errors should be corrected
        or clarified at the article level when feasible.
      </p>

      <h2>Independence</h2>
      <p>
        Desk labels (Breaking, World News, India, etc.) reflect editorial grouping of feeds, not endorsement of any
        viewpoint. Replace this section if your organization has specific editorial guidelines.
      </p>
    </LegalPageShell>
  );
}
