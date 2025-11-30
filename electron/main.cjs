/**
 * 🖥️ Vung Tau Dream Homes - Electron Main
 */
const { app, BrowserWindow, Menu, Tray, globalShortcut } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';
const PORT = 5175;
const APP_NAME = 'Vung Tau Dream Homes';

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: APP_NAME,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  const url = isDev 
    ? `http://localhost:${PORT}`
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(url);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) mainWindow.webContents.openDevTools();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  tray.setToolTip(APP_NAME);
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

app.whenReady().then(() => {
  console.log(`🚀 Starting ${APP_NAME}...`);
  createWindow();
  createTray();
  
  globalShortcut.register('F12', () => {
    if (mainWindow) mainWindow.webContents.toggleDevTools();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (tray) tray.destroy();
});
