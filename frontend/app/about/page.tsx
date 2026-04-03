import Link from 'next/link';
import { LegalPageShell, legalMetadata } from '@/components/LegalPageShell';

export const metadata = legalMetadata(
  'About PolicyDrift',
  'Who we are, how we curate syndicated news, and how we add reader value.',
);

export default function AboutPage() {
  return (
    <LegalPageShell
      title="About PolicyDrift"
      description="We are a curated news desk — not a wire service. We summarize and attribute; publishers own the original reporting."
    >
      <p>
        PolicyDrift brings together headlines and articles from trusted RSS and open syndication feeds across breaking
        news, world, India, business, banking, markets, and more. Our role is to help you scan what matters with clear
        labels, stable URLs, and honest sourcing — not to replace the reporters and editors who produce the underlying
        stories.
      </p>

      <h2>Original value on a syndicated model</h2>
      <p>
        Pure aggregation without context is a weak experience for readers and a weak signal for search quality. We add
        value through desk organization, concise summaries where feeds allow, explicit links to originals, and — on our
        Banking & Economics desk — short &quot;Key takeaways&quot; lines that frame why a headline matters for rates,
        inflation, and financial stability. Those notes are written by our editorial workflow, not copied from wire
        ledes alone.
      </p>

      <h2>Editorial policy</h2>
      <p>
        We state how feeds are chosen, how attribution works, and how to request corrections in our{' '}
        <Link href="/editorial" className="font-semibold text-accent hover:text-accent-dark">
          Editorial standards
        </Link>{' '}
        page. If you represent a publisher and have concerns about how your content appears, please reach us via the{' '}
        <Link href="/contact" className="font-semibold text-accent hover:text-accent-dark">
          Contact
        </Link>{' '}
        page.
      </p>

      <h2>Transparency</h2>
      <p>
        Article pages name the curator or desk responsible for presentation, link to the publisher URL, and describe
        when body text comes from the feed. We encourage you to always open the original for updates, charts, and
        full quotes.
      </p>
    </LegalPageShell>
  );
}
