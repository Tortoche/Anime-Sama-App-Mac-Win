const { app, BrowserWindow, ipcMain, shell, clipboard } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Anime Sama",
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

  // GESTION INTELLIGENTE DES LIENS EXTERNES (Anti-Pub & Sécurité)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const lowerUrl = url.toLowerCase();

    // 1. Liste Blanche : Domaines de confiance (Ouvrir dans le navigateur par défaut)
    const whitelist = [
      'discord.com', 'discord.gg',
      'paypal.com', 'paypal.me',
      'twitter.com', 'x.com',
      'instagram.com',
      'github.com'
    ];

    // 2. Liste Noire : Pubs connues (Bloquer impérativement)
    const blacklist = [
      'betclic', 'winamax', 'adservice', 'doubleclick', 
      'googleads', 'popcash', 'popads', 'monetag'
    ];

    // VÉRIFICATION
    const isTrusted = whitelist.some(domain => lowerUrl.includes(domain));
    const isAd = blacklist.some(ad => lowerUrl.includes(ad));
    const isInternal = lowerUrl.includes('anime-sama');

    // A. Si c'est un lien de confiance -> Ouvrir dans Chrome/Edge
    if (isTrusted) {
      shell.openExternal(url);
      return { action: 'deny' };
    }

    // B. Si c'est une pub connue -> BLOQUER
    if (isAd) {
      console.log("🚫 Pub bloquée (Blacklist) : " + url);
      return { action: 'deny' };
    }

    // C. Si c'est un lien interne (ex: changement de domaine anime-sama) -> AUTORISER DANS L'APP
    if (isInternal) {
      return { action: 'allow' };
    }

    // D. Pour tout le reste (liens inconnus, potentiellement pubs) -> BLOQUER PAR PRÉCAUTION
    // Si un jour le site change de lien PayPal et que ça bloque, tu devras mettre à jour l'app.
    // C'est le prix de la sécurité "El Muro".
    console.log("🚫 Lien inconnu bloqué : " + url);
    return { action: 'deny' };
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
