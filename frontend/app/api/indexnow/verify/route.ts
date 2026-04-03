import { NextResponse } from 'next/server';

/**
 * IndexNow key verification: plaintext body must equal INDEXNOW_KEY.
 * Rewritten from `/{INDEXNOW_KEY}.txt` in production (see next.config.mjs).
 */
export async function GET() {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key) {
    return new NextResponse('Not configured', { status: 404 });
  }
  return new NextResponse(key, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
