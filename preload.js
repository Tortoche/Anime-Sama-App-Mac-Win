const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', async () => {
    console.log("🌮 Preload chargé...");
    
    const currentUrl = window.location.href;

    // --- 1. BOUSSOLE ---
    if (currentUrl.includes("anime-sama.pw")) {
        showSplashScreen();
        const interval = setInterval(() => {
            const btn = document.querySelector('a.btn-primary');
            if (btn) {
                clearInterval(interval);
                window.location.href = btn.href;
            }
        }, 500);
    } 
    // --- 2. VRAI SITE ---
    else if (!currentUrl.includes("google")) {
        setTimeout(gererSync, 1000);
        if (currentUrl.includes("/profil")) {
            afficherBoutonAdmin();
        }
    }
});

// --- SYNC ---
async function gererSync() {
    const backupData = await ipcRenderer.invoke('get-backup');
    const localLength = localStorage.length;
    const backupLength = Object.keys(backupData).length;

    // RESTAURATION
    if (localLength < 2 && backupLength > 0) {
        console.log("♻️ Restauration...");
        for (const key in backupData) {
            localStorage.setItem(key, backupData[key]);
        }
        window.location.reload();
    }
    // SAUVEGARDE
    else if (localLength > 5) {
        const currentDataStr = JSON.stringify(localStorage);
        const backupDataStr = JSON.stringify(backupData);

        if (currentDataStr !== backupDataStr) {
            console.log("💾 Sauvegarde...");
            let dataToSave = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                dataToSave[key] = localStorage.getItem(key);
            }
            ipcRenderer.invoke('save-backup', dataToSave);
        }
    }
}

// --- VISUELS ---
function showSplashScreen() {
    const css = `
        #loading-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #1a1a1a; z-index: 99999;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            color: white; font-family: sans-serif;
        }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const div = document.createElement('div');
    div.id = 'loading-overlay';
    div.innerHTML = `
        <h1 style="font-size: 24px;">🚀 Anime-Sama PC</h1>
        <p>Redirection vers le serveur...</p>
    `;
    document.body.appendChild(div);
}

// --- ADMIN ---
function afficherBoutonAdmin() {
    const btn = document.createElement('button');
    btn.innerText = "⚙️ Admin PC";
    btn.style = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; padding: 10px;";
    btn.onclick = async () => {
        const choice = confirm("Voulez-vous forcer la sauvegarde sur le PC maintenant ?");
        if (choice) {
             let dataToSave = {};
            for (let i = 0; i < localStorage.length; i++) {
                dataToSave[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
            }
            await ipcRenderer.invoke('save-backup', dataToSave);
            alert("Sauvegardé sur le disque !");
        }
    };
    document.body.appendChild(btn);
}