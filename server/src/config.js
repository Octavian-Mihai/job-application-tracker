import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT) || 3001,
  /** Folder with the built client (client/dist). Unset in dev, where Vite serves the UI. */
  clientDist: process.env.CLIENT_DIST || null,
  dbPath: process.env.DB_PATH || path.join(serverRoot, 'data', 'tracker.db'),
};
