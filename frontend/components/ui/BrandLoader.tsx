/** Calm loader for route shells: slow spin, no pulsing glow (reduces visual flicker). */
export function BrandLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
      <div className="relative h-11 w-11">
        <span className="absolute inset-0 rounded-full border-2 border-slate-500/45" aria-hidden />
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-400/90 border-l-teal-600/50 pd-loader-spin"
          aria-hidden
        />
        <span className="absolute inset-[7px] rounded-full border border-white/10" aria-hidden />
      </div>
      <p className="max-w-xs text-center text-[13px] font-medium tracking-wide text-slate-300">{label}</p>
    </div>
  );
}
