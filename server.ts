/**
 * Servidor Express para la plataforma de inglés (HU07 - Yunior).
 *
 * - En desarrollo monta Vite en modo middleware y expone /api/tts.
 * - En producción sirve el contenido de `dist`.
 * - El endpoint /api/tts usa Google Translate TTS como proveedor principal y
 *   el host alternativo translate.googleapis.com como respaldo. Si ambos
 *   fallan, responde 503 para que el cliente use la voz del navegador
 *   (SpeechSynthesis).
 */

import path from "node:path";
import express from "express";
import rateLimit from "express-rate-limit";

const PORT = Number(process.env.PORT ?? 5173);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const MAX_TEXT_LENGTH = 200;
const TTS_TIMEOUT_MS = 8_000;

const app = express();

// Límite de solicitudes para evitar abuso del servicio de voz.
const ttsLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error:
      "Demasiadas solicitudes de voz. Esperá un minuto antes de intentar de nuevo.",
  },
});

/** Proveedor principal: Google Translate TTS. */
async function fetchGoogleTts(text: string): Promise<Buffer | null> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(
    text,
  )}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://translate.google.com/",
    },
    signal: AbortSignal.timeout(TTS_TIMEOUT_MS),
  });

  if (!response.ok) {
    return null;
  }

  return Buffer.from(await response.arrayBuffer());
}

/**
 * Respaldo: mismo servicio de Google pero por el host de API y otro cliente.
 * Si el host principal está bloqueado o cambia, esta ruta suele seguir
 * respondiendo con el mismo audio.
 */
async function fetchGoogleBackupTts(text: string): Promise<Buffer | null> {
  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=en&client=gtx&q=${encodeURIComponent(
    text,
  )}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://translate.google.com/",
    },
    signal: AbortSignal.timeout(TTS_TIMEOUT_MS),
  });

  if (!response.ok) {
    return null;
  }

  return Buffer.from(await response.arrayBuffer());
}

const TTS_PROVIDERS: Array<{
  name: string;
  load: (text: string) => Promise<Buffer | null>;
}> = [
  { name: "google", load: fetchGoogleTts },
  { name: "google-backup", load: fetchGoogleBackupTts },
];

app.get("/api/tts/health", (_req, res) => {
  res.json({
    ok: true,
    service: "tts",
    providers: TTS_PROVIDERS.map((provider) => provider.name),
  });
});

app.get("/api/tts", ttsLimiter, async (req, res) => {
  const text = typeof req.query.text === "string" ? req.query.text.trim() : "";

  if (!text) {
    res.status(400).json({ error: "El parámetro text es obligatorio." });
    return;
  }

  if (text.length > MAX_TEXT_LENGTH) {
    res.status(400).json({
      error: `El texto no puede superar los ${MAX_TEXT_LENGTH} caracteres.`,
    });
    return;
  }

  for (const provider of TTS_PROVIDERS) {
    try {
      const audio = await provider.load(text);
      if (!audio || audio.length === 0) {
        continue;
      }

      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        "Cache-Control": "public, max-age=86400",
        "X-TTS-Provider": provider.name,
      });
      res.send(audio);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[tts] El proveedor "${provider.name}" falló: ${message}`);
    }
  }

  res.status(503).json({
    error:
      "El servicio de voz no está disponible. Se usará la voz del navegador.",
  });
});

async function configureFrontend(): Promise<void> {
  if (IS_PRODUCTION) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    return;
  }

  // Vite en modo middleware: sirve la SPA y el HMR sobre este mismo servidor.
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

async function start(): Promise<void> {
  await configureFrontend();

  app.listen(PORT, () => {
    const mode = IS_PRODUCTION ? "producción" : "desarrollo";
    console.log(`Servidor TTS + app en http://localhost:${PORT} (${mode})`);
  });
}

void start().catch((error: unknown) => {
  console.error("No se pudo iniciar el servidor:", error);
  process.exit(1);
});
