import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Keyboard,
  Puzzle,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";
import type { OracionItem } from "../../lib/lecciones";
import {
  construirBurbujas,
  esRespuestaCorrecta,
  normalizarFrase,
} from "../../lib/oraciones";
import { speakWord } from "../../lib/tts";

type ConstruccionStepProps = {
  oraciones: OracionItem[];
  completadas: number[];
  onComplete: (index: number) => void;
};

export default function ConstruccionStep({
  oraciones,
  completadas,
  onComplete,
}: ConstruccionStepProps) {
  const total = oraciones.length;
  const [indice, setIndice] = useState(() => {
    const pendiente = oraciones.findIndex((_, i) => !completadas.includes(i));
    return pendiente >= 0 ? pendiente : 0;
  });

  const resueltas = oraciones.filter((_, i) =>
    completadas.includes(i),
  ).length;
  const completado = total > 0 && resueltas === total;
  const indiceSeguro = total === 0 ? 0 : Math.min(indice, total - 1);
  const oracionActual = oraciones[indiceSeguro];

  const handleSiguiente = () => {
    if (indiceSeguro < total - 1) {
      setIndice(indiceSeguro + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs md:text-sm font-black uppercase tracking-[0.12em] text-[#1cb0f6] block">
          ETAPA 3 DE 5 · CONSTRUCCIÓN DE ORACIONES
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">
          Construye la Frase
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Traducí la frase al inglés ordenando las palabras o escribiéndola.
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
            {resueltas}/{total} oraciones
          </span>
        )}
      </div>

      {!oracionActual ? (
        <div className="duo-card p-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Puzzle className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-600">
            Esta lección todavía no tiene oraciones cargadas.
          </p>
          <p className="text-xs font-bold text-slate-400">
            El docente puede agregarlas desde el formulario de la lección.
          </p>
        </div>
      ) : (
        <EjercicioOracion
          key={indiceSeguro}
          oracion={oracionActual}
          numero={indiceSeguro + 1}
          total={total}
          esUltima={indiceSeguro === total - 1}
          onResuelto={() => onComplete(indiceSeguro)}
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
              <span className="text-lg">🧩</span>
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
                : `Construcción de oraciones (${resueltas}/${total})`}
            </p>
            <p className="text-[11px] font-bold mt-0.5 text-slate-600">
              {completado
                ? `Armaste las ${total} oraciones correctamente. Ya podés continuar con la pronunciación.`
                : `Te faltan ${total - resueltas} oración(es) por resolver.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

type EjercicioOracionProps = {
  oracion: OracionItem;
  numero: number;
  total: number;
  esUltima: boolean;
  onResuelto: () => void;
  onSiguiente: () => void;
};

type EstadoEjercicio = "idle" | "correct" | "incorrect";

function EjercicioOracion({
  oracion,
  numero,
  total,
  esUltima,
  onResuelto,
  onSiguiente,
}: EjercicioOracionProps) {
  const [modoTeclado, setModoTeclado] = useState(false);
  const [burbujas, setBurbujas] = useState<string[]>(() =>
    construirBurbujas(oracion.ingles),
  );
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState<EstadoEjercicio>("idle");

  const respuesta = modoTeclado ? texto : elegidas.join(" ");
  const sinRespuesta = normalizarFrase(respuesta).length === 0;
  const bloqueado = estado !== "idle";

  const cambiarModo = (teclado: boolean) => {
    setModoTeclado(teclado);
    setEstado("idle");
  };

  const agregarPalabra = (indiceBurbuja: number) => {
    if (bloqueado) return;
    const palabra = burbujas[indiceBurbuja];
    if (palabra === undefined) return;
    setElegidas((prev) => [...prev, palabra]);
    setBurbujas((prev) => prev.filter((_, i) => i !== indiceBurbuja));
  };

  const quitarPalabra = (indiceElegida: number) => {
    if (bloqueado) return;
    const palabra = elegidas[indiceElegida];
    if (palabra === undefined) return;
    setElegidas((prev) => prev.filter((_, i) => i !== indiceElegida));
    setBurbujas((prev) => [...prev, palabra]);
  };

  const comprobar = () => {
    if (sinRespuesta || bloqueado) return;

    if (esRespuestaCorrecta(respuesta, oracion.ingles)) {
      setEstado("correct");
      onResuelto();
      return;
    }

    setEstado("incorrect");
  };

  const reintentar = () => {
    setBurbujas(construirBurbujas(oracion.ingles));
    setElegidas([]);
    setTexto("");
    setEstado("idle");
  };

  return (
    <div className="space-y-4 max-w-2xl w-full mx-auto">
      <div className="duo-card p-4 bg-[#1cb0f6]/10 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow text-lg shrink-0">
          🗣️
        </div>
        <div className="text-left flex-1">
          <span className="text-[9px] uppercase font-extrabold text-sky-600 tracking-widest block mb-0.5">
            Traducí esta frase al inglés · {numero}/{total}
          </span>
          <p className="text-lg font-black text-slate-800 leading-tight">
            {oracion.espanol}
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="bg-slate-100 rounded-xl p-1 inline-flex items-center gap-1.5 border border-slate-200">
          <button
            type="button"
            onClick={() => cambiarModo(false)}
            aria-pressed={!modoTeclado}
            className={`py-1.5 px-4 text-xs font-black rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              modoTeclado
                ? "text-slate-500 hover:text-slate-800"
                : "bg-white text-[#1cb0f6] shadow"
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            Modo Burbujas
          </button>
          <button
            type="button"
            onClick={() => cambiarModo(true)}
            aria-pressed={modoTeclado}
            className={`py-1.5 px-4 text-xs font-black rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              modoTeclado
                ? "bg-white text-[#1cb0f6] shadow"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            Modo Teclado
          </button>
        </div>
      </div>

      {modoTeclado ? (
        <textarea
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              comprobar();
            }
          }}
          disabled={bloqueado}
          placeholder="Escribí tu traducción en inglés aquí..."
          aria-label="Traducción en inglés"
          className="w-full min-h-[80px] p-3 text-base font-bold border-2 border-slate-200 focus:border-sky-500 outline-none rounded-xl bg-white text-slate-800 shadow-inner select-all disabled:bg-slate-50 disabled:text-slate-500"
        />
      ) : (
        <div className="space-y-3">
          <div className="min-h-[58px] p-3 border-2 border-dashed border-slate-200 flex flex-wrap gap-1.5 items-center bg-slate-50/50 rounded-xl">
            {elegidas.length === 0 ? (
              <span className="text-xs font-bold text-slate-400 italic">
                Tocá las palabras de abajo para ordenar la frase...
              </span>
            ) : (
              elegidas.map((palabra, idx) => (
                <button
                  key={`elegida-${idx}`}
                  type="button"
                  onClick={() => quitarPalabra(idx)}
                  disabled={bloqueado}
                  className="py-1.5 px-3 bg-white border-2 border-b-4 border-slate-200 hover:border-slate-400 text-slate-800 font-extrabold rounded-lg text-xs shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-default"
                >
                  {palabra}
                </button>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center py-3 p-3 rounded-lg border-2 border-dashed border-slate-200 bg-white">
            {burbujas.length === 0 ? (
              <span className="text-xs font-bold text-slate-400 italic">
                Usaste todas las palabras.
              </span>
            ) : (
              burbujas.map((palabra, idx) => (
                <button
                  key={`burbuja-${idx}`}
                  type="button"
                  onClick={() => agregarPalabra(idx)}
                  disabled={bloqueado}
                  className="py-1.5 px-3 bg-slate-50 border border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-slate-800 font-black rounded-lg text-sm shadow-sm active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-default"
                >
                  {palabra}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {estado === "idle" ? (
        <button
          type="button"
          onClick={comprobar}
          disabled={sinRespuesta}
          className="w-full py-3 px-6 rounded-xl font-black text-sm uppercase tracking-wider cursor-pointer btn-3d-green"
        >
          COMPROBAR RESPUESTA
        </button>
      ) : (
        <div
          role="status"
          aria-live="polite"
          className={`w-full rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-2 transition-all duration-200 ${
            estado === "correct"
              ? "bg-[#d7ffb7] border-[#58cc02]"
              : "bg-[#ffdfe0] border-[#ff4b4b]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm font-black text-xl bg-white ${
                estado === "correct" ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {estado === "correct" ? (
                <Check className="w-5 h-5 stroke-[3px]" />
              ) : (
                <X className="w-5 h-5 stroke-[3px]" />
              )}
            </div>
            <div className="text-left">
              <h5
                className={`font-extrabold text-sm uppercase tracking-wide leading-none mb-0.5 ${
                  estado === "correct" ? "text-[#58cc02]" : "text-[#ea2b2b]"
                }`}
              >
                {estado === "correct"
                  ? "¡Extraordinario!"
                  : "¡Casi lo lográs!"}
              </h5>
              <p className="text-slate-800 font-bold text-sm">
                {estado === "correct" ? (
                  "Tradujiste la frase correctamente."
                ) : (
                  <>
                    La respuesta correcta es{" "}
                    <span className="font-black">“{oracion.ingles}”</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => void speakWord(oracion.ingles)}
              aria-label="Escuchar la oración en inglés"
              className="p-2.5 rounded-xl border-2 border-white/60 bg-white/70 text-slate-600 hover:text-sky-600 cursor-pointer transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {estado === "incorrect" ? (
              <button
                type="button"
                onClick={reintentar}
                className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-white border-2 border-[#ff4b4b] text-[#ea2b2b] font-black text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#fff5f5]"
              >
                <RotateCcw className="w-4 h-4" />
                REINTENTAR
              </button>
            ) : (
              !esUltima && (
                <button
                  type="button"
                  onClick={onSiguiente}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-white border-2 border-[#58cc02] text-[#46a302] font-black text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#f6fff0]"
                >
                  SIGUIENTE ORACIÓN
                  <ArrowRight className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
