// Job Tracker - Electron main process
// Serves the pre-built web app from a custom, secure, standard scheme ("app://") so that:
//   1. The app gets a STABLE origin across launches -> localStorage (where all job/invoice
//      data lives) persists reliably between sessions, like a real installed program.
//   2. The origin is a "secure context" -> the "link a file for permanent storage"
//      feature (File System Access API / showSaveFilePicker) keeps working.
//   3. Absolute asset paths (/static/...) resolve correctly (they don't under file://).
// The app is 100% self-contained and works fully offline - no server, no internet.

const { app, BrowserWindow, protocol, net, shell, Menu } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const APP_SCHEME = 'app';
const APP_HOST = 'local';
const WEB_DIR = path.join(__dirname, 'web');

// Minimal content-type map for the static assets we serve.
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

// Register the custom scheme as privileged BEFORE the app is ready.
protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
]);

function resolveWebPath(requestUrl) {
  const url = new URL(requestUrl);
  let pathname = decodeURIComponent(url.pathname);
  if (!pathname || pathname === '/') pathname = '/index.html';

  // Normalise and prevent path traversal outside WEB_DIR.
  const filePath = path.normalize(path.join(WEB_DIR, pathname));
  if (!filePath.startsWith(WEB_DIR)) return null;
  return filePath;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#f8fafc',
    title: 'Job Tracker',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  // Open real external links (if any) in the system browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Load the app root ("/") rather than "/index.html" so react-router's BrowserRouter
  // matches the "/" route (loading "/index.html" would fall through to the NotFound route).
  win.loadURL(`${APP_SCHEME}://${APP_HOST}/`);
  return win;
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    { role: 'windowMenu' }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  // Serve the bundled web app over the custom scheme.
  protocol.handle(APP_SCHEME, async (request) => {
    const filePath = resolveWebPath(request.url);
    if (!filePath) {
      return new Response('Not found', { status: 404 });
    }
    try {
      const res = await net.fetch(pathToFileURL(filePath).toString());
      const ext = path.extname(filePath).toLowerCase();
      const headers = new Headers(res.headers);
      if (MIME[ext]) headers.set('Content-Type', MIME[ext]);
      return new Response(res.body, { status: res.status, headers });
    } catch (e) {
      // SPA fallback: unknown non-file routes -> index.html
      if (!path.extname(filePath)) {
        const index = await net.fetch(pathToFileURL(path.join(WEB_DIR, 'index.html')).toString());
        return new Response(index.body, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      return new Response('Not found', { status: 404 });
    }
  });

  buildMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
