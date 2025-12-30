const { ipcRenderer } = require('electron');

// URL du logo officiel (plus fiable pour l'affichage web)
const LOGO_URL = "https://anime-sama.fr/template/images/logo_court.png";

window.addEventListener('DOMContentLoaded', async () => {
    console.log("🌮 Preload Ultra chargé...");
    
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
        setTimeout(gererSyncAuto, 2500);
        
        // Bouton Admin en haut à droite sur le profil
        if (currentUrl.includes("/profil")) {
            injecterInterfaceAdmin();
        }
    }
});

async function gererSyncAuto() {
    const backupData = await ipcRenderer.invoke('get-backup');
    const localLength = localStorage.length;
    
    if (localLength < 2 && Object.keys(backupData).length > 0) {
        for (const key in backupData) {
            localStorage.setItem(key, backupData[key]);
        }
        window.location.reload();
    } else if (localLength > 5) {
        let dataToSave = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            dataToSave[key] = localStorage.getItem(key);
        }
        ipcRenderer.invoke('save-backup', dataToSave);
    }
}

function injecterInterfaceAdmin() {
    // 1. CSS (Inspiré par ton fichier CSS Anime Sama)
    const style = document.createElement('style');
    style.textContent = `
        #btn-admin-logo {
            position: fixed; top: 15px; right: 15px;
            width: 50px; height: 50px; border-radius: 8px;
            cursor: pointer; z-index: 999999;
            box-shadow: 0 0 15px rgba(14, 165, 233, 0.3);
            transition: all 0.3s ease;
            border: 1px solid rgba(70, 100, 150, 0.4);
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(10px);
            padding: 5px;
        }
        #btn-admin-logo:hover { 
            transform: scale(1.05); 
            border-color: #0ea5e9;
            box-shadow: 0 0 20px rgba(14, 165, 233, 0.5);
        }
        
        #admin-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85); z-index: 1000000;
            display: none; justify-content: center; align-items: center;
            backdrop-filter: blur(12px);
            font-family: sans-serif;
        }
        
        .admin-modal {
            background: rgba(10, 18, 29, 0.95);
            color: white; padding: 2rem; border-radius: 1rem;
            width: 380px; text-align: center;
            border: 1px solid rgba(70, 100, 150, 0.2);
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
        }
        
        .admin-btn {
            display: block; width: 100%; padding: 0.75rem; margin: 0.5rem 0;
            border: 1px solid rgba(14, 165, 233, 0.3);
            border-radius: 0.5rem; cursor: pointer;
            font-size: 0.85rem; font-weight: 800; text-transform: uppercase;
            color: #ffffff; background: rgba(30, 50, 80, 0.4);
            transition: all 0.3s ease;
        }
        
        .admin-btn:hover {
            background: rgba(14, 165, 233, 0.2);
            border-color: #0ea5e9;
            box-shadow: 0 0 10px rgba(14, 165, 233, 0.2);
        }
        
        .btn-reset { border-color: rgba(239, 68, 68, 0.5); }
        .btn-reset:hover { background: rgba(239, 68, 68, 0.15); border-color: #ef4444; }

        #import-zone { 
            display: none; margin-top: 1rem; padding-top: 1rem;
            border-top: 1px solid rgba(70, 100, 150, 0.2);
        }
        #import-area {
            width: 100%; height: 120px; background: rgba(0,0,0,0.5);
            color: #0ea5e9; border: 1px solid rgba(14, 165, 233, 0.2);
            border-radius: 0.5rem; font-family: monospace; font-size: 10px;
            padding: 0.5rem; outline: none; margin-bottom: 0.5rem;
        }
        #btn-confirm-import { background: #0ea5e9; color: black; }
    `;
    document.head.appendChild(style);

    // 2. Bouton Logo
    const img = document.createElement('img');
    img.src = LOGO_URL;
    img.id = "btn-admin-logo";
    img.title = "Options Ultra";
    document.body.appendChild(img);

    // 3. Modal structure
    const modalDiv = document.createElement('div');
    modalDiv.id = "admin-modal-overlay";
    modalDiv.innerHTML = `
        <div class="admin-modal">
            <img src="${LOGO_URL}" style="height: 40px; margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.9rem;">Options Administrateur</h4>
            
            <button id="btn-reset" class="admin-btn btn-reset">1. Vider l'historique (Reset)</button>
            <button id="btn-export" class="admin-btn">2. Exporter la progression (Copier)</button>
            <button id="btn-import-toggle" class="admin-btn">3. Importer des données (Coller)</button>
            
            <div id="import-zone">
                <textarea id="import-area" placeholder="Collez votre JSON ici..."></textarea>
                <button id="btn-confirm-import" class="admin-btn">Confirmer l'importation</button>
            </div>

            <button id="btn-close" class="admin-btn" style="background: transparent; border: none; opacity: 0.5; font-size: 0.7rem;">Fermer</button>
        </div>
    `;
    document.body.appendChild(modalDiv);

    // --- LOGIQUE DES BOUTONS (Attachée proprement) ---

    const overlay = document.getElementById('admin-modal-overlay');

    img.onclick = () => { overlay.style.display = 'flex'; };

    document.getElementById('btn-close').onclick = () => { overlay.style.display = 'none'; };

    // RESET
    document.getElementById('btn-reset').onclick = async () => {
        if (confirm("¡Cuidado! Cela va supprimer ton historique local et sur le PC. Continuer ?")) {
            localStorage.clear();
            await ipcRenderer.invoke('clear-backup');
            location.reload();
        }
    };

    // EXPORT
    document.getElementById('btn-export').onclick = async () => {
        let data = {};
        for (let i = 0; i < localStorage.length; i++) {
            data[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
        }
        await ipcRenderer.invoke('copy-to-clipboard', JSON.stringify(data));
        alert("✅ Progression copiée dans le presse-papier, hermano !");
        overlay.style.display = 'none';
    };

    // TOGGLE IMPORT ZONE
    document.getElementById('btn-import-toggle').onclick = () => {
        const zone = document.getElementById('import-zone');
        zone.style.display = (zone.style.display === 'block') ? 'none' : 'block';
    };

    // CONFIRM IMPORT
    document.getElementById('btn-confirm-import').onclick = async () => {
        const raw = document.getElementById('import-area').value.trim();
        if (!raw) return;

        try {
            const data = JSON.parse(raw);
            localStorage.clear();
            for (const key in data) {
                localStorage.setItem(key, data[key]);
            }
            await ipcRenderer.invoke('save-backup', data);
            alert("📥 Importation réussie ! L'application va redémarrer.");
            location.reload();
        } catch (e) {
            alert("❌ Erreur de format ! Assure-toi d'avoir copié tout le JSON. ¡Qué pena!");
            console.error(e);
        }
    };
}

function showSplashScreen() {
    const div = document.createElement('div');
    div.id = 'loading-overlay';
    div.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #000000; z-index: 9999999;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        color: white; font-family: sans-serif;
    `;
    div.innerHTML = `
        <img src="${LOGO_URL}" style="width: 80px; margin-bottom: 1rem;">
        <h2 style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; font-size: 1.2rem;">Connexion au serveur...</h2>
        <p style="opacity: 0.5; font-style: italic; font-size: 0.8rem; margin-top: 0.5rem;">Prépare les tacos, on arrive...</p>
    `;
    document.body.appendChild(div);
}
