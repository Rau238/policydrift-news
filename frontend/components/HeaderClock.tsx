'use client';

import { useEffect, useState } from 'react';

const DATE_LOCALE = 'en-US';

function formatLine(d: Date) {
  const date = d.toLocaleDateString(DATE_LOCALE, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString(DATE_LOCALE, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return { line: `${date} · ${time}`, iso: d.toISOString() };
}

/** Live local date + time on one line for the header. */
export function HeaderClock() {
  const [parts, setParts] = useState<{ line: string; iso: string } | null>(null);

  useEffect(() => {
    const tick = () => setParts(formatLine(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!parts) {
    return <div className="hidden h-5 min-w-[10rem] sm:block" aria-hidden />;
  }

  return (
    <time
      className="hidden min-w-0 shrink text-right text-[11px] font-medium tabular-nums leading-none text-teal-50/95 sm:block md:text-xs"
      dateTime={parts.iso}
    >
      {parts.line}
    </time>
  );
}
