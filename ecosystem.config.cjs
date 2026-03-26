/**
 * PM2 process file — API only (Express + MySQL).
 * Loads env from repo root `.env` / `backend/.env` via backend/src/config/env.js.
 *
 * Usage (from repo root):
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup   # follow the printed command (Linux/macOS); Windows differs
 */
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'policydrift',
      cwd: path.join(__dirname, 'backend'),
      script: 'src/server.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
      },
    },
  ],
};
