import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getBackendBase() {
  return (
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    `http://127.0.0.1:${process.env.API_PORT || '4001'}`
  ).replace(/\/$/, '');
}

async function handleAdminProxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const secret = process.env.ADMIN_SECRET?.trim() || process.env.INSIGHTS_ADMIN_SECRET?.trim() || 'policydrift_news_admin';

  // Check auth: cookie pd_admin OR x-admin-secret header OR Authorization Bearer
  const cookieStore = cookies();
  const cookieVal = cookieStore.get('pd_admin')?.value?.trim();
  const headerSecret = req.headers.get('x-admin-secret')?.trim();
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  const isAuthed =
    (cookieVal && cookieVal === secret) ||
    (headerSecret && headerSecret === secret) ||
    (authHeader && authHeader === secret);

  if (!isAuthed) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized. Please log in at /admin/login or provide x-admin-secret header.' },
      { status: 401 }
    );
  }

  const subPath = (params.path ?? []).join('/');
  const backendPath = `/api/admin/${subPath}`;
  const search = req.nextUrl.search;
  const targetUrl = `${getBackendBase()}${backendPath}${search}`;

  const forwardHeaders = new Headers();
  forwardHeaders.set('x-admin-secret', secret);
  forwardHeaders.set('Content-Type', req.headers.get('content-type') || 'application/json');

  let body: BodyInit | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text();
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      cache: 'no-store',
    });

    const responseText = await upstream.text();
    return new NextResponse(responseText, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
      },
    });
  } catch (err) {
    console.error(`[admin-api-proxy] Failed to connect to backend at ${targetUrl}:`, err);
    return NextResponse.json(
      {
        ok: false,
        error: `Backend unreachable at ${getBackendBase()}. Make sure backend server is running on port ${process.env.API_PORT || '4001'}.`,
      },
      { status: 502 }
    );
  }
}

export {
  handleAdminProxy as GET,
  handleAdminProxy as POST,
  handleAdminProxy as PUT,
  handleAdminProxy as DELETE,
  handleAdminProxy as PATCH,
};
