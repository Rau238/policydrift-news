import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function trimBase(url: string): string {
  return url.trim().replace(/\/$/, '');
}

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryString = searchParams.toString();
  const query = queryString ? `?${queryString}` : '';

  const candidates = backendCandidates();
  let lastStatus = 502;
  let lastErr: string | undefined;

  for (const base of candidates) {
    const url = `${base}/api/quiz/today${query}`;
    try {
      const res = await fetch(url, {
        cache: 'no-store',
      });
      if (!res.ok) {
        lastStatus = res.status;
        continue;
      }
      const data = await res.json();
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      });
    } catch (e) {
      lastErr = e instanceof Error ? e.message : 'fetch failed';
    }
  }

  return NextResponse.json(
    {
      ok: false,
      error: 'Could not reach NewsFree365 API quiz service',
      lastStatus,
      lastError: lastErr,
      questions: [],
      total: 0,
    },
    { status: lastStatus }
  );
}
