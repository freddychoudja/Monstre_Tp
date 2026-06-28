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

// Helper function to load all cultures dynamically [ignoring loop detection]
function getCulturesData() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  const files = fs.readdirSync(dataDir);
  const cultures = {};

  files.forEach(file => {
    if (file.endsWith('.js')) {
      try {
        // Clear require cache to allow dynamic reloading in dev
        const filePath = path.join(dataDir, file);
        delete require.cache[require.resolve(filePath)];
        const cultureData = require(filePath);
        if (cultureData.name) {
          cultures[cultureData.name.toUpperCase()] = cultureData;
        }
      } catch (err) {
        console.error(`Erreur de chargement du fichier culture ${file}:`, err);
      }
    }
  });
  return cultures;
}

// Helper function to build the user-defined system prompt [ignoring loop detection]
function getSystemPrompt(culture) {
  const cultures = getCulturesData();
  let cultureRules = "";

  Object.keys(cultures).forEach(key => {
    const c = cultures[key];
    const exprList = c.expressions ? c.expressions.map(e => `• ${e}`).join('\n') : "";
    cultureRules += `\n- ${c.name}\n${c.instructions || ""}\nExemples d'expressions :\n${exprList}\n-----------------------------------\n`;
  });

  return `Tu es un créateur de memes viral, un expert en humour Internet et en culture populaire francophone.

Ta mission est d'analyser le texte, la conversation ou la situation fournie puis de créer un texte de meme extrêmement drôle, naturel et partageable.

IMPORTANT :
Le meme doit donner l'impression qu'il a été écrit par un véritable internaute du pays sélectionné, et non par une IA.

Pays / Culture sélectionné(e) : ${culture}

Voici les règles spécifiques par région disponibles :
${cultureRules}

Respecte obligatoirement les règles suivantes :
1. Adapte totalement ton vocabulaire au pays sélectionné en te basant sur les règles ci-dessus.
2. Le texte doit être court. Maximum : 2 lignes. Jamais un paragraphe.
3. Le texte doit ressembler à un vrai meme partageable sur les réseaux sociaux.
4. L'humour doit être basé sur l'exagération, l'ironie, le second degré ou l'autodérision.
5. Le texte doit être entièrement écrit EN MAJUSCULES.
6. Le texte doit être immédiatement compréhensible.
7. Si le contexte ne permet pas de faire une blague, invente une situation drôle cohérente.
8. L'humour ne doit jamais être haineux, discriminatoire, insultant, politique ou violent.

Réponds STRICTEMENT avec ce JSON valide :
{
  "memeText": "TEXTE DU MEME EN MAJUSCULES",
  "situation": "Description très courte de la scène représentée.",
  "culturalExplanation": "Explique brièvement les expressions locales ou références culturelles utilisées.",
  "imagePrompt": "A descriptive English prompt (no characters text inside image) to generate a funny background image for this meme (e.g. 'a confused cat in a classroom, cartoon style')",
  "stickerPrompt": "A single word or very short English phrase for a transparent sticker GIF (e.g. 'confused cat')"
}

Ne renvoie AUCUN texte supplémentaire.
Ne mets AUCUN markdown.
Ne mets AUCUN commentaire.
Retourne uniquement le JSON.`;
}

// 1. Route pour le "Context Reader" (Texte)
app.post('/analyze-context', async (req, res) => {
  try {
    const { text, culture = 'Cameroun' } = req.body;
    if (!text) return res.status(400).json({ error: "Le texte est obligatoire" });

    const systemPrompt = getSystemPrompt(culture);
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
    
    Respecte également toutes les règles suivantes pour le contenu :
    - Texte court de 2 lignes maximum
    - En MAJUSCULES uniquement
    - Culture : ${culture}
    
    Réponds STRICTEMENT avec ce JSON valide :
    {
      "transcript": "la transcription exacte ou légèrement corrigée de ce qui a été dit",
      "memeText": "TEXTE DU MEME EN MAJUSCULES",
      "situation": "Description très courte de la scène représentée.",
      "culturalExplanation": "Explique brièvement les expressions locales ou références culturelles utilisées.",
      "imagePrompt": "A descriptive English prompt (no characters text inside image) to generate a funny background image for this meme (e.g. 'a confused cat in a classroom, cartoon style')",
      "stickerPrompt": "A single word or very short English phrase for a transparent sticker GIF (e.g. 'confused cat')"
    }
    
    Ne renvoie AUCUN texte supplémentaire, markdown ou commentaires.`;

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
      "memeText": "TEXTE DU MEME EN MAJUSCULES",
      "situation": "Description très courte de la scène représentée.",
      "culturalExplanation": "Explique brièvement les expressions locales ou références culturelles utilisées.",
      "imagePrompt": "A descriptive English prompt (no characters text inside image) to generate a funny background image for this meme (e.g. 'a confused cat in a classroom, cartoon style')",
      "stickerPrompt": "A single word or very short English phrase for a transparent sticker GIF (e.g. 'confused cat')"
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

    console.log("Pré-génération de l'image sur Pollinations.ai...");
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Erreur Pollinations: ${response.status}`);
    }

    res.json({ imageUrl });
  } catch (error) {
    console.error("Erreur dans /generate-meme-image:", error);
    res.status(500).json({ error: "Erreur lors de la génération de l'image" });
  }
});

// 5. Route Giphy Stickers pour récupérer des stickers animés transparents
app.get('/giphy-stickers', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Le paramètre q (requête de recherche) est requis" });

    // Utilisation de la clé publique Giphy Beta pour le développement
    const GIPHY_API_KEY = process.env.GIPHY_API_KEY || 'dc6zaTOxFJmzC';
    const encodedQuery = encodeURIComponent(q);
    const url = `https://api.giphy.com/v1/stickers/search?api_key=${GIPHY_API_KEY}&q=${encodedQuery}&limit=12&rating=g`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur Giphy: ${response.status}`);
    }

    const data = await response.json();
    const stickers = data.data.map(item => ({
      id: item.id,
      title: item.title,
      url: item.images.fixed_height.url, // URL du GIF animé transparent
      width: item.images.fixed_height.width,
      height: item.images.fixed_height.height
    }));

    res.json(stickers);
  } catch (error) {
    console.error("Erreur dans /giphy-stickers:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des stickers" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur Vibrant Meme Engine prêt sur le port ${PORT}`));