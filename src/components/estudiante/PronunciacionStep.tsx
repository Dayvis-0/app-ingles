import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Keyboard,
  Mic,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { UMBRAL_PRONUNCIACION } from "../../lib/pronunciacion";
import { speakWord } from "../../lib/tts";

type PronunciacionStepProps = {
  frases: string[];
  completadas: number[];
  onComplete: (index: number) => void;
};

export default function PronunciacionStep({
  frases,
  completadas,
  onComplete,
}: PronunciacionStepProps) {
  const total = frases.length;
  const [indice, setIndice] = useState(() => {
    const pendiente = frases.findIndex((_, i) => !completadas.includes(i));
    return pendiente >= 0 ? pendiente : 0;
  });

  const resueltas = frases.filter((_, i) => completadas.includes(i)).length;
  const completado = total > 0 && resueltas === total;
  const indiceSeguro = total === 0 ? 0 : Math.min(indice, total - 1);
  const fraseActual = frases[indiceSeguro];

  const handleSiguiente = () => {
    if (indiceSeguro < total - 1) {
      setIndice(indiceSeguro + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs md:text-sm font-black uppercase tracking-[0.12em] text-[#1cb0f6] block">
          ETAPA 4 DE 5 · PRÁCTICA DE PRONUNCIACIÓN
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">
          Entrenamiento de Voz en Inglés
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Escuchá la frase, repetila en voz alta y comparamos tu pronunciación.
        </p>
        {total > 0 && (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full transition-colors ${
              completado
                ? "bg-emerald-100 text-emerald-700"
                : "bg-sky-100 text-[#1cb0f6]"
            }`}
          >
            {completado && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
            {resueltas}/{total} frases
          </span>
        )}
      </div>

      {!fraseActual ? (
        <div className="duo-card p-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#1cb0f6] flex items-center justify-center mx-auto">
            <Mic className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-600">
            Esta lección todavía no tiene frases de pronunciación.
          </p>
          <p className="text-xs font-bold text-slate-400">
            El docente puede agregarlas desde el formulario de la lección.
          </p>
        </div>
      ) : (
        <PracticaFrase
          key={indiceSeguro}
          frase={fraseActual}
          numero={indiceSeguro + 1}
          total={total}
          esUltima={indiceSeguro === total - 1}
          onComplete={() => onComplete(indiceSeguro)}
          onSiguiente={handleSiguiente}
        />
      )}

      {total > 0 && (
        <div
          role="status"
          aria-live="polite"
          className={`w-full rounded-xl p-4 flex items-center gap-3 border-2 transition-all duration-200 ${
            completado
              ? "bg-[#d7ffb7] border-[#58cc02]"
              : "bg-slate-50 border-slate-200"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm ${
              completado ? "text-emerald-500" : "text-slate-500"
            }`}
          >
            {completado ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <span className="text-lg">🎙️</span>
            )}
          </div>
          <div className="text-left">
            <p
              className={`text-sm font-extrabold leading-tight ${
                completado ? "text-[#58cc02]" : "text-slate-800"
              }`}
            >
              {completado
                ? "¡Bloque completado!"
                : `Práctica de pronunciación (${resueltas}/${total})`}
            </p>
            <p className="text-[11px] font-bold mt-0.5 text-slate-600">
              {completado
                ? `Pronunciaste las ${total} frases con ${UMBRAL_PRONUNCIACION}% o más de coincidencia.`
                : `Necesitás ${UMBRAL_PRONUNCIACION}% de coincidencia en cada frase para darla por aprobada.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

type PracticaFraseProps = {
  frase: string;
  numero: number;
  total: number;
  esUltima: boolean;
  onComplete: () => void;
  onSiguiente: () => void;
};

function PracticaFrase({
  frase,
  numero,
  total,
  esUltima,
  onComplete,
  onSiguiente,
}: PracticaFraseProps) {
  const {
    soportado,
    escuchando,
    transcripcion,
    resultado,
    error,
    iniciar,
    detener,
    reiniciar,
    evaluarEscrito,
  } = useSpeechRecognition();

  const [escribiendo, setEscribiendo] = useState(!soportado);
  const [texto, setTexto] = useState("");
  const reportadoRef = useRef(false);

  const porcentaje = resultado?.porcentaje ?? 0;
  const aprobada = porcentaje >= UMBRAL_PRONUNCIACION;

  useEffect(() => {
    if (aprobada && !reportadoRef.current) {
      reportadoRef.current = true;
      onComplete();
    }
  }, [aprobada, onComplete]);

  const reintentar = () => {
    detener();
    reiniciar();
    setTexto("");
  };

  const abrirEscritura = () => {
    detener();
    reiniciar();
    setEscribiendo(true);
  };

  return (
    <div className="space-y-4 max-w-2xl w-full mx-auto">
      <div className="duo-card p-4 bg-[#1cb0f6]/10 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-sky-600">
            Frase objetivo · {numero}/{total}
          </span>
          <button
            type="button"
            onClick={() => void speakWord(frase)}
            aria-label="Escuchar la frase en inglés"
            title="Escuchar la frase nativa"
            className="p-1.5 rounded-full bg-white text-sky-600 hover:bg-sky-100 transition-colors cursor-pointer shadow-sm"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
          &ldquo;{frase}&rdquo;
        </p>
      </div>

      {soportado ? (
        <div className="flex justify-center">
          <div className="bg-slate-100 rounded-xl p-1 inline-flex items-center gap-1.5 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                detener();
                reiniciar();
                setEscribiendo(false);
              }}
              aria-pressed={!escribiendo}
              className={`py-1.5 px-4 text-xs font-black rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                escribiendo
                  ? "text-slate-500 hover:text-slate-800"
                  : "bg-white text-[#1cb0f6] shadow"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              Micrófono
            </button>
            <button
              type="button"
              onClick={abrirEscritura}
              aria-pressed={escribiendo}
              className={`py-1.5 px-4 text-xs font-black rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                escribiendo
                  ? "bg-white text-[#1cb0f6] shadow"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              Escribir
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-xs font-bold text-left">
            Tu navegador no soporta el reconocimiento de voz. Probá con Chrome,
            Edge o Safari; mientras tanto podés practicar escribiendo la frase.
          </p>
        </div>
      )}

      {escribiendo ? (
        <div className="space-y-3">
          <label
            htmlFor="pronunciacion-texto"
            className="text-xs font-black uppercase tracking-wider text-slate-500 block text-left"
          >
            Escribí lo que dirías en inglés
          </label>
          <textarea
            id="pronunciacion-texto"
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                evaluarEscrito(frase, texto);
              }
            }}
            placeholder="Escribí la frase tal como la pronunciarías..."
            className="w-full min-h-[80px] p-3 text-base font-bold border-2 border-slate-200 focus:border-sky-500 outline-none rounded-xl bg-white text-slate-800 shadow-inner select-all"
          />
          <button
            type="button"
            onClick={() => evaluarEscrito(frase, texto)}
            disabled={texto.trim().length === 0}
            className="w-full py-3 px-6 rounded-xl font-black text-sm uppercase tracking-wider cursor-pointer btn-3d-green"
          >
            COMPARAR CON LA FRASE
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
          <button
            type="button"
            onClick={() => (escuchando ? detener() : iniciar(frase))}
            aria-pressed={escuchando}
            aria-label={
              escuchando ? "Detener la grabación" : "Grabar mi pronunciación"
            }
            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all active:scale-95 cursor-pointer ${
              escuchando
                ? "bg-rose-600 text-white animate-pulse"
                : "bg-[#1cb0f6] text-white hover:bg-[#1899d6]"
            }`}
          >
            <Mic className="w-8 h-8" />
          </button>

          {escuchando ? (
            <>
              <MedidorVoz />
              <p className="text-xs font-extrabold text-rose-600">
                Escuchando... hablá ahora en inglés
              </p>
            </>
          ) : (
            <p className="text-xs font-bold text-slate-500">
              Tocá el micrófono y leé la frase en voz alta.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 rounded-xl p-4 text-left space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs font-bold">{error}</p>
          </div>
          {!escribiendo && (
            <button
              type="button"
              onClick={abrirEscritura}
              className="text-[11px] font-black uppercase tracking-wider text-amber-900 underline underline-offset-2 cursor-pointer"
            >
              Probar escribiendo la frase
            </button>
          )}
        </div>
      )}

      {resultado && (
        <div
          role="status"
          aria-live="polite"
          className={`w-full rounded-xl p-4 space-y-3 border-2 transition-all duration-200 ${
            aprobada
              ? "bg-[#d7ffb7] border-[#58cc02]"
              : "bg-[#ffdfe0] border-[#ff4b4b]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm ${
                aprobada ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {aprobada ? (
                <Check className="w-5 h-5 stroke-[3px]" />
              ) : (
                <X className="w-5 h-5 stroke-[3px]" />
              )}
            </div>
            <div className="text-left">
              <h5
                className={`font-extrabold text-sm uppercase tracking-wide leading-none mb-0.5 ${
                  aprobada ? "text-[#58cc02]" : "text-[#ea2b2b]"
                }`}
              >
                {aprobada ? "¡Excelente pronunciación!" : "¡Casi lo lográs!"}
              </h5>
              <p className="text-slate-800 font-bold text-sm">
                Coincidiste en un <span className="font-black">{porcentaje}%</span>{" "}
                {aprobada
                  ? "con la frase objetivo."
                  : `con la frase. Necesitás ${UMBRAL_PRONUNCIACION}% para aprobarla.`}
              </p>
            </div>
          </div>

          {transcripcion && (
            <div className="bg-white/70 rounded-lg p-3 text-left">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block mb-0.5">
                Lo que escuchamos
              </span>
              <p className="text-sm font-black italic text-slate-800">
                &ldquo;{transcripcion}&rdquo;
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {resultado.palabras.map((palabra, idx) => (
              <span
                key={`${palabra.palabra}-${idx}`}
                className={`px-2 py-1 rounded-md text-xs font-black border ${
                  palabra.coincide
                    ? "bg-white text-emerald-700 border-emerald-300"
                    : "bg-white text-rose-600 border-rose-300"
                }`}
              >
                {palabra.palabra}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={() => void speakWord(frase)}
              aria-label="Escuchar la frase en inglés"
              className="p-2.5 rounded-xl border-2 border-white/60 bg-white/70 text-slate-600 hover:text-sky-600 cursor-pointer transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {aprobada ? (
              !esUltima && (
                <button
                  type="button"
                  onClick={onSiguiente}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white border-2 border-[#58cc02] text-[#46a302] font-black text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#f6fff0]"
                >
                  SIGUIENTE FRASE
                  <ArrowRight className="w-4 h-4" />
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={reintentar}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white border-2 border-[#ff4b4b] text-[#ea2b2b] font-black text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#fff5f5]"
              >
                <RotateCcw className="w-4 h-4" />
                REINTENTAR
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Decorative animated bars that mirror the microphone input while recording. */
function MedidorVoz() {
  const barras = [
    { alto: 14, retraso: "0s" },
    { alto: 24, retraso: "0.15s" },
    { alto: 10, retraso: "0.3s" },
    { alto: 20, retraso: "0.1s" },
    { alto: 16, retraso: "0.25s" },
  ];

  return (
    <div className="flex items-end justify-center gap-1 h-7" aria-hidden="true">
      {barras.map((barra, idx) => (
        <span
          key={idx}
          className="w-1 rounded-full bg-rose-500 animate-bounce"
          style={{ height: barra.alto, animationDelay: barra.retraso }}
        />
      ))}
    </div>
  );
}
