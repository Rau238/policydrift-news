/**
 * /api/admin/auth
 * Validates the admin secret and manages a secure httpOnly cookie.
 * The ADMIN_SECRET never leaves the server.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const cookieVal = cookieStore.get('pd_admin')?.value;
  const expected = process.env.ADMIN_SECRET?.trim();

  if (!expected || !cookieVal || cookieVal !== expected) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

export async function POST(req: NextRequest) {
  try {
    const { secret } = (await req.json()) as { secret?: string };
    const expected = process.env.ADMIN_SECRET?.trim();

    if (!expected) {
      return NextResponse.json(
        { ok: false, error: 'Admin not configured on this server. Please set ADMIN_SECRET.' },
        { status: 503 },
      );
    }
    if (!secret || secret !== expected) {
      return NextResponse.json({ ok: false, error: 'Invalid admin secret password.' }, { status: 401 });
    }

    const cookieStore = cookies();
    cookieStore.set('pd_admin', expected, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({ ok: true, message: 'Authentication successful' });
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request payload' }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = cookies();
  cookieStore.delete('pd_admin');
  return NextResponse.json({ ok: true, message: 'Logged out successfully' });
}
