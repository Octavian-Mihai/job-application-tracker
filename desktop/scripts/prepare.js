// Copies the server source and the built client into desktop/ so electron-builder can package them.
import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktop = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(desktop, '..');

console.log('Building client…');
execSync('npm run build', { cwd: path.join(root, 'client'), stdio: 'inherit' });

rmSync(path.join(desktop, 'server'), { recursive: true, force: true });
rmSync(path.join(desktop, 'client-dist'), { recursive: true, force: true });
mkdirSync(path.join(desktop, 'server'), { recursive: true });
cpSync(path.join(root, 'server', 'src'), path.join(desktop, 'server', 'src'), { recursive: true });
// the server's package.json supplies "type": "module" for its files
cpSync(path.join(root, 'server', 'package.json'), path.join(desktop, 'server', 'package.json'));
cpSync(path.join(root, 'client', 'dist'), path.join(desktop, 'client-dist'), { recursive: true });
console.log('Prepared desktop/server and desktop/client-dist');
