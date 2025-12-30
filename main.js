const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Notre coffre-fort local
const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Anime Sama Ultra",
    backgroundColor: '#1a1a1a',
    autoHideMenuBar: true,
    // C'est ici que la magie du logo opère 👇
    icon: path.join(__dirname, 'build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  // On charge la boussole
  mainWindow.loadURL('https://anime-sama.pw/');

  // Gestion des liens externes
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.includes('anime-sama')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

// --- IPC (Valise Diplomatique) ---

ipcMain.handle('save-backup', async (event, data) => {
  store.set('localStorageBackup', data);
  console.log('💾 Sauvegarde effectuée sur le disque PC.');
  return true;
});

ipcMain.handle('get-backup', async () => {
  const data = store.get('localStorageBackup');
  console.log('♻️ Lecture du backup PC.');
  return data || {};
});

// Démarrage
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});