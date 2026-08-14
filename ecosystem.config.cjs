/**
 * PM2 — production API + Next web.
 * Env files: repo root `.env.production` (loaded by backend env.js + dotenv in start).
 *
 * Usage (from repo root):
 *   npm run build:prod
 *   npm run pm2:start
 *   pm2 save
 */
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const root = __dirname;
const prodEnvPath = path.join(root, '.env.production');
const sharedEnvPath = path.join(root, '.env');

const fileEnv = {
  ...dotenv.parse(fs.existsSync(sharedEnvPath) ? fs.readFileSync(sharedEnvPath) : ''),
  ...dotenv.parse(fs.existsSync(prodEnvPath) ? fs.readFileSync(prodEnvPath) : ''),
};

const webPort = String(fileEnv.WEB_PORT || process.env.WEB_PORT || '3000');
const apiPort = String(fileEnv.API_PORT || process.env.API_PORT || '4000');

module.exports = {
  apps: [
    {
      name: 'policydrift-worker',
      cwd: path.join(root, 'backend'),
      script: 'src/workers/worker.js',
      interpreter: 'node',
      instances: 1,          // MUST be 1 — only one worker runs crons
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env_production: {
        NODE_ENV: 'production',
        API_PORT: apiPort,
        WORKER_ENABLED: 'true', // tells policydrift-api to skip its RSS cron
        ...fileEnv,
      },
    },
    {
      name: 'policydrift-api',
      cwd: path.join(root, 'backend'),
      script: 'src/server.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        API_PORT: apiPort,
        WORKER_ENABLED: 'true',
        ...fileEnv,
      },
    },
    {
      name: 'policydrift-web',
      cwd: path.join(root, 'frontend'),
      script: 'node_modules/next/dist/bin/next',
      args: `start -p ${webPort}`,
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        WEB_PORT: webPort,
        ...fileEnv,
      },
    },
  ],
};
