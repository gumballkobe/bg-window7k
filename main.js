// main.js
const { app, BrowserWindow, shell, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// 🧱 Optional DevTools blocker
const blockDevTools = require('./blockDevTools');

const isDev = !app.isPackaged;
const showDevtoolsInProd = process.env.ELECTRON_DEBUG === '1';

app.setAppUserModelId('com.jeremykm.bgwindow7k');

// ✅ Single-instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
    app.on('second-instance', () => {
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
      }
    });
}

// 🌐 Inject global CSP header (applies to all HTML)
function setupCSP() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          // ✅ Allows inline scripts/styles and all local assets safely
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
          "style-src 'self' 'unsafe-inline' https:; " +
          "img-src 'self' data: blob: filesystem:; " +
          "font-src 'self' data: https:; " +
          "media-src 'self' data: blob:; " +
          "connect-src 'self' data: blob: filesystem:;"
        ]
      }
    });
  });
}

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  const hasPreload = fs.existsSync(preloadPath);

  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1024,
    minHeight: 640,
    title: 'BG-Window7k',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    backgroundColor: '#0f0f13',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      ...(hasPreload ? { preload: preloadPath } : {}),
    },
  });

  // 🧱 Optional: block DevTools in production
  if (!isDev) blockDevTools(win);

  // 🔒 Open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith('file://')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // ---- Load index.html safely ----
  const indexPath = path.join(__dirname, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('[main] ❌ index.html NOT FOUND:', indexPath);
  }

  win
    .loadFile(indexPath, {
      baseURLForDataURL: `file://${__dirname.replace(/\\/g, '/')}/`,
    })
    .catch(err => console.error('[main] loadFile error:', err));

  win.once('ready-to-show', () => {
    win.show();

    // ✅ Only open DevTools if allowed
    if (isDev || showDevtoolsInProd) {
      win.webContents.openDevTools({ mode: 'detach' });
    }

    // 🔄 Auto-updater: check for updates once UI is ready
    if (!isDev) {
      console.log('[autoUpdater] Checking for updates...');
      autoUpdater.checkForUpdatesAndNotify();
    }
  });

  // Debug logs
  win.webContents.on('dom-ready', () =>
    console.log('[dom-ready] URL:', win.webContents.getURL())
  );
  win.webContents.on('did-fail-load', (_e, code, desc, url, isMainFrame) =>
    console.error('[did-fail-load]', { code, desc, url, isMainFrame })
  );
  win.webContents.on('render-process-gone', (_e, details) =>
    console.error('[render-process-gone]', details)
  );
  win.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    const levels = ['LOG', 'WARN', 'ERROR'];
    console.log(`[RENDERER:${levels[level] || level}] ${message} at ${sourceId}:${line}`);
  });
}

app.whenReady().then(() => {
  setupCSP(); // 🌐 Apply CSP before loading any window
  createWindow();

  if (!isDev) {
    app.on('browser-window-created', (_e, win) => {
      blockDevTools(win);
      win.webContents.closeDevTools();
      win.webContents.on('devtools-opened', () => win.webContents.closeDevTools());
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 🔄 Auto-Updater Events
autoUpdater.on('checking-for-update', () => console.log('[autoUpdater] Checking for update…'));
autoUpdater.on('update-available', info => console.log(`[autoUpdater] Update available: ${info.version}`));
autoUpdater.on('update-not-available', () => console.log('[autoUpdater] No update available'));
autoUpdater.on('error', err => console.error('[autoUpdater] Error:', err?.stack || err));
autoUpdater.on('download-progress', p => console.log(`[autoUpdater] Downloaded ${p.percent.toFixed(1)}%`));
autoUpdater.on('update-downloaded', info => {
  const choice = dialog.showMessageBoxSync({
    type: 'info',
    title: 'Update Ready',
    message: `Version ${info.version} downloaded.\nRestart BG-Window7k now?`,
    buttons: ['Restart Now', 'Later']
  });
  if (choice === 0) autoUpdater.quitAndInstall();
});
