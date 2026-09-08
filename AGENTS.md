# Rules for AI Coding Assistants (AGENTS.md)

## CRITICAL BUILD RESTRICTION RULE

1. **NEVER trigger, run, or execute a new build automatically** (`npm run build`, `npm run build:prod`, `npm run build:dev`, `next build`, etc.) in ANY environment (Frontend or Backend).
2. **Double Confirmation Requirement**: If a build is thought to be necessary, you MUST explicitly ask the user and receive confirmation **twice** before running any build command.
3. **Environment Isolation**:
   - Development builds and cache are isolated to `frontend/.next-dev/` (via `next.config.mjs`).
   - Production builds live exclusively in `frontend/.next/`.
   - Never delete or wipe `frontend/.next/` from any script or workflow.
   - Backend has no compile step; its build script is a guarded no-op.
4. If a build is authorized by the user with double confirmation, it must be executed with:
   ```bash
   npx cross-env CONFIRM_BUILD=yes npm run build:prod
   ```

## ZERO-DOWNTIME (NO BLACKOUT) PRODUCTION DEPLOYMENT PROTOCOL

Whenever the user requests deploying to production:
1. **Double Confirmation**:
   - Ask for Confirmation 1 of 2 explaining the zero-downtime plan.
   - Wait for the user response, then ask for Confirmation 2 of 2.
2. **Compile in Background (No Blackout)**:
   - Run: `npx cross-env CONFIRM_BUILD=yes npm run build:prod`
   - Existing PM2 processes (`newsfree365-web` & `newsfree365-api`) remain running to serve live traffic without blackout or downtime.
3. **Graceful PM2 Reload**:
   - Once build succeeds, reload PM2:
     ```bash
     npx pm2 restart newsfree365-web newsfree365-api --update-env
     ```
4. **Health Verification**:
   - Verify endpoints respond with `200 OK`:
     - Web: `http://localhost:3050`
     - API: `http://127.0.0.1:4050/health`
5. **Confirm and Report**:
   - Report verified status to user.
