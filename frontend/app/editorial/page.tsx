import Link from 'next/link';
import { LegalPageShell, legalMetadata } from '@/components/LegalPageShell';

export const metadata = legalMetadata(
  'Editorial standards',
  'How PolicyDrift selects and presents stories.',
);

export default function EditorialPage() {
  return (
    <LegalPageShell
      title="Editorial standards"
      description="How we choose feeds, attribute sources, and present the newsroom. Last updated April 2026."
    >
      <p>
        PolicyDrift pulls from configured RSS feeds and similar open syndication. We <strong>curate and summarize</strong>:
        we group stories by desk, tighten listings, and add short framing where it helps readers (for example,{' '}
        <strong>Key takeaways</strong> on Banking & Economics). We are not the publisher of wire or third-party
        articles; the original URL remains the source of record. See also{' '}
        <Link href="/about" className="font-semibold text-accent hover:text-accent-dark">
          About PolicyDrift
        </Link>
        .
      </p>

      <h2>Sources</h2>
      <p>
        Each story credits its origin and links to the original article where available. We do not claim ownership of
        wire or publisher content.
      </p>

      <h2>Feed text and formatting</h2>
      <p>
        Article bodies are the HTML or text provided in each RSS item (deduplicated when feeds repeat the same story
        in multiple fields). We sanitize markup for safe display. Headlines and lead blurbs may be trimmed for listings;
        we do not rewrite full articles into a separate editorial template.
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
