/** Matches PolicyDrift hero (teal / slate). Use in route `loading.tsx` shells. */
export function BrandLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-5" role="status" aria-live="polite">
      <div className="relative h-[4.25rem] w-[4.25rem]">
        <span
          className="absolute inset-0 animate-pulse rounded-full bg-teal-400/25 blur-xl"
          aria-hidden
        />
        <span
          className="absolute inset-0 rounded-full border-2 border-slate-500/50"
          aria-hidden
        />
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-400 border-l-teal-500/70 pd-loader-spin"
          aria-hidden
        />
        <span
          className="absolute inset-[10px] rounded-full border border-white/10"
          aria-hidden
        />
      </div>
      <p className="max-w-xs text-center text-sm font-medium tracking-wide text-slate-300">{label}</p>
    </div>
  );
}
