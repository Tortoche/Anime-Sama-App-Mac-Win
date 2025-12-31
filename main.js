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

  // User Agent modifié pour éviter certaines détections de bot/adblock
  mainWindow.webContents.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

  mainWindow.loadURL('https://anime-sama.pw/');

  // --- GESTION DES FENÊTRES EXTERNES (Le Mur) ---
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const lowerUrl = url.toLowerCase();

    // 1. Liste Blanche : Domaines autorisés à s'ouvrir DANS TON NAVIGATEUR PAR DÉFAUT (Chrome/Edge)
    const externalWhitelist = [
      'discord.com', 'discord.gg',
      'paypal.com', 'paypal.me',
      'twitter.com', 'x.com',
      'instagram.com',
      'github.com',
      'ko-fi.com', 'tipeee.com'
    ];

    // 2. Liste Blanche Interne : Domaines autorisés DANS L'APP (Lecteurs vidéo, Captcha...)
    // Attention : On n'ouvre JAMAIS de nouvelle fenêtre pour un lecteur vidéo dans l'app,
    // ils doivent rester dans l'iframe. Donc si un lecteur demande une nouvelle fenêtre, c'est souvent une pub.
    // Sauf exception (ex: lien de téléchargement légitime).

    // A. Liens Externes de Confiance -> Ouvrir dans le navigateur système
    if (externalWhitelist.some(domain => lowerUrl.includes(domain))) {
      shell.openExternal(url);
      return { action: 'deny' };
    }

    // B. Tout le reste (Pubs, Popups de lecteurs, Sites inconnus) -> BLOQUER
    // Les lecteurs vidéo (Sibnet, etc.) essaient d'ouvrir des pubs en popup. On dit NON.
    console.log("🚫 Popup bloquée par Main : " + url);
    return { action: 'deny' };
  });
}

// --- IPC ---
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
