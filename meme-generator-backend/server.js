const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Accroître la limite pour les images base64

// S'assurer que le dossier uploads existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: 'uploads/' });

// Helper pour appeler l'API Llama de Groq avec gestion de fallback
async function callGroqLlama(messages, jsonMode = true) {
  const models = [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile'
  ];

  let lastError;
  for (const model of models) {
    try {
      const payload = {
        model: model,
        messages: messages,
        temperature: 0.7,
      };

      if (jsonMode) {
        payload.response_format = { type: "json_object" };
      }

      console.log(`Tentative d'appel Groq avec le modèle ${model}...`);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      } else {
        const errorText = await response.text();
        console.warn(`Modèle ${model} a échoué: ${response.status} - ${errorText}`);
        lastError = new Error(`Groq API Error (${model}): ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.warn(`Modèle ${model} a généré une erreur:`, err);
      lastError = err;
    }
  }
  throw lastError || new Error("Tous les modèles Groq ont échoué.");
}

// Helper pour appeler la Vision Llama de Groq avec gestion de fallback
async function callGroqVision(base64Image, mimeType, prompt) {
  const models = [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'llama-3.2-11b-vision-preview',
    'llama-3.2-90b-vision-preview'
  ];

  let lastError;
  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      } else {
        const errorText = await response.text();
        console.warn(`Vision modèle ${model} a échoué: ${response.status} - ${errorText}`);
        lastError = new Error(`Groq Vision Error (${model}): ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.warn(`Vision modèle ${model} a généré une erreur:`, err);
      lastError = err;
    }
  }
  throw lastError || new Error("Tous les modèles de vision Groq ont échoué.");
}

// Helper pour transcrire un fichier audio avec Groq Whisper
async function transcribeAudio(filePath, mimeType) {
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: mimeType });
  const formData = new FormData();
  formData.append('file', blob, 'audio.m4a');
  formData.append('model', 'whisper-large-v3-turbo');

  console.log("Envoi du fichier audio à Groq Whisper...");
  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq Whisper Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.text;
}

// 1. Route pour le "Context Reader" (Texte)
app.post('/analyze-context', async (req, res) => {
  try {
    const { text, culture = 'Cameroun' } = req.body;
    if (!text) return res.status(400).json({ error: "Le texte est obligatoire" });

    const systemPrompt = `Tu es un créateur de memes professionnel et hilarant.
    Analyse le texte ou la discussion fourni et propose un texte de meme court et drôle.
    Adapte l'humour en incorporant des références culturelles ou expressions locales du pays sélectionné : ${culture} (ex: expressions populaires, argot local comme le Camfranglais pour le Cameroun, nouchi pour la Côte d'Ivoire).
    Réponds STRICTEMENT sous ce format JSON :
    {
      "memeText": "le texte drôle à afficher sur le meme en lettres capitales",
      "situation": "brève description de la situation ou de l'émotion",
      "culturalExplanation": "brève explication de la référence culturelle ou de l'argot utilisé"
    }`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ];

    const resultText = await callGroqLlama(messages, true);
    res.json(JSON.parse(resultText));
  } catch (error) {
    console.error("Erreur dans /analyze-context:", error);
    res.status(500).json({ error: "Erreur lors de l'analyse du texte par l'IA" });
  }
});

// 2. Route pour le "Voice-to-Meme" (Audio)
app.post('/voice-to-meme', upload.single('audio'), async (req, res) => {
  let audioPath;
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier audio reçu" });
    audioPath = req.file.path;
    const culture = req.body.culture || 'Cameroun';

    // 1. Transcrire l'audio en texte
    const transcription = await transcribeAudio(audioPath, req.file.mimetype || 'audio/mp4');
    console.log("Transcription réussie:", transcription);

    // 2. Générer le meme basé sur la transcription
    const systemPrompt = `Tu es un créateur de memes professionnel et hilarant.
    Analyse cette transcription de note vocale et propose un texte de meme court et drôle adapté au contenu.
    Adapte l'humour selon la culture locale du pays suivant : ${culture}.
    Réponds STRICTEMENT sous ce format JSON :
    {
      "transcript": "la transcription exacte ou légèrement corrigée de ce qui a été dit",
      "memeText": "le texte drôle à afficher sur le meme en lettres capitales",
      "situation": "brève description de l'émotion ou de la situation",
      "culturalExplanation": "brève explication de l'humour ou de la référence culturelle"
    }`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: transcription }
    ];

    const resultText = await callGroqLlama(messages, true);
    
    // Supprimer le fichier audio temporaire
    fs.unlinkSync(audioPath);

    res.json(JSON.parse(resultText));
  } catch (error) {
    console.error("Erreur dans /voice-to-meme:", error);
    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
    res.status(500).json({ error: "Erreur lors du traitement de l'audio par l'IA" });
  }
});

// 3. Route pour le "Status Remixer" (Image)
app.post('/status-remix', async (req, res) => {
  try {
    const { image, mimeType = 'image/jpeg', culture = 'Cameroun' } = req.body;
    if (!image) return res.status(400).json({ error: "L'image en Base64 est obligatoire" });

    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `Tu es un créateur de memes professionnel et hilarant.
    Regarde cette image et propose une punchline courte et très drôle pour en faire un meme.
    Adapte l'humour en incorporant des références culturelles ou expressions locales du pays suivant : ${culture}.
    Réponds STRICTEMENT sous ce format JSON :
    {
      "memeText": "le texte drôle à afficher sur le meme en lettres capitales",
      "situation": "brève description de ce que tu vois et de l'émotion associée",
      "culturalExplanation": "brève explication de l'argot ou de la référence culturelle"
    }`;

    const resultText = await callGroqVision(cleanBase64, mimeType, prompt);
    res.json(JSON.parse(resultText));
  } catch (error) {
    console.error("Erreur dans /status-remix:", error);
    res.status(500).json({ error: "Erreur lors de l'analyse visuelle de l'image" });
  }
});

// 4. Route Bonus pour la Génération d'Images par IA (via Pollinations.ai)
app.post('/generate-meme-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Le prompt est obligatoire" });

    // Nettoyage et encodage du prompt pour l'URL Pollinations.ai
    const encodedPrompt = encodeURIComponent(prompt);
    // Utilisation du modèle de génération Flux (par défaut sur Pollinations)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=1000&nologo=true`;

    res.json({ imageUrl });
  } catch (error) {
    console.error("Erreur dans /generate-meme-image:", error);
    res.status(500).json({ error: "Erreur lors de la génération de l'image" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur Vibrant Meme Engine prêt sur le port ${PORT}`));