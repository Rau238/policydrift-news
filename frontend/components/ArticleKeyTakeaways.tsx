import { decodeHtmlEntities } from '@/lib/sanitize';
import { ListChecks } from 'lucide-react';

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
      id="article-takeaways"
      data-ai-summary="true"
      className="mt-4 rounded-lg border border-teal-100 bg-teal-50/50 px-3.5 py-3 sm:px-4"
      aria-labelledby="key-takeaways-heading"
    >
      <div className="flex items-center gap-2">
        <ListChecks className="h-4 w-4 shrink-0 text-teal-700" strokeWidth={2.25} aria-hidden />
        <h2 id="key-takeaways-heading" className="text-sm font-bold tracking-tight text-slate-900">
          Key takeaways
        </h2>
      </div>
      <ol className="mt-2.5 m-0 list-none space-y-2 p-0">
        {lines.map((line, i) => (
          <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-700 sm:text-[14px]">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-teal-600/10 text-[10px] font-bold tabular-nums text-teal-800">
              {i + 1}
            </span>
            <span className="min-w-0">{decodeHtmlEntities(line)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
