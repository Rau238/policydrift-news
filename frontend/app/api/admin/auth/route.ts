/**
 * /api/admin/auth
 * Validates the admin secret and manages a secure httpOnly cookie with signed tokens.
 * Protects against brute-force attacks and timing-attacks.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  generateAdminSessionToken,
  verifyAdminSessionToken,
  checkAdminRateLimit,
  recordFailedAdminLogin,
  resetAdminRateLimit,
} from '@/lib/admin-auth';

export async function GET() {
  const cookieStore = cookies();
  const cookieVal = cookieStore.get('pd_admin')?.value?.trim();

  if (!cookieVal || !verifyAdminSessionToken(cookieVal)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  // 1. Check Rate Limit / Brute-Force lockout
  const rateLimit = checkAdminRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many failed login attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds || 60),
        },
      }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const secret = (body?.secret || '').trim();

    if (!secret || !verifyAdminSessionToken(secret)) {
      recordFailedAdminLogin(ip);
      return NextResponse.json(
        { ok: false, error: 'Invalid admin secret key.' },
        { status: 401 }
      );
    }

    // Reset rate limit on successful authentication
    resetAdminRateLimit(ip);

    // Generate secure HMAC-signed session token
    const sessionToken = generateAdminSessionToken();

    const cookieStore = cookies();
    cookieStore.set('pd_admin', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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
