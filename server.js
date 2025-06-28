// server.js

import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const port = 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    // AHORA RECIBIMOS EL HISTORIAL COMPLETO
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    // Construimos los mensajes para la API, incluyendo el historial
    const messages = [
      { role: "system", content: "Eres Aura, una IA avanzada, servicial y con un toque de sabiduría. Respondes de forma concisa pero profunda." },
      // Esparcimos el historial anterior aquí
      ...history, 
      // Y añadimos el nuevo mensaje del usuario
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error('Error en la API de OpenAI:', error);
    res.status(500).json({ error: 'Hubo un error al procesar tu solicitud en el servidor.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor Aura Engine escuchando en http://localhost:${port}`);
});