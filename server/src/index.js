import { createApp } from './app.js';
import { migrate } from './db/migrate.js';
import { config } from './config.js';

const ran = migrate();
if (ran.length) console.log(`Applied migrations: ${ran.join(', ')}`);

createApp().listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
