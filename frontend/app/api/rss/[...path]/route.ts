import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSessionToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getBackendBase() {
  return (
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    `http://127.0.0.1:${process.env.API_PORT || '4050'}`
  ).replace(/\/$/, '');
}

async function handleRssProxy(req: NextRequest, { params }: { params: { path?: string[] } }) {
  const secret = process.env.ADMIN_SECRET?.trim() || process.env.INSIGHTS_ADMIN_SECRET?.trim() || 'Raunak@123';

  // Check auth for mutating requests
  const cookieStore = cookies();
  const cookieVal = cookieStore.get('pd_admin')?.value?.trim();
  const headerSecret = req.headers.get('x-admin-secret')?.trim();
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  const isAuthed =
    verifyAdminSessionToken(cookieVal) ||
    verifyAdminSessionToken(headerSecret) ||
    verifyAdminSessionToken(authHeader);

  if (req.method !== 'GET' && !isAuthed) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized. Admin credentials required.' },
      { status: 401 }
    );
  }

  const subPath = (params?.path ?? []).join('/');
  const backendPath = `/api/rss${subPath ? `/${subPath}` : ''}`;
  const search = req.nextUrl.search;
  const targetUrl = `${getBackendBase()}${backendPath}${search}`;

  const forwardHeaders = new Headers();
  if (isAuthed) {
    forwardHeaders.set('x-admin-secret', secret);
  }
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
    console.error(`[rss-api-proxy] Failed to connect to backend at ${targetUrl}:`, err);
    return NextResponse.json(
      { ok: false, error: 'Backend unreachable' },
      { status: 502 }
    );
  }
}

export {
  handleRssProxy as GET,
  handleRssProxy as POST,
  handleRssProxy as PUT,
  handleRssProxy as DELETE,
  handleRssProxy as PATCH,
};
