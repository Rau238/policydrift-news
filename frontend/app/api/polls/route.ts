import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function trimBase(url: string): string {
  return url.trim().replace(/\/$/, '');
}

function backendCandidates(): string[] {
  const out: string[] = [];
  const internal = process.env.API_INTERNAL_URL?.trim();
  if (internal) out.push(trimBase(internal));
  const port = (process.env.API_PORT || '4050').trim();
  out.push(`http://127.0.0.1:${port}`);
  out.push('http://127.0.0.1:4050');
  out.push('http://127.0.0.1:4001');
  out.push('http://localhost:4050');
  out.push('http://localhost:4001');
  const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (pub) {
    const b = trimBase(pub);
    if (!out.includes(b)) out.push(b);
  }
  return Array.from(new Set(out));
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  const candidates = backendCandidates();

  let lastStatus = 502;
  let lastData: any = null;

  for (const base of candidates) {
    const url = `${base}/api/polls/active${search}`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'x-forwarded-for': req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '',
          'user-agent': req.headers.get('user-agent') || '',
        },
      });

      lastStatus = res.status;
      const data = await res.json().catch(() => null);
      if (data) lastData = data;

      if (res.ok) {
        return NextResponse.json(data, {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
          },
        });
      }
    } catch {
      // try next candidate
    }
  }

  return NextResponse.json(
    lastData || { success: false, error: 'Polls backend service unavailable' },
    { status: lastStatus }
  );
}
