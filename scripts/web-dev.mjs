/**
 * Runs Next on WEB_PORT (dotenv-cli loads .env.development / .env.production first).
 * Avoids Next binding to PORT meant for the API.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = process.env.WEB_PORT || '3050';

const child = spawn('npm', ['run', 'dev', '-w', 'newsfree365-frontend', '--', '-p', port], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env },
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
