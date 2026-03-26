import { siteGraphJsonLd } from '@/lib/jsonld';

/** Sitewide Organization + WebSite for E-E-A-T and discovery signals. */
export function SiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraphJsonLd()) }}
    />
  );
}
