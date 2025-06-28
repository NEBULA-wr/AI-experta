// server.js

import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'; // <-- Importación de CORS

// --- Carga de variables de entorno ---
dotenv.config();

// --- Inicialización de la App ---
const app = express();
// Render te proporcionará un puerto a través de process.env.PORT
const port = process.env.PORT || 3000;

// --- Configuración de CORS (¡MUY IMPORTANTE PARA EL DESPLIEGUE!) ---
// Esto permite que tu frontend en GitHub Pages hable con este servidor.
app.use(cors());

// --- Inicialización de OpenAI ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Configuración para servir archivos estáticos (Frontend) ---
// Esta es la forma robusta y moderna que funciona en Render
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// --- Middleware para entender JSON ---
app.use(express.json());

// --- Ruta principal de la API ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    const messages = [
      { role: "system", content: "Eres Nexus, una IA avanzada, servicial y con un toque de sabiduría. Respondes de forma concisa pero profunda." },
      ...(history || []), // Asegurarse de que history no sea undefined
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

// --- Iniciar el Servidor ---
app.listen(port, () => {
  console.log(`Servidor Nexus escuchando en el puerto ${port}`);
});