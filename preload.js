const { ipcRenderer } = require('electron');

const LOGO_URL = "https://raw.githubusercontent.com/Anime-Sama/IMG/img/autres/logo.png";

window.addEventListener('DOMContentLoaded', async () => {
    console.log("🌮 Preload PC chargé...");
    
    const currentUrl = window.location.href;

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
    else if (!currentUrl.includes("google")) {
        // Lancer la protection maximale
        activateAdShield();

        setTimeout(gererSyncAuto, 2500);
        
        if (currentUrl.includes("/profil") || currentUrl.includes("/planning")) {
            injecterInterfaceAdmin();
        }
    }
});

// --- 🛡️ AD SHIELD (PROTECTION AVANCÉE) ---
function activateAdShield() {
    console.log("🛡️ Bouclier Anti-Pub activé");

    // 1. CSS Anti-Pub (Masque les bannières visibles)
    const style = document.createElement('style');
    style.textContent = `
        #ads, .ads, .ad-banner, [id^='ad-'], [class^='ad-'],
        iframe[src*='google'], iframe[src*='doubleclick'], iframe[src*='outbrain'],
        .popup-container, .popover, .floating-ad, div[id*='taboola'],
        a[href*='betclic'], a[href*='winamax'], div[class*='monitor']
        { display: none !important; pointer-events: none !important; height: 0 !important; width: 0 !important; }
    `;
    document.head.appendChild(style);

    // 2. Nettoyeur DOM (Supprime les éléments intrusifs)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    // Supprimer iframes pubs
                    if (node.tagName === 'IFRAME') {
                        const src = (node.src || '').toLowerCase();
                        if (src.includes('google') || src.includes('adservice') || src.includes('analytics')) {
                            node.remove();
                        }
                    }
                    // Supprimer overlays invisibles qui capturent le clic
                    if (getComputedStyle(node).position === 'absolute' && getComputedStyle(node).zIndex > 9000) {
                        // On protège nos propres éléments (Admin, Splash)
                        if (node.id !== 'admin-modal-overlay' && node.id !== 'btn-admin-logo' && node.id !== 'loading-overlay') {
                            node.style.display = 'none';
                            node.style.pointerEvents = 'none';
                        }
                    }
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 3. NEUTRALISATION DE window.open (Le Désamorceur)
    // C'est ce que les lecteurs vidéo utilisent pour ouvrir les pubs en arrière-plan.
    // On remplace la fonction par une coquille vide qui renvoie null.
    // Le lecteur pense avoir ouvert sa pub, mais rien ne se passe.
    window.open = function(url, target, features) {
        console.log('🚫 Popup JS désamorcée :', url);
        return null; 
    };

    // 4. INTERCEPTEUR DE CLICS (Le Gardien)
    // Empêche les liens _blank malveillants de s'ouvrir
    document.addEventListener('click', function(e) {
        // Remonter jusqu'au lien <a> si on clique sur une image/div dedans
        const link = e.target.closest('a');
        
        if (link && link.target === '_blank') {
            const href = link.href.toLowerCase();
            
            // Liste blanche stricte pour les liens qui ouvrent des onglets
            const safeDomains = ['anime-sama', 'discord', 'paypal', 'twitter', 'instagram'];
            const isSafe = safeDomains.some(d => href.includes(d));

            // Si le lien n'est pas sûr, on tue l'événement
            if (!isSafe) {
                e.preventDefault();
                e.stopPropagation();
                console.log("🚫 Clic pub bloqué vers :", href);
            }
        }
    }, true); // 'true' pour capturer l'événement avant tout le monde (Capturing phase)
}

// --- SYNC AUTO ---
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

// --- INTERFACE ADMIN (Design Pro) ---
function injecterInterfaceAdmin() {
    if (document.getElementById('btn-admin-logo')) return;

    const fontLink = document.createElement('link');
    fontLink.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    const style = document.createElement('style');
    style.textContent = `
        #btn-admin-logo {
            position: fixed; top: 100px; right: 20px;
            width: 55px; height: 55px; cursor: pointer; z-index: 999990;
            transition: transform 0.3s ease;
            filter: drop-shadow(0 0 10px rgba(14, 165, 233, 0.5));
            border-radius: 50%; border: 2px solid #0ea5e9;
            object-fit: cover;
        }
        #btn-admin-logo:hover { transform: scale(1.1); }

        #admin-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.85);
            z-index: 999999;
            display: none; justify-content: center; align-items: center;
            font-family: 'Montserrat', sans-serif;
        }

        .admin-card {
            background-color: #050b14;
            width: 90%; max-width: 450px;
            padding: 30px;
            border-radius: 20px;
            border: 1px solid #1c2533;
            display: flex; flex-direction: column; align-items: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            position: relative;
        }

        .logo-container { width: 100%; display: flex; justify-content: flex-start; margin-bottom: 20px; }
        .admin-logo { width: 50px; height: auto; }

        .admin-title {
            color: white; font-size: 16px; text-transform: uppercase;
            margin-bottom: 25px; font-weight: 600; letter-spacing: 0.5px;
        }

        .btn-option {
            width: 100%; padding: 18px; margin-bottom: 12px;
            background-color: transparent; border-radius: 10px;
            color: white; font-size: 14px; font-weight: 800;
            text-transform: uppercase; cursor: pointer; text-align: center;
            transition: 0.2s;
        }

        .btn-red {
            border: 2px solid #3d1a20;
            box-shadow: inset 0 0 10px rgba(61, 26, 32, 0.5);
        }
        .btn-red:hover { border-color: #ff4444; }

        .btn-blue-outline {
            border: 2px solid #0f2336;
            box-shadow: inset 0 0 10px rgba(15, 35, 54, 0.5);
        }
        .btn-blue-outline:hover { border-color: #1a3c5e; }

        .admin-divider {
            width: 100%; height: 1px; background-color: #1c2533; margin: 15px 0;
        }

        #importArea {
            width: 100%; height: 120px;
            background-color: #03060a;
            border: 1px solid #1c2533; border-radius: 10px;
            color: #a0a0a0; padding: 15px;
            font-family: 'Courier New', monospace; font-size: 12px;
            resize: none; outline: none; margin-bottom: 20px;
        }
        #importArea::placeholder { color: #555; }

        .btn-confirm {
            width: 100%; padding: 18px;
            background-color: #0ea5e9;
            color: #000;
            border: none; border-radius: 8px;
            font-size: 15px; font-weight: 900;
            text-transform: uppercase; cursor: pointer; margin-bottom: 25px;
        }
        .btn-confirm:hover { background-color: #38bdf8; }

        .btn-close {
            background: none; border: none; color: #64748b;
            font-weight: 900; text-transform: uppercase;
            font-size: 13px; cursor: pointer;
        }
        .btn-close:hover { color: white; }
    `;
    document.head.appendChild(style);

    const img = document.createElement('img');
    img.src = LOGO_URL;
    img.id = "btn-admin-logo";
    img.onclick = () => document.getElementById('admin-modal-overlay').style.display = 'flex';
    document.body.appendChild(img);

    const modalDiv = document.createElement('div');
    modalDiv.id = "admin-modal-overlay";
    modalDiv.innerHTML = `
        <div class="admin-card">
            <div class="logo-container">
                <img src="${LOGO_URL}" class="admin-logo">
            </div>

            <h1 class="admin-title">Options Administrateur</h1>

            <button id="btn-reset" class="btn-option btn-red">
                1. Vider l'historique (Reset)
            </button>

            <button id="btn-export" class="btn-option btn-blue-outline">
                2. Exporter la progression <br>(Copier)
            </button>

            <button id="btn-import-toggle" class="btn-option btn-blue-outline">
                3. Importer des données (Coller)
            </button>

            <div class="admin-divider"></div>

            <textarea id="importArea" placeholder="Collez votre JSON ici..."></textarea>

            <button id="btn-confirm-import" class="btn-confirm">
                Confirmer l'importation
            </button>

            <button id="btn-close" class="btn-close">
                Fermer
            </button>
        </div>
    `;
    document.body.appendChild(modalDiv);

    // EVENEMENTS
    document.getElementById('btn-close').onclick = () => {
        document.getElementById('admin-modal-overlay').style.display = 'none';
    };

    document.getElementById('btn-reset').onclick = async () => {
        if (confirm("⚠ WARNING : Tout effacer ?")) {
            localStorage.clear();
            await ipcRenderer.invoke('clear-backup');
            location.reload();
        }
    };

    document.getElementById('btn-export').onclick = async () => {
        let data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        await ipcRenderer.invoke('copy-to-clipboard', JSON.stringify(data));
        alert("✅ Progression copiée dans le presse-papier !");
    };

    document.getElementById('btn-import-toggle').onclick = () => {
        document.getElementById('importArea').focus();
    };

    document.getElementById('btn-confirm-import').onclick = async () => {
        const raw = document.getElementById('importArea').value.trim();
        if (!raw) return;

        try {
            const data = JSON.parse(raw);
            localStorage.clear();
            for (const key in data) {
                localStorage.setItem(key, data[key]);
            }
            await ipcRenderer.invoke('save-backup', data);
            alert("📥 Importation réussie !");
            location.reload();
        } catch (e) {
            alert("❌ Erreur de format !");
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
