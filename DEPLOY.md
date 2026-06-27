# 🌐 Guide de Déploiement du Backend sur Render.com

Pour que votre application mobile puisse communiquer avec le backend depuis n'importe où dans le monde (sans être connecté au même Wi-Fi), vous devez héberger le serveur Express. 

La solution la plus simple, rapide et **100% gratuite** est **Render.com**. Voici les étapes détaillées pour le faire :

---

## 📥 Étape 1 : Préparer votre dépôt Git
1. Créez un dépôt sur **GitHub** (public ou privé).
2. Poussez l'intégralité de ce projet (`Monstre_Tp`) sur votre dépôt GitHub.
   * *Note : Les fichiers de configuration sensibles comme le `.env` du backend ne seront pas poussés grâce aux fichiers `.gitignore` que nous avons mis en place.*

---

## 🚀 Étape 2 : Déployer sur Render
1. Rendez-vous sur [Render.com](https://render.com/) et connectez-vous avec votre compte **GitHub**.
2. Sur le tableau de bord Render, cliquez sur le bouton **New +** puis sélectionnez **Web Service**.
3. Associez votre dépôt GitHub contenant le projet.
4. Remplissez les paramètres de configuration comme suit :
   * **Name** : `vibrant-meme-engine-backend` (ou le nom de votre choix)
   * **Root Directory** : `meme-generator-backend` *(Très important ! Cela indique à Render de se placer dans le sous-dossier du backend).*
   * **Runtime** : `Node`
   * **Build Command** : `npm install`
   * **Start Command** : `node server.js`
   * **Instance Type** : `Free` (Gratuit)

5. Cliquez sur le bouton **Advanced** en bas, puis cliquez sur **Add Environment Variable** :
   * **Key** : `GROQ_API_KEY`
   * **Value** : `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`
   * *(Optionnel) **Key** : `PORT`, **Value** : `10000`*

6. Cliquez sur **Create Web Service**. 
   * Render va compiler et déployer votre serveur en quelques minutes. Une fois actif, Render affichera une URL publique en haut à gauche (ex : `https://vibrant-meme-engine-backend.onrender.com`).

---

## 📱 Étape 3 : Relier l'Application Mobile
Maintenant que votre backend est en ligne, vous devez indiquer au frontend l'adresse de production :

1. Ouvrez le fichier de configuration [config.ts](file:///c:/Users/Nestor%20Corneille/Desktop/L2/S2/ICT202/Monstre_Tp/Monstre/src/config.ts) dans l'application mobile.
2. Modifiez la constante `API_URL` en remplaçant l'adresse locale par l'URL publique fournie par Render :
   ```typescript
   // Remplacez par votre URL Render
   export const API_URL = 'https://vibrant-meme-engine-backend.onrender.com';
   ```
3. Poussez ce changement sur GitHub pour que le **GitHub Action** génère automatiquement votre APK Release avec la bonne URL de production !
