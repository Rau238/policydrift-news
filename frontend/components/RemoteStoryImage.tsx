/**
 * Plain <img> for third-party RSS URLs — avoids Next/Image edge cases and sets referrer policy
 * so more CDNs (BBC, Guardian, etc.) allow hotlinking.
 */
type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function RemoteStoryImage({ src, alt, className, priority }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- intentional for external news CDNs
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}
