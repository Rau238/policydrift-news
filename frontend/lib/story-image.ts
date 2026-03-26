import { absoluteUrl } from '@/lib/site';

/** Default OG/card image when a story has no remote image (matches backend fallback path). */
export function storyFallbackImageUrl(): string {
  return absoluteUrl('/images/story-fallback.svg');
}

export function resolvePostImageUrl(stored: string | null | undefined): string {
  const u = stored?.trim();
  if (u) return u;
  return storyFallbackImageUrl();
}
