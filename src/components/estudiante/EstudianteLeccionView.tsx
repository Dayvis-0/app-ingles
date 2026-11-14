import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Mic,
  Puzzle,
  RotateCcw,
} from "lucide-react";
import {
  DEFAULT_GRAMATICA_COLUMNAS,
  DEFAULT_GRAMATICA_DESC,
  DEFAULT_GRAMATICA_FORMULA,
  DEFAULT_GRAMATICA_TITULO,
  fetchLeccionById,
  type LeccionConContenido,
  type VocabularioItem,
} from "../../lib/lecciones";
import LessonProgressBar from "./LessonProgressBar";
import { ETAPAS_LECCION } from "./etapas";

type LoadState = "loading" | "error" | "not_found" | "ready";

const DEFAULT_VOCAB_PREVIEW: VocabularioItem[] = [
  { ingles: "study", espanol: "estudiar", categoria: "Verbo" },
  { ingles: "practice", espanol: "practicar", categoria: "Verbo" },
  { ingles: "speak", espanol: "hablar", categoria: "Verbo" },
  { ingles: "learn", espanol: "aprender", categoria: "Verbo" },
];

export default function EstudianteLeccionView() {
  const { idLeccion, etapa } = useParams<{
    idLeccion: string;
    etapa?: string;
  }>();
  const navigate = useNavigate();

  const [leccion, setLeccion] = useState<LeccionConContenido | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedTour, setCompletedTour] = useState(false);
  const [activeGrammarWordIdx, setActiveGrammarWordIdx] = useState<
    number | null
  >(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!idLeccion) {
        await Promise.resolve();
        if (isMounted) {
          setErrorMessage("Lección no especificada.");
          setLoadState("error");
        }
        return;
      }

      try {
        const data = await fetchLeccionById(idLeccion);
        if (!isMounted) return;

        if (!data) {
          setLoadState("not_found");
          return;
        }

        setLeccion(data);
        setLoadState("ready");
      } catch (err) {
        if (!isMounted) return;
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar la lección.",
        );
        setLoadState("error");
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [idLeccion]);

  const matchedIndex = ETAPAS_LECCION.findIndex((s) => s.key === etapa);
  const currentStepIndex = matchedIndex >= 0 ? matchedIndex : 0;
  const currentStep = ETAPAS_LECCION[currentStepIndex];

  const goToStep = (index: number) => {
    if (!idLeccion) return;
    const bounded = Math.max(0, Math.min(index, ETAPAS_LECCION.length - 1));
    setCompletedTour(false);
    setActiveGrammarWordIdx(null);
    navigate(`/estudiante/leccion/${idLeccion}/${ETAPAS_LECCION[bounded].key}`, {
      replace: true,
    });
  };

  const handleNext = () => {
    if (currentStepIndex < ETAPAS_LECCION.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      setCompletedTour(true);
    }
  };

  const handlePrev = () => {
    if (completedTour) {
      setCompletedTour(false);
      return;
    }
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

  const handleBackToMenu = () => {
    navigate("/estudiante");
  };

  if (loadState === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7f7f7] items-center justify-center p-4">
        <div className="w-full max-w-2xl duo-card p-8 bg-white text-center animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded-full w-48 mx-auto" />
          <div className="h-3 bg-slate-200 rounded-full w-full" />
          <div className="h-24 bg-slate-100 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  if (loadState === "error" || loadState === "not_found" || !leccion) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7f7f7] items-center justify-center p-4">
        <div className="w-full max-w-md duo-card p-8 bg-white text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-slate-800">
            {loadState === "not_found"
              ? "Lección no disponible"
              : "No se pudo abrir la lección"}
          </h2>
          <p className="text-sm font-semibold text-slate-500">
            {errorMessage ??
              "Esta lección no existe o fue desactivada por el docente."}
          </p>
          <button
            type="button"
            onClick={handleBackToMenu}
            className="w-full py-3.5 px-6 font-black uppercase tracking-wider rounded-xl cursor-pointer btn-3d-green"
          >
            VOLVER A MIS LECCIONES
          </button>
        </div>
      </div>
    );
  }

  const vocabItems =
    leccion.vocabulario.length > 0 ? leccion.vocabulario : DEFAULT_VOCAB_PREVIEW;
  const grammarTitle =
    leccion.gramatica?.nombre_tema || DEFAULT_GRAMATICA_TITULO;
  const grammarDesc = leccion.gramatica?.explicacion || DEFAULT_GRAMATICA_DESC;
  const grammarFormula =
    leccion.gramatica?.formula || DEFAULT_GRAMATICA_FORMULA;
  const grammarColumns =
    leccion.gramatica?.gramatica_columnas &&
    leccion.gramatica.gramatica_columnas.length > 0
      ? leccion.gramatica.gramatica_columnas
      : DEFAULT_GRAMATICA_COLUMNAS;
  const grammarExampleWords = (leccion.gramatica?.ejemplo || "")
    .split(" ")
    .filter(Boolean);
  const grammarExampleRoles = leccion.gramatica?.ejemplo_roles ?? [];
  const sentencePreviewWords = (
    leccion.gramatica?.ejemplo || "She studies English every day"
  )
    .split(" ")
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f7]">
      <LessonProgressBar
        currentStepIndex={currentStepIndex}
        lessonTitle={leccion.titulo}
        onSelectStep={goToStep}
        onBackToMenu={handleBackToMenu}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 md:py-8 flex flex-col justify-between gap-6">
        {completedTour ? (
          <section className="duo-card p-6 md:p-10 bg-white text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Award className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Etapa 5 de 5 · Completada
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800">
                ¡Recorrido de 5 etapas completado!
              </h1>
              <p className="text-sm md:text-base font-semibold text-slate-500 max-w-lg mx-auto">
                Completaste todas las etapas de{" "}
                <span className="text-slate-800 font-extrabold">
                  {leccion.titulo}
                </span>
                . Podés repasar cualquier etapa o volver a tu lista de lecciones.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => goToStep(0)}
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black uppercase tracking-wider text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                REPETIR RECORRIDO
              </button>
              <button
                type="button"
                onClick={handleBackToMenu}
                className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-black uppercase tracking-wider text-sm cursor-pointer btn-3d-green"
              >
                VOLVER A MIS LECCIONES
              </button>
            </div>
          </section>
        ) : (
          <section className="duo-card p-6 md:p-8 bg-white space-y-6">
            {currentStep.key === "vocabulario" && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.12em] text-[#1cb0f6] block">
                    ETAPA 1 DE 5 · VOCABULARIO INICIAL
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-800">
                    Palabras Clave de la Lección
                  </h1>
                  <p className="text-sm text-slate-500 font-medium">
                    Revisá el vocabulario esencial antes de pasar a la gramática.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vocabItems.map((item, idx) => (
                    <div
                      key={`${item.ingles}-${idx}`}
                      className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/60 hover:border-sky-300 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#1cb0f6] flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-lg font-black text-slate-800 font-mono truncate">
                            {item.ingles}
                          </p>
                          <p className="text-sm font-bold text-slate-500 truncate">
                            {item.espanol}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 shrink-0">
                        {item.categoria}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep.key === "gramatica" && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.12em] text-[#1cb0f6] block">
                    ETAPA 2 DE 5 · TEORÍA Y FÓRMULA INTEGRADA
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-800">
                    Visualizá la Estructura Formal
                  </h1>
                  <p className="text-sm text-slate-500 font-medium">
                    Asociá la guía visual con la fórmula gramatical del tema.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-6 justify-center">
                  <div
                    className="w-full md:w-[420px] rounded-[18px] p-5 md:p-6 text-white shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #1a8fe3 0%, #0d6bbf 60%, #0a55a0 100%)",
                      boxShadow: "0 8px 32px rgba(13, 107, 191, 0.25)",
                    }}
                  >
                    <div className="text-base md:text-lg font-extrabold tracking-wide">
                      Grammar Guide: {grammarTitle}
                    </div>
                    <div className="text-xs text-white/80 mb-4">
                      {grammarDesc}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {grammarColumns.map((col, i) => (
                        <div
                          key={i}
                          className="bg-white/12 rounded-[10px] px-2 py-3 text-center flex flex-col items-center justify-center gap-1"
                        >
                          <div className="text-[10px] text-white/75 leading-tight">
                            {col.titulo}
                          </div>
                          <div
                            className={`text-sm md:text-base font-extrabold ${
                              i === 0 ? "text-[#4dff6e]" : "text-[#ffe44d]"
                            }`}
                          >
                            {col.verbo}
                          </div>
                          {col.nota && (
                            <div className="text-[9px] text-white/70 whitespace-pre-line leading-relaxed">
                              {col.nota}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 text-center mb-2">
                      FÓRMULA GRAMATICAL ESTRUCTURADA
                    </div>
                    <div className="bg-[#0e1726] border-2 border-[#22d3ee] rounded-xl px-5 py-6 text-center">
                      <div className="text-lg md:text-xl font-bold font-mono text-[#22d3ee] leading-relaxed tracking-wide">
                        {grammarFormula}
                      </div>
                    </div>
                  </div>
                </div>

                {grammarExampleWords.length > 0 && (
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 md:p-5 space-y-3 text-center">
                    <span className="block text-xs uppercase font-black tracking-widest text-[#1cb0f6]">
                      EJEMPLO PRÁCTICO INTERACTIVO
                    </span>
                    <div className="flex justify-center flex-wrap items-center gap-2 text-xl md:text-2xl font-black text-slate-800">
                      {grammarExampleWords.map((word, idx) => {
                        const isActive = activeGrammarWordIdx === idx;
                        return (
                          <button
                            key={`${word}-${idx}`}
                            type="button"
                            onMouseEnter={() => setActiveGrammarWordIdx(idx)}
                            onClick={() => setActiveGrammarWordIdx(idx)}
                            className={`px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                              isActive
                                ? "text-[#1cb0f6] bg-sky-100 underline decoration-2 underline-offset-4"
                                : "hover:text-[#1cb0f6] hover:bg-white"
                            }`}
                          >
                            {word}
                          </button>
                        );
                      })}
                    </div>
                    <div className="pt-2 border-t border-slate-200 min-h-[32px] flex items-center justify-center">
                      {activeGrammarWordIdx !== null &&
                      grammarExampleRoles[activeGrammarWordIdx] ? (
                        <span className="text-xs font-black uppercase tracking-wider text-[#1cb0f6] bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                          Rol: {grammarExampleRoles[activeGrammarWordIdx]}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold">
                          Tocá o pasá el cursor sobre una palabra para ver su rol gramatical.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep.key === "construccion-de-oraciones" && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.12em] text-[#1cb0f6] block">
                    ETAPA 3 DE 5 · CONSTRUCCIÓN DE ORACIONES
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-800">
                    Práctica de Estructura y Orden
                  </h1>
                  <p className="text-sm text-slate-500 font-medium">
                    Ordená los bloques de palabras siguiendo la fórmula{" "}
                    <span className="font-mono font-bold text-slate-700">
                      {grammarFormula}
                    </span>
                    .
                  </p>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                    <Puzzle className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">
                    Vista previa de bloques de oración para{" "}
                    <span className="text-slate-800 font-black">
                      {leccion.titulo}
                    </span>
                    :
                  </p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {sentencePreviewWords.map((word, idx) => (
                      <span
                        key={`${word}-${idx}`}
                        className="px-4 py-2 bg-white border-2 border-b-4 border-slate-200 rounded-xl font-extrabold text-slate-700 text-sm md:text-base"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-400">
                    La interacción completa con validación de frases se habilita en el Sprint 3.
                  </p>
                </div>
              </div>
            )}

            {currentStep.key === "pronunciacion" && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.12em] text-[#1cb0f6] block">
                    ETAPA 4 DE 5 · PRÁCTICA DE PRONUNCIACIÓN
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-800">
                    Entrenamiento de Voz en Inglés
                  </h1>
                  <p className="text-sm text-slate-500 font-medium">
                    Practicá diciendo en voz alta las oraciones de la lección.
                  </p>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 md:p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-sky-100 text-[#1cb0f6] flex items-center justify-center mx-auto">
                    <Mic className="w-8 h-8" />
                  </div>
                  <p className="text-xl md:text-2xl font-black font-mono text-slate-800">
                    “{sentencePreviewWords.join(" ")}”
                  </p>
                  <p className="text-xs font-bold text-slate-400 max-w-md mx-auto">
                    El reconocimiento de voz y comparación por similitud se integran en el Sprint 3.
                  </p>
                </div>
              </div>
            )}

            {currentStep.key === "evaluacion" && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.12em] text-[#1cb0f6] block">
                    ETAPA 5 DE 5 · EVALUACIÓN FINAL
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-800">
                    Comprobá lo Aprendido
                  </h1>
                  <p className="text-sm text-slate-500 font-medium">
                    Última etapa del recorrido con preguntas de opción múltiple A/B/C/D.
                  </p>
                </div>

                <div className="bg-emerald-50/60 border-2 border-emerald-200 rounded-2xl p-6 md:p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <ClipboardCheck className="w-7 h-7" />
                  </div>
                  <h2 className="text-lg font-black text-slate-800">
                    Estás en la Etapa 5 de 5 de {leccion.titulo}
                  </h2>
                  <p className="text-sm font-semibold text-slate-600 max-w-md mx-auto">
                    Al presionar{" "}
                    <span className="font-black text-emerald-700">
                      FINALIZAR RECORRIDO
                    </span>{" "}
                    completás el flujo guiado de las 5 etapas. La calificación automática 0–20 se incorpora en el Sprint 4.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {!completedTour && (
          <footer className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="text-center sm:text-left">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Etapa {currentStepIndex + 1} de {ETAPAS_LECCION.length}
              </p>
              <p className="text-sm font-extrabold text-slate-800">
                {currentStep.label} — {currentStep.description}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="flex-1 sm:flex-initial py-3 px-5 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-wider inline-flex items-center justify-center gap-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                ANTERIOR
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex-1 sm:flex-initial py-3 px-6 rounded-xl font-black text-sm uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer btn-3d-green"
              >
                {currentStepIndex < ETAPAS_LECCION.length - 1 ? (
                  <>
                    SIGUIENTE ETAPA
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    FINALIZAR RECORRIDO
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}
