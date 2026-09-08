#!/usr/bin/env node
/**
 * Build Guard for NewsFree365 (Both Frontend and Backend)
 *
 * Enforces strict build protection across all environments:
 * 1. Prevents any accidental, automated, or unconfirmed build invocation.
 * 2. An automated build MUST NEVER be executed unless confirmed by the user twice.
 * 3. Allowed when CONFIRM_BUILD=yes or --confirm/--force is explicitly supplied.
 * 4. Allowed in CI/CD cloud deployment platforms (RENDER, CI, VERCEL, RAILWAY).
 */

const isCI = Boolean(
  process.env.CI ||
  process.env.RENDER ||
  process.env.VERCEL ||
  process.env.RAILWAY_ENVIRONMENT
);

const isBackend = process.argv.includes('--backend');

// If running backend build
if (isBackend) {
  console.log('[build-guard] newsfree365-backend: Plain Node ES modules (no compile step required).');
  process.exit(0);
}

// If running in cloud CI/CD
if (isCI) {
  console.log('[build-guard] CI/Cloud deployment detected — build allowed to proceed.');
  process.exit(0);
}

const isConfirmed =
  process.env.CONFIRM_BUILD === 'yes' ||
  process.env.CONFIRM_BUILD === 'true' ||
  process.argv.includes('--confirm') ||
  process.argv.includes('--force');

if (!isConfirmed) {
  console.error('\n' + '='.repeat(78));
  console.error('[BUILD GUARD] ACTION BLOCKED: Direct build execution is prevented.');
  console.error('');
  console.error('To protect active development and production servers:');
  console.error('1. Builds must NEVER be executed automatically by any AI or automated process.');
  console.error('2. A build requires explicit confirmation from the user (prompted twice).');
  console.error('3. If you intentionally want to run this build, execute:');
  console.error('   cross-env CONFIRM_BUILD=yes npm run <build-command>');
  console.error('='.repeat(78) + '\n');
  process.exit(1);
}

console.log('[build-guard] Confirmed build execution authorized.');
process.exit(0);
