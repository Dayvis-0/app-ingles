import { useCallback, useEffect, useRef, useState } from "react";
import {
  calcularSimilitud,
  type ResultadoPronunciacion,
} from "../lib/pronunciacion";
import {
  MENSAJE_SIN_SOPORTE,
  crearReconocimiento,
  mensajeErrorVoz,
  soportaReconocimientoVoz,
  type ReconocimientoVoz,
} from "../lib/voz";

/**
 * Encapsulates the Web Speech API lifecycle (HU08 - Dayvis): start listening,
 * capture the transcript, score it against the target sentence and expose the
 * error messages of the microphone.
 *
 * `evaluarEscrito` covers the typed fallback for browsers without the API
 * (Firefox) or when the microphone is blocked.
 */
export function useSpeechRecognition() {
  const [soportado] = useState(() => soportaReconocimientoVoz());
  const [escuchando, setEscuchando] = useState(false);
  const [transcripcion, setTranscripcion] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoPronunciacion | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const reconocimientoRef = useRef<ReconocimientoVoz | null>(null);

  const detener = useCallback(() => {
    const reconocimiento = reconocimientoRef.current;
    reconocimientoRef.current = null;

    if (reconocimiento) {
      try {
        reconocimiento.abort();
      } catch {
        // Abortar una sesión ya cerrada lanza en algunos navegadores.
      }
    }

    setEscuchando(false);
  }, []);

  // Never leave a recording running when the stage unmounts.
  useEffect(() => detener, [detener]);

  const reiniciar = useCallback(() => {
    setTranscripcion(null);
    setResultado(null);
    setError(null);
  }, []);

  const iniciar = useCallback(
    (objetivo: string) => {
      detener();
      reiniciar();

      const reconocimiento = crearReconocimiento();
      if (!reconocimiento) {
        setError(MENSAJE_SIN_SOPORTE);
        return;
      }

      reconocimientoRef.current = reconocimiento;
      reconocimiento.onstart = () => setEscuchando(true);

      reconocimiento.onresult = (event) => {
        const dicho = event.results[0]?.[0]?.transcript?.trim() ?? "";
        if (!dicho) return;
        setTranscripcion(dicho);
        setResultado(calcularSimilitud(objetivo, dicho));
      };

      reconocimiento.onerror = (event) => {
        setEscuchando(false);
        if (event.error === "aborted") return;
        setError(mensajeErrorVoz(event.error));
      };

      reconocimiento.onend = () => {
        setEscuchando(false);
        reconocimientoRef.current = null;
      };

      try {
        reconocimiento.start();
      } catch {
        reconocimientoRef.current = null;
        setEscuchando(false);
        setError("No se pudo conectar con el servicio de voz.");
      }
    },
    [detener, reiniciar],
  );

  const evaluarEscrito = useCallback((objetivo: string, texto: string) => {
    const limpio = texto.trim();
    if (!limpio) return;
    setError(null);
    setTranscripcion(limpio);
    setResultado(calcularSimilitud(objetivo, limpio));
  }, []);

  return {
    soportado,
    escuchando,
    transcripcion,
    resultado,
    error,
    iniciar,
    detener,
    reiniciar,
    evaluarEscrito,
  };
}
