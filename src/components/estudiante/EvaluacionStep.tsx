import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  X,
} from "lucide-react";
import type { PreguntaItem } from "../../lib/lecciones";
import {
  NOTA_APROBATORIA,
  NOTA_MAXIMA,
  alternativasDe,
  calcularResultado,
  type AlternativaEvaluacion,
  type ResultadoEvaluacion,
} from "../../lib/evaluacion";

type EvaluacionStepProps = {
  preguntas: PreguntaItem[];
  onFinish: (resultado: ResultadoEvaluacion | null) => void | Promise<void>;
};

type Fase = "intro" | "pregunta";

export default function EvaluacionStep({
  preguntas,
  onFinish,
}: EvaluacionStepProps) {
  const total = preguntas.length;
  const [fase, setFase] = useState<Fase>("intro");
  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState<AlternativaEvaluacion | null>(null);
  const [confirmada, setConfirmada] = useState(false);
  const [respuestas, setRespuestas] = useState<
    Array<AlternativaEvaluacion | null>
  >(() => preguntas.map(() => null));
  const [finalizando, setFinalizando] = useState(false);
  const [errorFinalizar, setErrorFinalizar] = useState<string | null>(null);

  const finalizar = async (resultado: ResultadoEvaluacion | null) => {
    if (finalizando) return;

    setFinalizando(true);
    setErrorFinalizar(null);

    try {
      await onFinish(resultado);
    } catch (error) {
      setErrorFinalizar(
        error instanceof Error
          ? error.message
          : "No se pudo finalizar la evaluación.",
      );
    } finally {
      setFinalizando(false);
    }
  };

  if (total === 0) {
    return (
      <div className="space-y-6 max-w-2xl w-full mx-auto">
        <div className="text-center space-y-1">
          <span className="text-xs md:text-sm font-black uppercase tracking-[0.12em] text-[#1cb0f6] block">
            ETAPA 5 DE 5 · EVALUACIÓN FINAL
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">
            Comprobá lo Aprendido
          </h1>
        </div>

        <div className="duo-card p-8 bg-white text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-slate-800">
            Esta lección todavía no tiene preguntas
          </h2>
          <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto">
            El docente puede cargarlas desde el formulario de la lección. Por
            ahora podés finalizar el recorrido sin nota.
          </p>
          <button
            type="button"
            onClick={() => void finalizar(null)}
            disabled={finalizando}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl font-black uppercase tracking-wider text-sm cursor-pointer btn-3d-green disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {finalizando ? "FINALIZANDO..." : "FINALIZAR RECORRIDO"}
          </button>
          {errorFinalizar && (
            <p className="text-sm font-bold text-rose-600">{errorFinalizar}</p>
          )}
        </div>
      </div>
    );
  }

  if (fase === "intro") {
    return (
      <div className="space-y-6 max-w-2xl w-full mx-auto">
        <div className="text-center space-y-1">
          <span className="text-xs md:text-sm font-black uppercase tracking-[0.12em] text-[#1cb0f6] block">
            ETAPA 5 DE 5 · EVALUACIÓN FINAL
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">
            Comprobá lo Aprendido
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Respondé las preguntas de opción múltiple y descubrí tu nota.
          </p>
        </div>

        <div className="duo-card p-6 md:p-8 bg-white text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <GraduationCap className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-slate-800">
              Evaluación de {total} {total === 1 ? "pregunta" : "preguntas"}
            </h2>
            <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto">
              Cada pregunta tiene cuatro alternativas: A, B, C y D. Solo una es
              correcta.
            </p>
          </div>

          <ul className="text-left max-w-md mx-auto space-y-2 text-sm font-bold text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
              Vas a ver tu avance en todo momento.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
              Recibís retroalimentación después de confirmar cada respuesta.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
              La nota mínima para aprobar es {NOTA_APROBATORIA} de{" "}
              {NOTA_MAXIMA}.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
              Al final obtenés tu nota de 0 a {NOTA_MAXIMA}.
            </li>
          </ul>

          <button
            type="button"
            onClick={() => setFase("pregunta")}
            className="w-full py-3.5 px-6 rounded-xl font-black uppercase tracking-wider text-sm cursor-pointer btn-3d-green inline-flex items-center justify-center gap-2"
          >
            COMENZAR EVALUACIÓN
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const preguntaActual = preguntas[indice];
  const alternativas = alternativasDe(preguntaActual);
  const esUltima = indice === total - 1;
  const esCorrecta = seleccion === preguntaActual.respuesta_correcta;
  const alternativaCorrecta = alternativas.find(
    (alternativa) => alternativa.letra === preguntaActual.respuesta_correcta,
  );
  const progreso = Math.round(((indice + 1) / total) * 100);

  const confirmarRespuesta = () => {
    if (!seleccion || confirmada) return;

    setRespuestas((prev) => {
      const siguiente = [...prev];
      siguiente[indice] = seleccion;
      return siguiente;
    });
    setConfirmada(true);
  };

  const continuar = () => {
    if (!confirmada || finalizando) return;

    if (esUltima) {
      void finalizar(calcularResultado(preguntas, respuestas));
      return;
    }

    setIndice((prev) => prev + 1);
    setSeleccion(null);
    setConfirmada(false);
  };

  return (
    <div className="space-y-5 max-w-2xl w-full mx-auto">
      <div className="text-center space-y-2">
        <span className="text-xs md:text-sm font-black uppercase tracking-[0.12em] text-[#1cb0f6] block">
          ETAPA 5 DE 5 · EVALUACIÓN FINAL
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">
          Elegí la Alternativa Correcta
        </h1>
        <div className="flex items-center justify-center gap-2">
          <span className="bg-sky-100 text-[#1cb0f6] font-black text-xs px-3 py-1 rounded-full">
            Pregunta {indice + 1} de {total}
          </span>
          <span className="bg-emerald-100 text-emerald-700 font-black text-xs px-2.5 py-1 rounded-full">
            {progreso}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progreso}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso de la evaluación: pregunta ${indice + 1} de ${total}`}
          className="w-full h-3 bg-slate-200 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-gradient-to-r from-[#58cc02] to-[#46a302] transition-all duration-300 rounded-full"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      <div className="duo-card p-5 md:p-6 bg-white space-y-4">
        <div className="bg-[#1cb0f6]/10 border-2 border-sky-100 rounded-2xl p-4 md:p-5">
          <span className="text-[10px] uppercase font-black tracking-widest text-sky-600 block mb-1">
            Pregunta {indice + 1}
          </span>
          <p className="text-lg md:text-xl font-black text-slate-800 leading-snug">
            {preguntaActual.enunciado}
          </p>
        </div>

        <fieldset className="space-y-2.5">
          <legend className="sr-only">Elegí una alternativa</legend>
          {alternativas.map(({ letra, texto }) => {
            const isSelected = seleccion === letra;
            const isCorrect = letra === preguntaActual.respuesta_correcta;
            const mostrarCorrecta = confirmada && isCorrect;
            const mostrarIncorrecta = confirmada && isSelected && !isCorrect;

            return (
              <button
                key={letra}
                type="button"
                onClick={() => {
                  if (!confirmada) setSeleccion(letra);
                }}
                disabled={confirmada}
                aria-pressed={isSelected}
                className={`w-full p-3.5 rounded-xl border-2 text-left flex items-center gap-3 transition-colors ${
                  mostrarCorrecta
                    ? "bg-emerald-50 border-emerald-400"
                    : mostrarIncorrecta
                      ? "bg-rose-50 border-rose-400"
                      : isSelected
                        ? "bg-sky-50 border-[#1cb0f6]"
                        : "bg-white border-slate-200 hover:border-sky-400 hover:bg-sky-50/40"
                } ${confirmada ? "cursor-default" : "cursor-pointer"}`}
              >
                <span
                  className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm font-black border-2 ${
                    mostrarCorrecta
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : mostrarIncorrecta
                        ? "bg-rose-500 border-rose-500 text-white"
                        : isSelected
                          ? "bg-[#1cb0f6] border-[#1cb0f6] text-white"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  {letra}
                </span>
                <span className="flex-1 font-bold text-sm md:text-base text-slate-800 leading-snug">
                  {texto}
                </span>
                {mostrarCorrecta && (
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {mostrarIncorrecta && (
                  <X className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </fieldset>

        {!confirmada ? (
          <button
            type="button"
            onClick={confirmarRespuesta}
            disabled={!seleccion}
            className="w-full py-3 px-6 rounded-xl font-black text-sm uppercase tracking-wider cursor-pointer btn-3d-green disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CONFIRMAR RESPUESTA
          </button>
        ) : (
          <div
            role="status"
            aria-live="polite"
            className={`w-full rounded-xl p-4 space-y-3 border-2 transition-all duration-200 ${
              esCorrecta
                ? "bg-[#d7ffb7] border-[#58cc02]"
                : "bg-[#ffdfe0] border-[#ff4b4b]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm ${
                  esCorrecta ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {esCorrecta ? (
                  <Check className="w-5 h-5 stroke-[3px]" />
                ) : (
                  <X className="w-5 h-5 stroke-[3px]" />
                )}
              </div>
              <div className="text-left">
                <h5
                  className={`font-extrabold text-sm uppercase tracking-wide leading-none mb-0.5 ${
                    esCorrecta ? "text-[#58cc02]" : "text-[#ea2b2b]"
                  }`}
                >
                  {esCorrecta ? "¡Correcto!" : "¡Casi lo lográs!"}
                </h5>
                <p className="text-slate-800 font-bold text-sm">
                  {esCorrecta ? (
                    "Sumaste un acierto."
                  ) : (
                    <>
                      La respuesta correcta es{" "}
                      <span className="font-black">
                        {preguntaActual.respuesta_correcta}:{" "}
                        {alternativaCorrecta?.texto}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={continuar}
              disabled={finalizando}
              className="w-full py-2.5 px-4 rounded-xl bg-white border-2 border-[#58cc02] text-[#46a302] font-black text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#f6fff0] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {esUltima
                ? finalizando
                  ? "FINALIZANDO..."
                  : "FINALIZAR EVALUACIÓN"
                : "SIGUIENTE PREGUNTA"}
              <ArrowRight className="w-4 h-4" />
            </button>

            {errorFinalizar && (
              <p className="text-xs font-bold text-rose-700 bg-white/70 rounded-lg p-2">
                {errorFinalizar}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
