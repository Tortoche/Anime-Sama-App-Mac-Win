const { ipcRenderer } = require('electron');

// URL du logo pour éviter les erreurs de "Local Resource"
const LOGO_URL = "https://raw.githubusercontent.com/Anime-Sama/IMG/img/autres/logo.png";

window.addEventListener('DOMContentLoaded', async () => {
    console.log("🌮 Preload Ultra chargé...");
    
    const currentUrl = window.location.href;

    // --- 1. BOUSSOLE (Redirection) ---
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
        // Sync auto discrète
        setTimeout(gererSyncAuto, 2500);
        
        // Affichage du bouton Admin en haut à droite sur le profil
        if (currentUrl.includes("/profil")) {
            injecterInterfaceAdmin();
        }
    }
});

async function gererSyncAuto() {
    const backupData = await ipcRenderer.invoke('get-backup');
    const localLength = localStorage.length;
    
    // Restauration si vide
    if (localLength < 2 && Object.keys(backupData).length > 0) {
        for (const key in backupData) {
            localStorage.setItem(key, backupData[key]);
        }
        window.location.reload();
    }
    // Sauvegarde si plein
    else if (localLength > 5) {
        let dataToSave = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            dataToSave[key] = localStorage.getItem(key);
        }
        ipcRenderer.invoke('save-backup', dataToSave);
    }
}

function injecterInterfaceAdmin() {
    // 1. CSS
    const style = document.createElement('style');
    style.textContent = `
        #btn-admin-logo {
            position: fixed; top: 20px; right: 20px; /* HAUT À DROITE */
            width: 55px; height: 55px; border-radius: 12px;
            cursor: pointer; z-index: 999999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.6);
            transition: transform 0.2s, filter 0.2s;
            border: 2px solid #4F46E5;
            background: #1a1a1a;
            object-fit: cover;
        }
        #btn-admin-logo:hover { transform: scale(1.1); filter: brightness(1.2); }
        
        #admin-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 1000000;
            display: none; justify-content: center; align-items: center;
            backdrop-filter: blur(8px);
        }
        
        .admin-modal {
            background: #1E293B; color: white;
            padding: 25px; border-radius: 15px;
            width: 320px; text-align: center;
            border: 1px solid #334155;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .admin-btn {
            display: block; width: 100%; padding: 12px; margin: 8px 0;
            border: none; border-radius: 8px; cursor: pointer;
            font-size: 15px; font-weight: bold; color: white;
        }
        
        #btn-export { background: #0284c7; }
        #btn-import { background: #059669; }
        #btn-reset { background: #dc2626; }
        #btn-close { background: transparent; color: #94a3b8; margin-top: 5px; }
    `;
    document.head.appendChild(style);

    // 2. Bouton Logo
    const img = document.createElement('img');
    img.src = LOGO_URL;
    img.id = "btn-admin-logo";
    img.addEventListener('click', () => {
        document.getElementById('admin-modal-overlay').style.display = 'flex';
    });
    document.body.appendChild(img);

    // 3. Fenêtre Modale
    const modalDiv = document.createElement('div');
    modalDiv.id = "admin-modal-overlay";
    modalDiv.innerHTML = `
        <div class="admin-modal">
            <img src="${LOGO_URL}" style="width:40px; margin-bottom:10px;">
            <h3 style="margin-bottom:15px;">Options Administrateur</h3>
            
            <button id="btn-reset" class="admin-btn">1. Vider l'historique (Reset)</button>
            <button id="btn-export" class="admin-btn">2. Exporter la progression (Copier)</button>
            <button id="btn-import" class="admin-btn">3. Importer les données (Coller)</button>
            
            <button id="btn-close" class="admin-btn">Fermer</button>
        </div>
    `;
    document.body.appendChild(modalDiv);

    // --- ÉVÉNEMENTS ---
    
    document.getElementById('btn-close').onclick = () => {
        document.getElementById('admin-modal-overlay').style.display = 'none';
    };

    // RESET
    document.getElementById('btn-reset').onclick = async () => {
        if(confirm("¡Cuidado! Voulez-vous vraiment tout effacer ?")) {
            localStorage.clear();
            await ipcRenderer.invoke('clear-backup');
            window.location.reload();
        }
    };

    // EXPORT
    document.getElementById('btn-export').onclick = async () => {
        let data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        const json = JSON.stringify(data);
        await ipcRenderer.invoke('copy-to-clipboard', json);
        alert("✅ Données copiées dans le presse-papier !");
    };

    // IMPORT (FIXÉ)
    document.getElementById('btn-import').onclick = async () => {
        const input = prompt("Collez vos données JSON ici (format brut) :");
        if (!input) return;

        try {
            // On essaie de parser pour vérifier la validité
            const data = JSON.parse(input);
            
            // Nettoyage avant injection
            localStorage.clear();
            
            // On injecte chaque clé
            for (const key in data) {
                localStorage.setItem(key, data[key]);
            }
            
            // Sauvegarde immédiate sur PC
            await ipcRenderer.invoke('save-backup', data);
            
            alert("📥 Importation réussie ! Rechargement...");
            window.location.reload();
        } catch (e) {
            alert("❌ Erreur de format ! Vérifiez que vous avez bien copié tout le texte.");
            console.error(e);
        }
    };
}

function showSplashScreen() {
    if (document.getElementById('loading-overlay')) return;
    const div = document.createElement('div');
    div.id = 'loading-overlay';
    div.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #1a1a1a; z-index: 9999999;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        color: white; font-family: sans-serif;
    `;
    div.innerHTML = `
        <img src="${LOGO_URL}" style="width:100px; border-radius:20px; margin-bottom:20px;">
        <h2 style="font-size: 20px;">🚀 Anime-Sama Ultra</h2>
        <p>¡Andale! Chargement en cours...</p>
    `;
    document.body.appendChild(div);
}
