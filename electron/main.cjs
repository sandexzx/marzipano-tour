'use strict';

const { app, BrowserWindow, dialog, session } = require('electron');
const path = require('node:path');
const { startServer } = require('./server.cjs');
const smokeTest = process.argv.includes('--smoke-test');
let localServer;
let origin;
let window;

async function createWindow() {
  window = new BrowserWindow({
    width: 1280, height: 850, minWidth: 640, minHeight: 480,
    title: 'Marzipano Tour', backgroundColor: '#161b22', show: false,
    autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
  });
  window.setMenu(null);
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    if (new URL(url).origin !== origin) { event.preventDefault(); }
  });
  window.once('ready-to-show', () => { if (!smokeTest) { window.show(); } });
  window.on('closed', () => { window = null; });
  await window.loadURL(origin + '/');

  if (smokeTest) {
    // Exercise the packaged assets and WebGL renderer without needing human input.
    const result = await window.webContents.executeJavaScript(`(async () => {
      const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
      for (let id = 1; id <= 5; id++) {
        document.querySelectorAll('#scenes button')[id - 1].click();
        let ready = false;
        for (let attempt = 0; attempt < 300; attempt++) {
          if (document.querySelector('#status').textContent === '') { ready = true; break; }
          await sleep(100);
        }
        if (!ready) throw new Error('Panorama ' + id + ' did not load');
        await sleep(400);
        const arrows = [...document.querySelectorAll('.travel-arrow')].filter(el => el.getClientRects().length);
        if (arrows.length !== (id === 1 || id === 5 ? 1 : 2)) throw new Error('Invalid arrows at scene ' + id);
      }
      document.querySelector('#show-plan').click();
      const img = document.querySelector('#plan img');
      await img.decode();
      if (img.naturalWidth !== 2823) throw new Error('Floor plan failed to load');
      document.querySelector('.plan-marker').click();
      if (document.querySelector('#plan').open) throw new Error('Plan navigation failed');
      if (!document.querySelector('canvas')) throw new Error('WebGL canvas is missing');
      return 'PASS: all five textures, navigation arrows and floor plan loaded offline';
    })()`);
    console.log(result);
    app.exit(0);
  }
}

app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  const started = await startServer(path.join(__dirname, '..'));
  localServer = started.server;
  origin = started.origin;
  // The packaged application never needs external network resources.
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const allowed = details.url.startsWith(origin + '/') || details.url.startsWith('devtools:');
    callback({ cancel: !allowed });
  });
  await createWindow();
}).catch(error => {
  console.error(error);
  if (!smokeTest) { dialog.showErrorBox('Marzipano Tour', 'Не удалось открыть панорамы.\n' + error.message); }
  app.exit(1);
});

app.on('window-all-closed', () => { app.quit(); });
app.on('before-quit', () => { if (localServer) { localServer.close(); } });
if (smokeTest) {
  setTimeout(() => { console.error('Smoke test timeout'); app.exit(1); }, 180000).unref();
}
