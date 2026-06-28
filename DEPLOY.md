# 🌐 Guide de Déploiement du Backend (Render & Railway)

Pour que votre application mobile puisse communiquer avec le backend depuis n'importe où dans le monde (sans être connecté au même Wi-Fi), vous devez héberger le serveur Express.

Voici comment le déployer sur **Render.com** ou **Railway.app** (deux options gratuites/très abordables).

---

## 📥 Étape 1 : Préparer votre dépôt Git
1. Créez un dépôt sur **GitHub** (public ou privé).
2. Poussez l'intégralité de ce projet (`Monstre_Tp`) sur votre dépôt GitHub.
   * *Note : Les fichiers de configuration sensibles comme le `.env` du backend ne seront pas poussés grâce aux fichiers `.gitignore`.*

---

## 🚀 Option A : Déployer sur Railway.app (Recommandé)

Railway est très rapide et performant. Comme ce projet est un **monorépo** (contenant à la fois l'application mobile et le backend), vous devez spécifier le sous-dossier du backend lors de la configuration.

### Étapes sur Railway :
1. Rendez-vous sur [Railway.app](https://railway.app/) et connectez-vous avec votre compte GitHub.
2. Cliquez sur **New Project** > **Deploy from GitHub repo** et sélectionnez votre dépôt `Monstre_Tp`.
3. Une fois le projet créé, Railway va tenter de déployer le projet depuis la racine et échouera (c'est normal).
4. Cliquez sur le bloc de votre service dans l'interface de Railway, puis allez dans l'onglet **Settings** :
   * Défilez jusqu'à la section **General**.
   * Localisez le paramètre **Root Directory**.
   * Modifiez-le pour mettre : `/meme-generator-backend` *(C'est cette étape clé qui indique à Railway d'exécuter le backend).*
5. Allez ensuite dans l'onglet **Variables** et ajoutez les variables d'environnement suivantes :
   * `GROQ_API_KEY` : `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`
   * `PORT` : `3000` (ou laissez Railway attribuer un port automatique).
6. Railway relancera automatiquement le déploiement avec les bons paramètres et compilera avec succès !
7. Dans l'onglet **Settings**, sous **Networking**, cliquez sur **Generate Domain** pour obtenir l'URL publique de votre backend (ex : `https://meme-generator-backend-production.up.railway.app`).

---

## 🚀 Option B : Déployer sur Render.com

1. Rendez-vous sur [Render.com](https://render.com/) et connectez-vous avec votre compte GitHub.
2. Sur le tableau de bord Render, cliquez sur le bouton **New +** puis sélectionnez **Web Service**.
3. Associez votre dépôt GitHub contenant le projet.
4. Remplissez les paramètres de configuration comme suit :
   * **Name** : `vibrant-meme-engine-backend`
   * **Root Directory** : `meme-generator-backend` *(Indique à Render de se placer dans le sous-dossier).*
   * **Runtime** : `Node`
   * **Build Command** : `npm install`
   * **Start Command** : `node server.js`
   * **Instance Type** : `Free`
5. Cliquez sur le bouton **Advanced** en bas, puis cliquez sur **Add Environment Variable** :
   * **Key** : `GROQ_API_KEY`, **Value** : `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`
6. Cliquez sur **Create Web Service**. Une fois actif, récupérez l'URL publique fournie en haut à gauche (ex : `https://vibrant-meme-engine-backend.onrender.com`).

---

## 📱 Étape 3 : Relier l'Application Mobile

Une fois votre backend en ligne (sur Railway ou Render) :

1. Ouvrez le fichier de configuration [config.ts](file:///c:/Users/Nestor%20Corneille/Desktop/L2/S2/ICT202/Monstre_Tp/Monstre/src/config.ts) dans l'application mobile.
2. Modifiez la constante `API_URL` en remplaçant l'adresse locale par l'URL publique de votre serveur déployé (par exemple celle de Railway) :
   ```typescript
   export const API_URL = 'https://votre-service.up.railway.app';
   ```
3. Poussez ce changement sur votre dépôt GitHub. Le workflow **GitHub Actions** compilera automatiquement votre APK Android final avec la bonne URL de production !
