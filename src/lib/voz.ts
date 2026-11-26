/**
 * Minimal Web Speech API wrapper (HU08 - Dayvis).
 *
 * The API is experimental and only exposed behind the `webkit` prefix in
 * Chromium-based browsers, so it is typed locally instead of relying on a DOM
 * lib that does not ship it. Pure functions: no React, no DOM access at import
 * time, so the module can be imported during a server render.
 */

export interface ResultadoAlternativaVoz {
  transcript: string;
  confidence: number;
}

export interface ResultadoVoz {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: ResultadoAlternativaVoz;
}

export interface ListaResultadosVoz {
  readonly length: number;
  [index: number]: ResultadoVoz;
}

export interface EventoResultadoVoz extends Event {
  results: ListaResultadosVoz;
}

export interface EventoErrorVoz extends Event {
  error: string;
  message: string;
}

export interface ReconocimientoVoz extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: EventoResultadoVoz) => void) | null;
  onerror: ((event: EventoErrorVoz) => void) | null;
  onend: (() => void) | null;
}

type ConstructorReconocimientoVoz = new () => ReconocimientoVoz;

type VentanaConReconocimiento = Window & {
  SpeechRecognition?: ConstructorReconocimientoVoz;
  webkitSpeechRecognition?: ConstructorReconocimientoVoz;
};

export const MENSAJE_SIN_SOPORTE =
  "Tu navegador no soporta el reconocimiento de voz. Probá con Chrome, Edge o Safari; en Firefox todavía no está disponible.";

function ventana(): VentanaConReconocimiento | null {
  if (typeof window === "undefined") return null;
  return window as VentanaConReconocimiento;
}

function constructorReconocimiento(): ConstructorReconocimientoVoz | null {
  const actual = ventana();
  if (!actual) return null;
  return actual.SpeechRecognition ?? actual.webkitSpeechRecognition ?? null;
}

/** True when the browser exposes the Web Speech recognition API. */
export function soportaReconocimientoVoz(): boolean {
  return constructorReconocimiento() !== null;
}

/** Builds a configured (English, single utterance) recognition instance. */
export function crearReconocimiento(): ReconocimientoVoz | null {
  const Constructor = constructorReconocimiento();
  if (!Constructor) return null;

  const reconocimiento = new Constructor();
  reconocimiento.lang = "en-US";
  reconocimiento.continuous = false;
  reconocimiento.interimResults = false;
  return reconocimiento;
}

/** Maps SpeechRecognition error codes to user-facing Spanish messages. */
export function mensajeErrorVoz(codigo: string): string {
  switch (codigo) {
    case "not-allowed":
    case "service-not-allowed":
      return "El micrófono está bloqueado. Dale permiso al navegador para este sitio y volvé a intentar (el reconocimiento solo funciona en HTTPS o localhost).";
    case "no-speech":
      return "No se escuchó nada. Acercate al micrófono y hablá un poco más fuerte.";
    case "audio-capture":
      return "No se encontró un micrófono disponible en este dispositivo.";
    case "network":
      return "El servicio de voz no respondió. Revisá tu conexión e intentá de nuevo.";
    case "language-not-supported":
      return "El reconocimiento de inglés no está disponible en este navegador.";
    case "aborted":
      return "";
    default:
      return `No se pudo usar el micrófono (${codigo || "error desconocido"}).`;
  }
}
