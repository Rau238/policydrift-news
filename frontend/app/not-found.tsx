import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-ink">Page not found</h1>
      <p className="mt-3 text-slate-600">That story may have moved or the link is incorrect.</p>
      <Link href="/" className="mt-8 inline-block font-semibold text-accent hover:text-accent-dark">
        Return to home
      </Link>
    </div>
  );
}
