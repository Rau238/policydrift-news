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
  const port = (process.env.API_PORT || '4001').trim();
  out.push(`http://127.0.0.1:${port}`);
  out.push('http://127.0.0.1:4001');
  out.push('http://127.0.0.1:4050');
  out.push('http://localhost:4001');
  out.push('http://localhost:4050');
  const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (pub) {
    const b = trimBase(pub);
    if (!out.includes(b)) out.push(b);
  }
  return Array.from(new Set(out));
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path?: string[] }> | { path?: string[] } }
) {
  const resolvedParams = await Promise.resolve(context.params);
  const subPath = (resolvedParams.path || []).join('/');
  const candidates = backendCandidates();

  for (const base of candidates) {
    const url = `${base}/api/football/${subPath}`;
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Accept': 'text/event-stream, application/json, */*',
        },
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';

        // Handle Server-Sent Events (SSE) stream piping
        if (contentType.includes('text/event-stream')) {
          const { readable, writable } = new TransformStream();
          res.body?.pipeTo(writable).catch(() => { });

          return new Response(readable, {
            status: 200,
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache, no-transform',
              'Connection': 'keep-alive',
              'X-Accel-Buffering': 'no',
            },
          });
        }

        const data = await res.json();
        return NextResponse.json(data, {
          status: 200,
          headers: {
            'Cache-Control': res.headers.get('cache-control') || 'public, max-age=5, stale-while-revalidate=10',
          },
        });
      }
    } catch {
      // Try next backend candidate
    }
  }

  return NextResponse.json(
    { ok: false, error: 'Football service unavailable' },
    { status: 503 }
  );
}
