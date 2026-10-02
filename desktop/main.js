import { app, BrowserWindow, shell, dialog } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
let mainWindow = null;
let baseUrl = null;

if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

/** Starts the Express API + built UI on a random localhost-only port. Data lives in the user's app-data folder. */
async function startServer() {
  process.env.DB_PATH = path.join(app.getPath('userData'), 'tracker.db');
  process.env.CLIENT_DIST = path.join(here, 'client-dist');
  // config.js reads env at import time, so import the server only after setting it.
  const { migrate } = await import('./server/src/db/migrate.js');
  const { createApp } = await import('./server/src/app.js');
  migrate();
  return new Promise((resolve, reject) => {
    const server = createApp().listen(0, '127.0.0.1', () => resolve(server.address().port));
    server.on('error', reject);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({ width: 1100, height: 800, minWidth: 700, minHeight: 500, title: 'Internship Tracker' });
  mainWindow.loadURL(baseUrl);
  // Job links open in the real browser, not inside the app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(baseUrl)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  try {
    const port = await startServer();
    baseUrl = `http://127.0.0.1:${port}`;
    createWindow();
  } catch (err) {
    dialog.showErrorBox('Internship Tracker failed to start', String(err?.stack || err));
    app.quit();
  }
});

app.on('activate', () => { if (baseUrl && !mainWindow) createWindow(); });
app.on('window-all-closed', () => app.quit());
