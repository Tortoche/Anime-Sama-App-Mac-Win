const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', async () => {
    console.log("🌮 Preload Ultra 2.0 chargé...");
    
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
        setTimeout(gererSyncAuto, 2000);
        
        // Affichage du bouton Admin UNIQUEMENT sur le profil (ou planning pour tester)
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

    // Restauration silencieuse (Site vide, PC plein)
    if (localLength < 2 && backupLength > 0) {
        console.log("♻️ Restauration Auto...");
        for (const key in backupData) {
            localStorage.setItem(key, backupData[key]);
        }
        window.location.reload();
    }
    // Sauvegarde silencieuse (Site plein)
    else if (localLength > 5) {
        const currentDataStr = JSON.stringify(localStorage);
        const backupDataStr = JSON.stringify(backupData);

        if (currentDataStr !== backupDataStr) {
            // On capture TOUT le localStorage brut
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
// 🎨 INTERFACE ADMIN (Bouton + Menu)
// ============================================================
function injecterInterfaceAdmin() {
    // 1. CSS (Styles)
    const style = document.createElement('style');
    style.textContent = `
        #btn-admin-logo {
            position: fixed; bottom: 30px; right: 30px;
            width: 60px; height: 60px; border-radius: 50%;
            cursor: pointer; z-index: 99990;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            transition: transform 0.2s;
            border: 2px solid #4F46E5;
            background: #1a1a1a;
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
            font-family: sans-serif;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        
        .admin-btn {
            display: block; width: 100%; padding: 15px; margin: 10px 0;
            border: none; border-radius: 10px; cursor: pointer;
            font-size: 16px; font-weight: bold; transition: background 0.2s;
            color: white;
        }
        
        #btn-export { background: #0ea5e9; }
        #btn-export:hover { background: #0284c7; }
        
        #btn-import { background: #10b981; }
        #btn-import:hover { background: #059669; }
        
        #btn-reset { background: #ef4444; }
        #btn-reset:hover { background: #dc2626; }
        
        #btn-close { background: transparent; color: #94a3b8; margin-top: 10px; }
    `;
    document.head.appendChild(style);

    // 2. Bouton Logo (URL Officielle pour éviter l'erreur de fichier local)
    const img = document.createElement('img');
    img.src = "https://anime-sama.fr/template/images/logo_court.png"; 
    img.id = "btn-admin-logo";
    img.title = "Menu Admin Ultra";
    
    // Clic pour ouvrir le menu
    img.addEventListener('click', () => {
        document.getElementById('admin-modal-overlay').style.display = 'flex';
    });
    document.body.appendChild(img);

    // 3. Fenêtre Modale
    const modalDiv = document.createElement('div');
    modalDiv.id = "admin-modal-overlay";
    modalDiv.innerHTML = `
        <div class="admin-modal">
            <img src="https://anime-sama.fr/template/images/logo_court.png" style="width:50px; margin-bottom:15px;">
            <h2 style="margin:0 0 20px 0;">Gestion des Données</h2>
            
            <button id="btn-export" class="admin-btn">
                📤 Exporter (Copier)
            </button>
            
            <button id="btn-import" class="admin-btn">
                📥 Importer (Coller)
            </button>
            
            <button id="btn-reset" class="admin-btn">
                🗑️ Reset Historique
            </button>

            <button id="btn-close" class="admin-btn">
                Fermer
            </button>
        </div>
    `;
    document.body.appendChild(modalDiv);

    // 4. ATTACHER LES ÉVÉNEMENTS (C'est la clé du succès !)
    
    // Fermer
    document.getElementById('btn-close').addEventListener('click', () => {
        document.getElementById('admin-modal-overlay').style.display = 'none';
    });

    // Exporter
    document.getElementById('btn-export').addEventListener('click', async () => {
        let exportObj = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // On récupère la valeur brute (getItem) pour garder tes formats ["..."]
            exportObj[key] = localStorage.getItem(key);
        }
        
        // On stringify le tout pour avoir un gros JSON
        const jsonFinal = JSON.stringify(exportObj);
        
        await ipcRenderer.invoke('copy-to-clipboard', jsonFinal);
        alert("✅ Données copiées dans le presse-papier !");
        document.getElementById('admin-modal-overlay').style.display = 'none';
    });

    // Importer
    document.getElementById('btn-import').addEventListener('click', async () => {
        // Le prompt peut être capricieux, mais sur Electron ça passe généralement
        // Sinon on pourrait créer un <textarea> dans le modal, mais restons simple
        const input = prompt("Collez vos données JSON ici :");
        if (!input) return;

        try {
            // Nettoyage agressif des guillemets échappés (le classique du copier-coller)
            let cleanJson = input;
            
            // Si le string commence par une guillemet, c'est peut-être un string JSONifié
            if (cleanJson.startsWith('"') && cleanJson.endsWith('"')) {
                cleanJson = JSON.parse(cleanJson);
            }
            
            // On parse le JSON final
            const data = JSON.parse(cleanJson);
            
            // Injection
            for (const key in data) {
                localStorage.setItem(key, data[key]);
            }
            
            // Sauvegarde PC immédiate
            await ipcRenderer.invoke('save-backup', data);
            
            alert("📥 Importation réussie ! Rechargement...");
            window.location.reload();
        } catch (e) {
            alert("❌ Erreur de format JSON !\n" + e.message);
        }
    });

    // Reset
    document.getElementById('btn-reset').addEventListener('click', async () => {
        if(confirm("⚠️ Attention : Cela va TOUT effacer. Continuer ?")) {
            localStorage.clear();
            await ipcRenderer.invoke('clear-backup');
            alert("🧹 Tout est propre !");
            window.location.reload();
        }
    });
}

// --- VISUELS SPLASH SCREEN ---
function showSplashScreen() {
    if (document.getElementById('loading-overlay')) return;
    
    const div = document.createElement('div');
    div.id = 'loading-overlay';
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
