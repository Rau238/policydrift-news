import { LegalPageShell, legalMetadata } from '@/components/LegalPageShell';

export const metadata = legalMetadata(
  'Cookie policy',
  'How PolicyDrift uses cookies and similar technologies.',
);

export default function CookiesPage() {
  return (
    <LegalPageShell
      title="Cookie policy"
      description="Transparency about cookies on PolicyDrift. Last updated March 2026."
    >
      <p>
        This page explains how cookies and similar storage may be used when you visit PolicyDrift. Adjust it to match
        what you actually deploy (analytics, ads, auth, etc.).
      </p>

      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device. They help sites remember preferences, keep you signed in,
        or measure traffic.
      </p>

      <h2>How we use them</h2>
      <ul>
        <li>
          <strong>Essential.</strong> Required for core functionality (for example security, load balancing, or session
          state if you add accounts).
        </li>
        <li>
          <strong>Preferences.</strong> Remember choices such as theme or region if you implement them.
        </li>
        <li>
          <strong>Analytics / marketing (optional).</strong> If you add Google Analytics, Meta Pixel, or similar,
          list each tool, purpose, and retention here, and obtain consent where required.
        </li>
      </ul>

      <h2>Your choices</h2>
      <p>
        You can block or delete cookies through your browser settings. Blocking essential cookies may break parts of
        the site.
      </p>

      <h2>Updates</h2>
      <p>We will update this policy when our use of cookies changes.</p>
    </LegalPageShell>
  );
}
