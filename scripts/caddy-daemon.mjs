import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const caddyExe = path.join(root, 'caddy', 'caddy.exe');
const caddyFile = path.join(root, 'Caddyfile');

const child = spawn(caddyExe, ['run', '--config', caddyFile], {
  cwd: root,
  stdio: 'inherit',
  windowsHide: true,
});

child.on('exit', (code, signal) => {
  console.log(`[Caddy] Exited with code ${code}, signal ${signal}`);
  process.exit(code || 0);
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
