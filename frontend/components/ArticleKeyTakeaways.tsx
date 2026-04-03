import { decodeHtmlEntities } from '@/lib/sanitize';

type Props = {
  /** Newline-separated lines from the desk (Banking & Economics ingest). */
  raw: string;
};

export function ArticleKeyTakeaways({ raw }: Props) {
  const lines = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return null;

  return (
    <section
      className="mt-6 rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-50/90 to-slate-50/80 px-4 py-4 shadow-sm ring-1 ring-teal-900/5"
      aria-labelledby="key-takeaways-heading"
    >
      <h2 id="key-takeaways-heading" className="font-display text-lg font-bold tracking-tight text-slate-900">
        Key takeaways
      </h2>
      <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-600">
        Short desk summary — not a substitute for the publisher&apos;s full reporting below.
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-slate-800">
        {lines.map((line, i) => (
          <li key={i}>{decodeHtmlEntities(line)}</li>
        ))}
      </ul>
    </section>
  );
}
