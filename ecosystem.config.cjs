
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

const webPort = String(fileEnv.WEB_PORT || process.env.WEB_PORT || '3050');
const apiPort = String(fileEnv.API_PORT || process.env.API_PORT || '4050');

module.exports = {
  apps: [
    // ─────────────────────────────────────────────────────────────────────────
    // DATABASE — MariaDB / MySQL Server on port 3306
    // ─────────────────────────────────────────────────────────────────────────
    {
      name: 'newsfree365-mysql',
      cwd: root,
      script: path.join(root, 'scripts', 'mysql-daemon.mjs'),
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
    },

    // ─────────────────────────────────────────────────────────────────────────
    // WORKER — RSS ingestion cron (runs independently, NEVER scales > 1)
    // ─────────────────────────────────────────────────────────────────────────
    {
      name: 'newsfree365-worker',
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
        WORKER_ENABLED: 'true',
        ...fileEnv,
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // API — Express backend on port 4050
    // ─────────────────────────────────────────────────────────────────────────
    {
      name: 'newsfree365-api',
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

    // ─────────────────────────────────────────────────────────────────────────
    // WEB — Next.js frontend on port 3050
    // ─────────────────────────────────────────────────────────────────────────
    {
      name: 'newsfree365-web',
      cwd: path.join(root, 'frontend'),
      script: path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next'),
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
        PORT: webPort,
        ...fileEnv,
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────
    // CADDY REVERSE PROXY — Automatic HTTPS & Edge Routing
    // ─────────────────────────────────────────────────────────────────────────
    {
      name: 'newsfree365-caddy',
      cwd: root,
      script: path.join(root, 'scripts', 'caddy-daemon.mjs'),
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
    },
  ],
};
