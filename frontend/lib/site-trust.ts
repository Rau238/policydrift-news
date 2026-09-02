/**
 * E-E-A-T / Trust and Administrative Signals.
 * Dynamically configurable via NEXT_PUBLIC_* admin environment settings.
 */

export function curatorName(): string {
  return process.env.NEXT_PUBLIC_CURATOR_NAME?.trim() || 'NewsFree365 Editorial Desk';
}

export function curatorRole(): string {
  return process.env.NEXT_PUBLIC_CURATOR_ROLE?.trim() || 'Chief News Curator';
}

export function curatorBioShort(): string {
  return (
    process.env.NEXT_PUBLIC_CURATOR_BIO?.trim() ||
    'Stories are synthesized from verified global RSS and press agency sources with structured attribution and macroeconomic takeaways.'
  );
}

export function curatorProfileUrl(): string | undefined {
  const u = process.env.NEXT_PUBLIC_CURATOR_URL?.trim();
  return u || undefined;
}

export function curatorImageSrc(): string | null {
  const u = process.env.NEXT_PUBLIC_CURATOR_IMAGE_URL?.trim();
  return u || null;
}

/** General Contact Email from Admin config / environment */
export function contactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'contact@newsfree365.live';
}

/** Dedicated Editorial & Corrections Desk Email */
export function editorialEmail(): string {
  return process.env.NEXT_PUBLIC_EDITORIAL_EMAIL?.trim() || process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'editorial@newsfree365.live';
}

/** Dedicated Data Protection & Privacy Compliance Email */
export function privacyEmail(): string {
  return process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim() || process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'privacy@newsfree365.live';
}

/** Mailing & Operational Newsroom Address Lines */
export function contactAddressLines(): string[] {
  const raw = process.env.NEXT_PUBLIC_CONTACT_ADDRESS?.trim();
  if (raw) {
    return raw.split(/\n/).map((l) => l.trim()).filter(Boolean);
  }
  return [
    'NewsFree365 News Desk & Media Operations',
    'DLF Cyber City, Tower B, 10th Floor',
    'Gurugram, Haryana 122002, India',
  ];
}
