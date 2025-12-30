const { contextBridge, ipcRenderer } = require('electron');

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
        // Lancer la sync auto en arrière-plan
        setTimeout(gererSyncAuto, 2000);
        
        // Si on est sur le profil, on affiche le bouton Logo
        if (currentUrl.includes("/profil")) {
            injecterInterfaceAdmin();
        }
    }
});

// ============================================================
// 💾 GESTION AUTOMATIQUE (Arrière-plan)
// ============================================================
async function gererSyncAuto() {
    const backupData = await ipcRenderer.invoke('get-backup');
    const localLength = localStorage.length;
    const backupLength = Object.keys(backupData).length;

    // Restauration silencieuse si site vide
    if (localLength < 2 && backupLength > 0) {
        console.log("♻️ Restauration Auto...");
        for (const key in backupData) {
            localStorage.setItem(key, backupData[key]);
        }
        window.location.reload();
    }
    // Sauvegarde silencieuse si données présentes
    else if (localLength > 5) {
        const currentDataStr = JSON.stringify(localStorage);
        const backupDataStr = JSON.stringify(backupData);

        if (currentDataStr !== backupDataStr) {
            // On prépare l'objet exactement comme ton format demandé
            let dataToSave = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                dataToSave[key] = localStorage.getItem(key);
            }
            ipcRenderer.invoke('save-backup', dataToSave);
        }
    }
}

// ============================================================
// 🎨 INTERFACE ADMIN (Bouton Logo + Menu)
// ============================================================
function injecterInterfaceAdmin() {
    // 1. Injecter le CSS pour le menu
    const style = document.createElement('style');
    style.textContent = `
        #btn-admin-logo {
            position: fixed; bottom: 30px; right: 30px;
            width: 60px; height: 60px; border-radius: 50%;
            cursor: pointer; z-index: 99990;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            transition: transform 0.2s;
            border: 2px solid #4F46E5;
        }
        #btn-admin-logo:hover { transform: scale(1.1); }
        
        #admin-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 99999;
            display: none; justify-content: center; align-items: center;
            backdrop-filter: blur(5px);
        }
        
        .admin-modal {
            background: #1E293B; color: white;
            padding: 30px; border-radius: 20px;
            width: 90%; max-width: 400px;
            text-align: center; border: 1px solid #334155;
            font-family: 'Segoe UI', sans-serif;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        
        .admin-btn {
            display: block; width: 100%; padding: 15px; margin: 10px 0;
            border: none; border-radius: 10px; cursor: pointer;
            font-size: 16px; font-weight: bold; transition: background 0.2s;
        }
        
        .btn-export { background: #0ea5e9; color: white; }
        .btn-export:hover { background: #0284c7; }
        
        .btn-import { background: #10b981; color: white; }
        .btn-import:hover { background: #059669; }
        
        .btn-reset { background: #ef4444; color: white; }
        .btn-reset:hover { background: #dc2626; }
        
        .btn-close { background: transparent; color: #94a3b8; margin-top: 10px; }
    `;
    document.head.appendChild(style);

    // 2. Créer le Bouton Logo (Image officielle)
    const img = document.createElement('img');
    img.src = "https://anime-sama.fr/template/images/logo_court.png";
    img.id = "btn-admin-logo";
    img.title = "Menu Admin Ultra";
    img.onclick = () => document.getElementById('admin-modal-overlay').style.display = 'flex';
    document.body.appendChild(img);

    // 3. Créer la Fenêtre Modale (Cachée par défaut)
    const modalHtml = `
        <div id="admin-modal-overlay">
            <div class="admin-modal">
                <img src="https://anime-sama.fr/template/images/logo_court.png" style="width:50px; margin-bottom:15px;">
                <h2 style="margin:0 0 20px 0;">Gestion des Données</h2>
                
                <button class="admin-btn btn-export" onclick="window.exporterData()">
                    📤 Exporter (Copier)
                </button>
                
                <button class="admin-btn btn-import" onclick="window.importerData()">
                    📥 Importer (Coller)
                </button>
                
                <button class="admin-btn btn-reset" onclick="window.resetData()">
                    🗑️ Reset Historique
                </button>

                <button class="admin-btn btn-close" onclick="document.getElementById('admin-modal-overlay').style.display='none'">
                    Fermer
                </button>
            </div>
        </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = modalHtml;
    document.body.appendChild(div);

    // --- FONCTIONS DU MENU ---

    // 1. EXPORTER (Format Brut LocalStorage)
    window.exporterData = async () => {
        // On crée un objet simple : Clé -> Valeur (String brute)
        let exportObj = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // IMPORTANT: On prend la valeur brute (getItem) sans la parser !
            // Cela garde les [\"...\"] intacts comme tu le veux.
            exportObj[key] = localStorage.getItem(key);
        }
        
        const jsonFinal = JSON.stringify(exportObj);
        
        // On envoie au Main Process pour copier
        await ipcRenderer.invoke('copy-to-clipboard', jsonFinal);
        alert("✅ Données copiées dans le presse-papier !");
        document.getElementById('admin-modal-overlay').style.display = 'none';
    };

    // 2. IMPORTER
    window.importerData = async () => {
        const input = prompt("Collez vos données JSON ici :");
        if (!input) return;

        try {
            const data = JSON.parse(input);
            
            // On injecte chaque clé directement
            for (const key in data) {
                localStorage.setItem(key, data[key]);
            }
            
            // On force une sauvegarde PC immédiate
            await ipcRenderer.invoke('save-backup', data);
            
            alert("📥 Importation réussie ! Rechargement...");
            window.location.reload();
        } catch (e) {
            alert("❌ Erreur de format JSON !");
            console.error(e);
        }
    };

    // 3. RESET
    window.resetData = async () => {
        if(confirm("⚠️ Attention : Cela va TOUT effacer (PC et Site). Continuer ?")) {
            localStorage.clear();
            await ipcRenderer.invoke('clear-backup');
            alert("🧹 Tout est propre !");
            window.location.reload();
        }
    };
}

// --- VISUELS SPLASH SCREEN ---
function showSplashScreen() {
    const div = document.createElement('div');
    div.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #1a1a1a; z-index: 99999;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        color: white; font-family: sans-serif;
    `;
    div.innerHTML = `
        <img src="https://anime-sama.fr/template/images/logo_court.png" style="width:100px; border-radius:20px; margin-bottom:20px;">
        <h1 style="font-size: 24px;">🚀 Anime-Sama Ultra</h1>
        <p>Connexion au serveur...</p>
    `;
    document.body.appendChild(div);
}
