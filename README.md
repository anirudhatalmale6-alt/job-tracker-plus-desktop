# Job Tracker Plus — macOS Desktop App

A standalone **macOS** desktop version of your Job Tracker web app. It runs
**100% offline** — no internet, no server, no Emergent/Lovable dependency. All
your data (jobs, payments, invoices) is stored locally on your Mac and persists
between launches, just like any installed program.

The design and features are identical to your web app — this just wraps it into
a native Mac application.

---

## Install & run (the easy way)

1. Download `Job-Tracker-Plus-macOS.zip` from the
   [latest release](../../releases/latest).
2. Double-click the zip to unzip it — you'll get **Job Tracker Plus.app**.
3. Drag **Job Tracker Plus.app** into your **Applications** folder.
4. **First launch only:** right-click (or Control-click) the app and choose
   **Open**, then click **Open** in the dialog. macOS shows this prompt once
   because the app isn't from the App Store — after that you can open it
   normally from Launchpad/Applications.

That's it. Your data is saved automatically as you use it.

> Works on both Apple Silicon (M1/M2/M3) and Intel Macs.

---

## Your data

- Everything is stored locally on your Mac and never leaves your computer.
- Use **Backup Data** to export a `.json` file, and **Restore Data** to load it
  back — handy for moving to a new Mac or keeping a safety copy.

---

## Building it yourself (optional)

You only need this if you want to rebuild from source. Requires
[Node.js](https://nodejs.org) 18+.

### Rebuild the web app (if you change the source)
The React/Vite source is in `src-app/`:
```bash
cd src-app
npm install
npm run build          # outputs to src-app/dist
cp -r dist/* ../web/   # copy the fresh build into the Electron app
```

### Rebuild the macOS app
```bash
npm install
npm run dist:mac       # produces a .dmg in dist/  (run this on a Mac)
```
`npm run dist:mac` must be run on a Mac (it builds a signed `.dmg`). The
released `.app` was assembled and ad-hoc signed for direct use on your own Macs.

---

## What's inside

- `main.js` — Electron main process. Serves the app over a private, secure
  `app://` scheme so data persists reliably and the app stays fully offline.
- `web/` — the pre-built web app (offline; Inter font self-hosted).
- `src-app/` — the original React/Vite source (unchanged design & features).
- `build/` — app icons.
