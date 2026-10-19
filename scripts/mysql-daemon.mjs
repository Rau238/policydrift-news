import { spawn } from 'child_process';
import path from 'path';

const mysqldExe = 'F:\\mariadb\\mariadb-10.11.8-winx64\\bin\\mysqld.exe';
const datadir = 'F:\\mariadb\\data';

const child = spawn(mysqldExe, [`--datadir=${datadir}`, '--port=3306', '--console'], {
  stdio: 'inherit',
  windowsHide: true,
});

child.on('exit', (code, signal) => {
  console.log(`[MySQL] Exited with code ${code}, signal ${signal}`);
  process.exit(code || 0);
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
