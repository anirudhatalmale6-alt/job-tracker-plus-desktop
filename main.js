// Job Tracker - Electron main process
// Serves the pre-built web app from a custom, secure, standard scheme ("app://") so that:
//   1. The app gets a STABLE origin across launches -> localStorage (where all job/invoice
//      data lives) persists reliably between sessions, like a real installed program.
//   2. The origin is a "secure context" -> the "link a file for permanent storage"
//      feature (File System Access API / showSaveFilePicker) keeps working.
//   3. Absolute asset paths (/static/...) resolve correctly (they don't under file://).
// The app is 100% self-contained and works fully offline - no server, no internet.

const { app, BrowserWindow, protocol, net, shell, Menu, ipcMain, systemPreferences } = require('electron');
const path = require('path');
const fs = require('fs');
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
      spellcheck: false,
      preload: path.join(__dirname, 'preload.js')
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

// --- Touch ID (macOS biometric unlock) -------------------------------------
// The renderer asks whether Touch ID is available and, if the user enabled it,
// triggers the native fingerprint prompt. This only works on Macs with Touch ID
// hardware; on any other platform/hardware it reports unavailable and the app
// falls back to the password unlock.
ipcMain.handle('touchid:available', () => {
  try {
    return process.platform === 'darwin' && systemPreferences.canPromptTouchID();
  } catch (e) {
    return false;
  }
});

ipcMain.handle('touchid:authenticate', async () => {
  try {
    if (process.platform !== 'darwin' || !systemPreferences.canPromptTouchID()) {
      return { ok: false, error: 'unavailable' };
    }
    await systemPreferences.promptTouchID('unlock Job Tracker');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
});

// --- Hand a job over to the Invoice gen app --------------------------------
// The two apps are separate programs with separate storage, so the job is
// passed through a small shared file that both can reach, and Invoice gen is
// then launched (or focused) via its invoicegen:// URL scheme. The URL only
// acts as a trigger; the data travels in the file, so there are no URL length
// or escaping limits.
//
// This is strictly outgoing - nothing here reads or writes Job Tracker's own
// data, so the job list, filters, sorting and statuses are never touched.
const BRIDGE_DIR = path.join(app.getPath('appData'), 'JobTrackerInvoiceBridge');
const BRIDGE_FILE = path.join(BRIDGE_DIR, 'handoff.json');

ipcMain.handle('invoice:send-job', async (event, job) => {
  try {
    if (!job || typeof job !== 'object') return { ok: false, error: 'no job' };

    const payload = {
      version: 1,
      sentAt: Date.now(),
      jobs: [
        {
          name: String(job.name || ''),
          amount: Number(job.amount) || 0,
          currency: String(job.currency || ''),
          month: String(job.month || ''),
          poNumber: String(job.poNumber || ''),
          invoiceNumber: String(job.invoiceNumber || '')
        }
      ]
    };

    fs.mkdirSync(BRIDGE_DIR, { recursive: true });
    fs.writeFileSync(BRIDGE_FILE, JSON.stringify(payload), 'utf8');

    // Ask macOS to open Invoice gen. If it is not installed the open fails and
    // the renderer shows a friendly message instead of failing silently.
    try {
      await shell.openExternal('invoicegen://handoff');
    } catch (openErr) {
      // Nothing is going to collect this job, so do not leave it lying around
      // to be picked up unexpectedly the next time Invoice gen happens to open.
      try { fs.unlinkSync(BRIDGE_FILE); } catch (_) { /* already gone */ }
      return { ok: false, error: String((openErr && openErr.message) || openErr) };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
});

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
