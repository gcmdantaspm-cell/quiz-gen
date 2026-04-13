import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import cors from "cors";
import multer from "multer";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const upload = multer({ storage: multer.memoryStorage() });

  // Initialize Gemini
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API Routes
  app.post("/api/generate-questions", upload.single("file"), async (req, res) => {
    try {
      let text = req.body.text || "";

      if (req.file) {
        const data = await pdf(req.file.buffer);
        text = data.text;
      }

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: "Nenhum texto ou PDF fornecido." });
      }

      const prompt = `
        Com base no seguinte texto, gere 5 questões de múltipla escolha.
        Cada questão deve ter 4 opções (A, B, C, D) e indicar a resposta correta.
        Retorne em formato JSON.

        Texto:
        ${text.substring(0, 10000)} // Limit text to avoid token limits
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.OBJECT,
                      properties: {
                        A: { type: Type.STRING },
                        B: { type: Type.STRING },
                        C: { type: Type.STRING },
                        D: { type: Type.STRING },
                      },
                    },
                    answer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ["question", "options", "answer"],
                },
              },
            },
          },
        },
      });

      const result = JSON.parse(response.text);
      res.json(result);
    } catch (error) {
      console.error("Erro ao gerar questões:", error);
      res.status(500).json({ error: "Erro interno ao processar sua solicitação." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
