Voici le guide détaillé pour le **Jour 3** au format Markdown. Ce volet est le plus technique car il nécessite de gérer des fichiers physiques (Audio) et des permissions Android.

---

# 🎤 Jour 3 : Fonctionnalité "Voice-to-Meme"

L'objectif est de permettre à l'utilisateur d'enregistrer sa voix, d'envoyer l'audio au backend, et d'utiliser Gemini pour transcrire et générer une idée de meme basée sur l'émotion détectée.

---

## 🛠 1. Configuration du Backend (Node.js)

Le backend doit maintenant être capable de recevoir des fichiers via des requêtes `multipart/form-data`.

### Installation des dépendances
Dans ton dossier `meme-generator-backend` :
```bash
npm install multer
```

### Mise à jour de `server.js`
Ajoute la configuration pour **Multer** et la nouvelle route :

```javascript
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configuration du stockage des audios
const upload = multer({ dest: 'uploads/' });

// Route Voice-to-Meme
app.post('/voice-to-meme', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });

    // 1. Lire le fichier audio (Conversion en Base64 pour Gemini)
    const audioPath = req.file.path;
    const audioBase64 = fs.readFileSync(audioPath).toString('base64');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Prompt multimodal (Gemini 1.5 peut analyser l'audio directement !)
    const prompt = "Transcris cet audio et propose une idée de meme courte et drôle basée sur le ton et le contenu. Réponds en JSON : {\"transcript\": \"...\", \"memeText\": \"...\"}";

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: audioBase64, mimeType: "audio/mp3" } } // Ajuste le mimeType si besoin
    ]);

    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Supprimer le fichier temporaire après analyse
    fs.unlinkSync(audioPath);

    res.json(JSON.parse(text));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur analyse audio" });
  }
});
```

---

## 📱 2. Configuration du Mobile (React Native CLI)

### Installation de la bibliothèque d'enregistrement
Dans ton dossier `Monstre` :
```bash
npm install react-native-audio-recorder-player
# Important pour les permissions Android
npm install react-native-permissions
```

### Configuration des Permissions (Android)
Ouvre le fichier `android/app/src/main/AndroidManifest.xml` et ajoute ces lignes :
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### Implémentation dans `App.tsx`
Voici la logique pour enregistrer et envoyer le fichier :

```tsx
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioRecorderPlayer = new AudioRecorderPlayer();

// ... à l'intérieur du composant ...

const startRecording = async () => {
  const result = await audioRecorderPlayer.startRecorder();
  console.log(result);
};

const stopRecording = async () => {
  const result = await audioRecorderPlayer.stopRecorder();
  sendAudioToBackend(result);
};

const sendAudioToBackend = async (uri) => {
  const formData = new FormData();
  formData.append('audio', {
    uri: uri,
    type: 'audio/mp4', // Format par défaut sur Android
    name: 'voice.mp4',
  });

  try {
    setLoading(true);
    const response = await axios.post('http://10.0.2.2:3000/voice-to-meme', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setMemeResult(response.data);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};
```

---

## 📋 Checklist de fin de Jour 3

*   [ ] Le dossier `uploads/` est créé automatiquement dans le backend.
*   [ ] L'application demande l'autorisation d'utiliser le micro au premier clic.
*   [ ] Le fichier audio arrive bien sur le serveur (vérifier le dossier `uploads`).
*   [ ] Gemini renvoie la transcription ET l'idée de meme.
*   [ ] L'interface affiche le texte transcrit pour que l'utilisateur valide ce qu'il a dit.

---

### 💡 Astuce de Débug
Si le téléchargement de l'audio échoue, vérifie que tu utilises bien `FormData` dans ton appel Axios. React Native ne peut pas envoyer de fichiers bruts en JSON, il faut impérativement passer par `multipart/form-data`.

**Prêt à coder la partie Audio ?**