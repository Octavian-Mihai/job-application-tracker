import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './connection.js';

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

/**
 * Applies every numbered .sql file in migrations/ that hasn't run yet,
 * in filename order. Each file runs in its own transaction.
 * @returns {string[]} versions applied during this call
 */
export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    )
  `);

  const applied = new Set(
    db.prepare('SELECT version FROM schema_migrations').all().map((r) => r.version),
  );
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  const ran = [];

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(file);
    })();
    ran.push(file);
  }
  return ran;
}

// Run directly: `npm run migrate`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ran = migrate();
  console.log(ran.length ? `Applied: ${ran.join(', ')}` : 'Database up to date.');
}
