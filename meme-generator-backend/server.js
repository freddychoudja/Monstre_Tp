const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Route pour le "Context Reader"
app.post('/analyze-context', async (req, res) => {
  try {
    const { text } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Tu es un créateur de memes professionnel.
    Analyse cette discussion et propose un texte court et très drôle pour en faire un meme.
    Réponds uniquement sous ce format JSON :
    {"memeText": "le texte drôle", "situation": "brève description de l'émotion"}

    Discussion : ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonResponse = JSON.parse(response.text());

    res.json(jsonResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "L'IA a eu un bug" });
  }
});

app.listen(3000, () => console.log("Backend IA prêt sur le port 3000"));