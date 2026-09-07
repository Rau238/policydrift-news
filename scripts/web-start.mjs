import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontendDir = path.join(root, 'frontend');
const port = process.env.WEB_PORT || '3050';

const child = spawn('npm', ['run', 'start', '--', '-p', port], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env },
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
