import crypto from 'crypto';

function getMasterSecret(): string {
  return (
    process.env.ADMIN_SECRET?.trim() ||
    process.env.INSIGHTS_ADMIN_SECRET?.trim() ||
    'Raunak@123'
  );
}

/**
 * Generate a cryptographically signed HMAC token for the admin session.
 * Format: `timestamp.hmac_signature`
 */
export function generateAdminSessionToken(): string {
  const secret = getMasterSecret();
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`pd_admin_session_${timestamp}`);
  const signature = hmac.digest('hex');
  return `${timestamp}.${signature}`;
}

/**
 * Validates an admin session token or raw secret with timing-attack resistance.
 */
export function verifyAdminSessionToken(tokenOrSecret: string | undefined | null): boolean {
  if (!tokenOrSecret || typeof tokenOrSecret !== 'string') return false;
  const master = getMasterSecret();
  const trimmed = tokenOrSecret.trim();

  // 1. Check if it's a signed token: timestamp.signature
  if (trimmed.includes('.')) {
    const [timestampStr, signature] = trimmed.split('.');
    if (!timestampStr || !signature) return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Check expiration (24 hours max age)
    const maxAgeMs = 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAgeMs) {
      return false;
    }

    const hmac = crypto.createHmac('sha256', master);
    hmac.update(`pd_admin_session_${timestampStr}`);
    const expectedSig = hmac.digest('hex');

    try {
      const sigBuf = Buffer.from(signature, 'hex');
      const expBuf = Buffer.from(expectedSig, 'hex');
      if (sigBuf.length !== expBuf.length) return false;
      return crypto.timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }

  // 2. Fallback: constant-time comparison against master secret
  try {
    const inputHash = crypto.createHash('sha256').update(trimmed).digest();
    const masterHash = crypto.createHash('sha256').update(master).digest();
    return crypto.timingSafeEqual(inputHash, masterHash);
  } catch {
    return false;
  }
}

/**
 * In-memory brute-force rate limiter for admin authentication
 */
interface RateLimitRecord {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of loginAttempts.entries()) {
      if (now - record.lastAttempt > 60 * 60 * 1000) {
        loginAttempts.delete(ip);
      }
    }
  }, 10 * 60 * 1000);
}

export function checkAdminRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) return { allowed: true };

  if (record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

export function recordFailedAdminLogin(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { attempts: 0, lastAttempt: now, lockedUntil: 0 };
  record.attempts += 1;
  record.lastAttempt = now;

  // Exponential backoff after 5 failed attempts
  if (record.attempts >= 5) {
    const lockoutMinutes = Math.min(30, Math.pow(2, record.attempts - 5) * 2);
    record.lockedUntil = now + lockoutMinutes * 60 * 1000;
  }

  loginAttempts.set(ip, record);
}

export function resetAdminRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}
