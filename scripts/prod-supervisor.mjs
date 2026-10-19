import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const prodEnvPath = path.join(root, '.env.production');
const sharedEnvPath = path.join(root, '.env');

const fileEnv = {
  ...dotenv.parse(fs.existsSync(sharedEnvPath) ? fs.readFileSync(sharedEnvPath) : ''),
  ...dotenv.parse(fs.existsSync(prodEnvPath) ? fs.readFileSync(prodEnvPath) : ''),
  NODE_ENV: 'production',
};

const processes = [
  {
    name: 'API',
    cmd: process.execPath,
    args: ['src/server.js'],
    cwd: path.join(root, 'backend'),
    env: { ...process.env, ...fileEnv, API_PORT: '4050', WORKER_ENABLED: 'true' },
  },
  {
    name: 'WORKER',
    cmd: process.execPath,
    args: ['src/workers/worker.js'],
    cwd: path.join(root, 'backend'),
    env: { ...process.env, ...fileEnv, API_PORT: '4050', WORKER_ENABLED: 'true' },
  },
  {
    name: 'WEB',
    cmd: process.execPath,
    args: [path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', '3050'],
    cwd: path.join(root, 'frontend'),
    env: { ...process.env, ...fileEnv, WEB_PORT: '3050', PORT: '3050' },
  },
];

const children = [];

function startProcess(p) {
  const child = spawn(p.cmd, p.args, {
    cwd: p.cwd,
    env: p.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  child.stdout.on('data', (d) => {
    process.stdout.write(`[${p.name}] ${d}`);
  });

  child.stderr.on('data', (d) => {
    process.stderr.write(`[${p.name} ERR] ${d}`);
  });

  child.on('error', (err) => {
    console.error(`[${p.name} SPAWN ERROR]`, err);
  });

  child.on('exit', (code) => {
    console.log(`[${p.name}] exited with code ${code}. Restarting in 2s...`);
    setTimeout(() => startProcess(p), 2000);
  });

  children.push(child);
}

console.log('🚀 Starting NewsFree365 Production Stack (MySQL, Caddy, API, Web, Worker)...');
processes.forEach(startProcess);

process.on('SIGINT', () => {
  children.forEach((c) => c.kill());
  process.exit();
});

process.on('SIGTERM', () => {
  children.forEach((c) => c.kill());
  process.exit();
});
