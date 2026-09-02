import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function trimBase(url: string): string {
  return url.trim().replace(/\/$/, '');
}

/** Try in order: explicit internal URL, local API port, public API URL (tunnel / remote). */
function backendCandidates(): string[] {
  const out: string[] = [];
  const internal = process.env.API_INTERNAL_URL?.trim();
  if (internal) out.push(trimBase(internal));
  const port = (process.env.API_PORT || '4050').trim();
  out.push(`http://127.0.0.1:${port}`);
  const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (pub) {
    const b = trimBase(pub);
    if (!out.includes(b)) out.push(b);
  }
  return out;
}

export async function GET() {
  const candidates = backendCandidates();
  let lastStatus = 502;
  let lastBody: string | undefined;
  let lastErr: string | undefined;

  for (const base of candidates) {
    const url = `${base}/api/market-quotes`;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const text = await res.text();
      if (!res.ok) {
        lastStatus = res.status >= 400 && res.status < 600 ? res.status : 502;
        lastBody = text.slice(0, 200);
        continue;
      }
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        lastErr = 'Invalid JSON from API';
        continue;
      }
      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    } catch (e) {
      lastErr = e instanceof Error ? e.message : 'fetch failed';
    }
  }

  return NextResponse.json(
    {
      error: 'Could not reach NewsFree365 API',
      tried: candidates,
      lastError: lastErr,
      lastUpstream: lastBody,
    },
    { status: lastStatus },
  );
}
