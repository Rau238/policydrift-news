/**
 * E-E-A-T / trust signals — override with NEXT_PUBLIC_* env on deploy.
 * Curator appears on article pages; contact on /contact.
 */

export function curatorName(): string {
  return process.env.NEXT_PUBLIC_CURATOR_NAME?.trim() || 'PolicyDrift Editorial';
}

export function curatorRole(): string {
  return process.env.NEXT_PUBLIC_CURATOR_ROLE?.trim() || 'News desk';
}

export function curatorBioShort(): string {
  return (
    process.env.NEXT_PUBLIC_CURATOR_BIO?.trim() ||
    'Stories are curated from top RSS sources; we summarize and attribute — open the publisher link for the full article.'
  );
}

export function curatorProfileUrl(): string | undefined {
  const u = process.env.NEXT_PUBLIC_CURATOR_URL?.trim();
  return u || undefined;
}

/** Absolute or site-relative image URL (e.g. https://…/photo.jpg or /team/curator.jpg). */
export function curatorImageSrc(): string | null {
  const u = process.env.NEXT_PUBLIC_CURATOR_IMAGE_URL?.trim();
  return u || null;
}

export function contactEmail(): string | null {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;
}

export function contactAddressLines(): string[] {
  const raw = process.env.NEXT_PUBLIC_CONTACT_ADDRESS?.trim();
  if (!raw) return [];
  return raw.split(/\n/).map((l) => l.trim()).filter(Boolean);
}
