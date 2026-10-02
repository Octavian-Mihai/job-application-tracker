import express from 'express';
import { config } from './config.js';
import applicationsRouter from './routes/applications.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // Auth later: app.use('/api', requireAuth) goes right here, before the routers.
  app.use('/api/applications', applicationsRouter);

  // Packaged/production mode: serve the built React app from the same origin.
  if (config.clientDist) app.use(express.static(config.clientDist));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
