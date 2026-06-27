# 🎭 Vibrant Meme Engine : Générateur de Memes Multimodal
**Cours : ICT202 G2** | **Monstre Projet de Développement Mobile**

Cette application mobile native (**React Native CLI**) et son API Gateway (**Express.js**) permettent d'analyser le contexte d'une discussion ou d'un média (texte, audio, image) pour générer automatiquement des punchlines de memes humoristiques adaptées à la culture locale (Cameroun, Côte d'Ivoire, France, etc.) et de les éditer/partager.

---

## 🛠 Stack Technique

*   **Frontend Mobile** : React Native CLI (Android natif)
*   **Backend (API Gateway)** : Node.js / Express.js
*   **IA de Texte & Vision (Multimodal)** : Groq API — Modèle **Llama 4 Scout** (`meta-llama/llama-4-scout-17b-16e-instruct`) avec fallback automatique vers Llama 3.3 et 3.1
*   **Speech-to-Text (Transcription Audio)** : Groq API — Modèle **Whisper** (`whisper-large-v3-turbo`)
*   **Intégration WhatsApp (Entrante)** : `react-native-share-menu` (Android Intents de Partage)
*   **Partage Sortant** : `react-native-share`
*   **Enregistrement Audio** : `react-native-audio-recorder-player`
*   **Sélection d'Images** : `react-native-image-picker`
*   **Capture de Rendu** : `react-native-view-shot`

---

## 📱 Fonctionnalités Principales (Core)

1.  **Context Reader (Texte)** : L'utilisateur colle ou tape une discussion. L'IA (Llama 4 Scout) analyse la situation et l'émotion, et génère une punchline humoristique ainsi qu'une explication socioculturelle de la blague selon la région choisie.
2.  **Voice-to-Meme (Audio)** : L'utilisateur enregistre une note vocale. Le backend transcrit l'audio via Whisper, puis Llama 4 Scout suggère un meme adapté au ton de l'audio.
3.  **Status Remixer (Image & Éditeur)** : L'utilisateur charge une image depuis sa galerie. L'IA utilise la vision pour l'analyser et proposer un meme. L'utilisateur peut éditer la taille, la couleur et le positionnement du texte sur le canevas, sauvegarder l'image finale ou la partager directement.
4.  **WhatsApp Share Intent (Partage WhatsApp)** : L'application est enregistrée dans le système Android pour recevoir directement du texte ou des images partagées depuis WhatsApp. Le fait de partager un message WhatsApp ouvre l'application avec le texte ou l'image pré-rempli.

---

## ⚙️ Guide d'Installation et Lancement

### Préréglages
Assurez-vous que l'**Android SDK** et **Java 17** sont correctement installés et configurés dans vos variables d'environnement (`ANDROID_HOME`).

### 1. Lancement du Backend Express
1.  Allez dans le dossier du serveur :
    ```bash
    cd meme-generator-backend
    ```
2.  Installez les dépendances :
    ```bash
    npm install
    ```
3.  Configurez vos clés d'API. Créez un fichier nommé `.env` à la racine de `meme-generator-backend/` :
    ```env
    PORT=3000
    GROQ_API_KEY=gsk_votre_cle_api_groq_officielle
    ```
4.  Lancez le serveur en mode développement :
    ```bash
    npm run dev
    ```
    Le serveur écoutera sur le port `3000`.

### 2. Lancement du Frontend Mobile React Native
1.  Allez dans le dossier mobile :
    ```bash
    cd Monstre
    ```
2.  Installez les modules Node :
    ```bash
    npm install
    ```
3.  Démarrez le serveur de développement (Metro Bundler) :
    ```bash
    npm run start
    ```
4.  Dans un autre terminal, lancez le build de l'application sur votre émulateur ou appareil Android connecté :
    ```bash
    npm run android
    ```

---

## 💡 Notes de Développement
*   **IP de l'émulateur** : L'application mobile contacte le backend hôte via l'adresse `http://10.0.2.2:3000` (adresse de rebouclage Android).
*   **Permissions requises** : L'application demandera automatiquement les permissions `Enregistrement Audio (Microphone)` et `Accès Galerie (Photos)` lors de l'ouverture des onglets correspondants.