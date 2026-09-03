import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBackendBase(): string {
  if (process.env.API_INTERNAL_URL) {
    return process.env.API_INTERNAL_URL.replace(/\/$/, '');
  }
  const port = process.env.PORT || '4001';
  return `http://127.0.0.1:${port}`;
}

async function handleProxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const search = req.nextUrl.search;
  const backendBase = getBackendBase();
  const url = `${backendBase}/api/newsletter/${path}${search}`;

  const headers: HeadersInit = {};
  req.headers.forEach((val, key) => {
    if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
      headers[key] = val;
    }
  });

  try {
    let body: BodyInit | undefined = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      body = await req.text();
      headers['content-type'] = headers['content-type'] || 'application/json';
    }

    const res = await fetch(url, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        'content-type': res.headers.get('content-type') || 'application/json',
      },
    });
  } catch (err: any) {
    console.error(`[Newsletter Proxy Error] ${url}:`, err);
    return NextResponse.json({ ok: false, error: 'Newsletter service unavailable' }, { status: 502 });
  }
}

export { handleProxy as GET, handleProxy as POST, handleProxy as DELETE, handleProxy as PUT };
