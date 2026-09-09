import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  const targetUrl = `${getBackendBase()}/api/news${search}`;

  try {
    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await upstream.json();
    return NextResponse.json(data, {
      status: upstream.status,
      headers: {
        'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    console.error(`[news-proxy] Error fetching ${targetUrl}:`, err);
    return NextResponse.json(
      { posts: [], total: 0, error: 'Failed to fetch news from backend' },
      { status: 502 }
    );
  }
}
