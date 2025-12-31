# **Anime-Sama App (Desktop)**

Bienvenue sur le dépôt officiel de l'application fan-made **Anime-Sama**. Ce projet vise à offrir une expérience de visionnage optimisée, fluide et sans publicité, en contournant les limitations des navigateurs standards. Disponible sur **Windows, macOS, Iphone et Android**.

## **🌟 Fonctionnalités Clés**

### **🛡️ Système Anti-Pub Avancé ("Defuser")**

L'application intègre un moteur de blocage intelligent conçu spécifiquement pour les lecteurs vidéo (Sibnet, Sendvid, etc.) :

* **Neutralisation des Popups :** Cliquez sur "Play" sans déclencher de fenêtres publicitaires. Le système désamorce les tentatives d'ouverture en arrière-plan.  
* **Filtrage Strict :** Seuls les liens vers des domaines de confiance (Discord, PayPal, Twitter) sont autorisés à s'ouvrir dans votre navigateur externe. Tout le reste est bloqué.  
* **Nettoyage DOM :** Suppression proactive des iframes et éléments superposés invisibles.

### **💾 Synchronisation Cross-Platform**

Un système de sauvegarde unifié pour ne jamais perdre votre progression :

* **Stockage Local Sécurisé :** Vos données (historique, épisodes vus, favoris) sont enregistrées localement sur votre appareil.  
* **Compatibilité Totale :** Le format de données JSON est identique entre les versions PC et Mobile. Exportez votre progression depuis votre ordinateur et importez-la sur votre téléphone en quelques secondes.

### **🎨 Interface Immersive & Authentique**

* **Design Unifié :** L'interface d'administration a été méticuleusement recréée pour s'intégrer parfaitement à la charte graphique du site (Thème Sombre, Cyan \#0ea5e9, Police Montserrat).  
* **Mode Cinéma (Mobile) :** Masquage automatique des barres système pour une immersion totale.  
* **Navigation Intelligente :** Redirection automatique via le domaine boussole anime-sama.pw pour garantir l'accès au site, même en cas de changement d'URL.

## **📥 Installation**

### **💻 Sur Ordinateur (Windows / macOS)**

1. Rendez-vous dans la section [**Releases**](https://www.google.com/search?q=https://github.com/Tortoche/Anime-Sama-App/releases).  
2. Téléchargez l'installateur correspondant à votre système :  
   * **Windows :** Anime.Sama.Setup.x.x.x.exe  
   * **macOS :** Anime.Sama.x.x.x.dmg  
3. Lancez l'installation. (Sur Windows, ignorez l'avertissement SmartScreen en cliquant sur "Informations complémentaires" \> "Exécuter quand même").

### **📱 Sur Android**

1. Téléchargez le fichier .apk depuis les **Releases**.  
2. Ouvrez le fichier sur votre téléphone.  
3. Autorisez l'installation depuis des sources inconnues si demandé.

## **⚙️ Gestion des Données (Menu Admin)**

Un bouton flottant (logo Anime-Sama) apparaît sur les pages **Profil** et **Planning**. Il permet d'accéder au panneau d'administration :

* **🗑️ Reset Historique :** Efface intégralement les données locales et la sauvegarde persistante.  
* **📤 Exporter (Copier) :** Génère un code JSON de votre progression et le copie dans le presse-papier.  
* **📥 Importer (Coller) :** Permet de coller le code JSON pour restaurer votre progression (depuis une sauvegarde PC ou mobile).

## **🛠️ Développement & Compilation**

Ce projet est open-source. Vous pouvez contribuer ou compiler votre propre version.

### **Prérequis**

* **PC :** Node.js, npm.  
* **Android :** Android Studio, JDK 17\.

### **Commandes (Version PC/Electron)**

\# Cloner le dépôt  
git clone https://github.com/Tortoche/Anime-Sama-App.git

\# Installer les dépendances  
npm install

\# Lancer en mode développement  
npm start

\# Créer les exécutables (Build)  
npm run dist

## **⚠️ Avertissement Légal**

Ce logiciel est une réalisation **personnelle et non officielle** créée par un passionné.  
Je ne suis en aucun cas affilié à l'équipe d'administration d'Anime-Sama. L'application n'héberge aucun contenu vidéo et agit exclusivement comme un navigateur web spécialisé et sécurisé.  
L'utilisation de cette application se fait sous votre entière responsabilité.  
*Profitez de vos animes dans les meilleures conditions.*
