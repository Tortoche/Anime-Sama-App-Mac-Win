const { app, BrowserWindow, ipcMain, shell, clipboard } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Anime Sama Ultra",
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true, 
      sandbox: false 
    }
  });

  mainWindow.loadURL('https://anime-sama.pw/');

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.includes('anime-sama')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

// --- IPC (Communications secrètes) ---
ipcMain.handle('save-backup', async (event, data) => {
  store.set('localStorageBackup', data);
  return true;
});

ipcMain.handle('get-backup', async () => {
  return store.get('localStorageBackup') || {};
});

ipcMain.handle('clear-backup', async () => {
  store.clear();
  return true;
});

ipcMain.handle('copy-to-clipboard', async (event, text) => {
  clipboard.writeText(text);
  return true;
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
