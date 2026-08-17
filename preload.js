// Exposes a tiny, safe bridge to the renderer for macOS Touch ID unlock.
// contextIsolation is on and nodeIntegration is off, so the web app can only
// use exactly what we expose here — nothing else from Node/Electron.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAuth', {
  // Resolves true only on a Mac that actually has Touch ID hardware.
  canUseTouchID: () => ipcRenderer.invoke('touchid:available'),
  // Triggers the native Touch ID prompt; resolves { ok: boolean, error? }.
  authenticate: () => ipcRenderer.invoke('touchid:authenticate'),
});

// Hand a job over to the Invoice gen app. Purely outgoing: it never reads or
// changes anything in Job Tracker, so filters, sorting and job status are
// untouched.
contextBridge.exposeInMainWorld('invoiceBridge', {
  available: true,
  // job: { name, amount, currency, month, poNumber, invoiceNumber }
  // resolves { ok: boolean, error? }
  sendJob: (job) => ipcRenderer.invoke('invoice:send-job', job),
});
