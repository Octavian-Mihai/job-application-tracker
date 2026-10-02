import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT) || 3001,
  dbPath: process.env.DB_PATH || path.join(serverRoot, 'data', 'tracker.db'),
};
