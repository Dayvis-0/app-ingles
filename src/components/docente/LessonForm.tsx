import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import type { GramaticaColumna } from "../../types/database";
import {
  DEFAULT_GRAMATICA_COLUMNAS,
  DEFAULT_GRAMATICA_DESC,
  DEFAULT_GRAMATICA_FORMULA,
  DEFAULT_GRAMATICA_TITULO,
  type LeccionConContenido,
  type LeccionInput,
  type VocabularioItem,
} from "../../lib/lecciones";
import VocabTable from "./VocabTable";
import GrammarExampleSection from "./GrammarExampleSection";

interface LessonFormProps {
  editingLesson: LeccionConContenido | null;
  onSave: (data: LeccionInput) => Promise<void>;
  onCancelEdit: () => void;
  isSaving: boolean;
}

const GRAMMAR_PRESETS: Array<{
  name: string;
  titulo: string;
  desc: string;
  formula: string;
  columnas: GramaticaColumna[];
}> = [
  {
    name: "⚡ Present Simple",
    titulo: "PRESENT SIMPLE",
    desc: "Rutinas y hechos generales",
    formula: "Subject + Verb (-s/-es) + Complement",
    columnas: [
      { titulo: "I / You / We / They", verbo: "play / work", nota: "Verbo base" },
      { titulo: "He / She / It", verbo: "plays / works", nota: "Agregar -s o -es" },
      { titulo: "Fórmula General", verbo: "S + V + C", nota: "Ej: She likes pizza" },
    ],
  },
  {
    name: "🕒 Past Simple",
    titulo: "PAST SIMPLE",
    desc: "Acciones completadas en el pasado",
    formula: "Subject + Verb (-ed / Irregular) + Complement",
    columnas: [
      { titulo: "Todos los sujetos", verbo: "played / went", nota: "Forma pasado" },
      { titulo: "Negativo / Pregunta", verbo: "didn't + Verb", nota: "Usa auxiliar DID" },
      { titulo: "Fórmula General", verbo: "S + V(ed) + C", nota: "Ej: They visited Paris" },
    ],
  },
  {
    name: "🚀 Present Continuous",
    titulo: "PRESENT CONTINUOUS",
    desc: "Acciones sucediendo en el momento",
    formula: "Subject + AM / IS / ARE + Verb(-ing) + Complement",
    columnas: [
      { titulo: "I / He / She / It", verbo: "am / is working", nota: "Singular + Verb-ing" },
      { titulo: "You / We / They", verbo: "are playing", nota: "Plural + Verb-ing" },
      { titulo: "Fórmula General", verbo: "S + BE + V-ing", nota: "Ej: I am studying" },
    ],
  },
  {
    name: "💡 Modal (CAN)",
    titulo: "MODAL VERBS (CAN)",
    desc: "Habilidades y permisos",
    formula: "Subject + CAN + Base Verb + Complement",
    columnas: [
      { titulo: "Todos los sujetos", verbo: "CAN", nota: "Sin cambio por sujeto" },
      { titulo: "Verbo Principal", verbo: "speak / swim", nota: "Siempre forma base" },
      { titulo: "Fórmula General", verbo: "S + CAN + V + C", nota: "Ej: She can swim" },
    ],
  },
];

const FORMULA_CHIPS = [
  "Subject",
  "Verb",
  "Complement",
  "AM / IS / ARE",
  "Verb(-ing)",
  "Verb(-ed)",
  "CAN",
];

function cloneDefaultColumnas(): GramaticaColumna[] {
  return DEFAULT_GRAMATICA_COLUMNAS.map((col) => ({ ...col }));
}

function SectionAccordion({
  number,
  title,
  defaultOpen = true,
  children,
}: {
  number: string;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="w-full flex items-center justify-between bg-sky-50/60 p-4 md:p-5 rounded-2xl border-2 border-sky-100 hover:border-sky-200 hover:bg-sky-50 transition-all cursor-pointer text-left"
      >
        <span className="text-lg md:text-xl font-extrabold text-[#1cb0f6]">
          {number}. {title}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-sky-500 font-bold uppercase tracking-wider">
            {open ? "Cerrar" : "Abrir"}
          </span>
          <ChevronDown
            className={`w-6 h-6 text-sky-400 transition-transform duration-200 ${
              open ? "rotate-0" : "-rotate-90"
            }`}
          />
        </div>
      </button>

      {open && <div className="pt-5 space-y-5">{children}</div>}
    </div>
  );
}

function DetailsCollapsible({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2 border-2 border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-left"
      >
        <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
          {open ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
          {title}
          {count > 0 && (
            <span className="bg-sky-100 text-sky-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          {open ? "Ocultar" : "Ver"}
        </span>
      </button>
      {open && (
        <div className="px-4 py-3 border-t border-slate-200 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

export default function LessonForm({
  editingLesson,
  onSave,
  onCancelEdit,
  isSaving,
}: LessonFormProps) {
  const [titulo, setTitulo] = useState(editingLesson?.titulo ?? "");
  const [estadoActivo, setEstadoActivo] = useState(
    editingLesson?.estado_activo ?? false,
  );
  const [vocabulario, setVocabulario] = useState<VocabularioItem[]>(
    () => editingLesson?.vocabulario?.map((item) => ({ ...item })) ?? [],
  );
  const [gramaticaTitulo, setGramaticaTitulo] = useState(
    editingLesson?.gramatica?.nombre_tema ?? DEFAULT_GRAMATICA_TITULO,
  );
  const [gramaticaDesc, setGramaticaDesc] = useState(
    editingLesson?.gramatica?.explicacion ?? DEFAULT_GRAMATICA_DESC,
  );
  const [formulaGramatica, setFormulaGramatica] = useState(
    editingLesson?.gramatica?.formula ?? DEFAULT_GRAMATICA_FORMULA,
  );
  const [gramaticaColumnas, setGramaticaColumnas] = useState<GramaticaColumna[]>(
    () =>
      editingLesson?.gramatica?.gramatica_columnas?.length
        ? editingLesson.gramatica.gramatica_columnas.map((c) => ({ ...c }))
        : cloneDefaultColumnas(),
  );
  const [ejemploOracion, setEjemploOracion] = useState(
    editingLesson?.gramatica?.ejemplo ?? "",
  );
  const [ejemploRoles, setEjemploRoles] = useState<string[]>(
    () => [...(editingLesson?.gramatica?.ejemplo_roles ?? [])],
  );

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const resetToDefaults = () => {
    setTitulo("");
    setEstadoActivo(false);
    setVocabulario([]);
    setGramaticaTitulo(DEFAULT_GRAMATICA_TITULO);
    setGramaticaDesc(DEFAULT_GRAMATICA_DESC);
    setFormulaGramatica(DEFAULT_GRAMATICA_FORMULA);
    setGramaticaColumnas(cloneDefaultColumnas());
    setEjemploOracion("");
    setEjemploRoles([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitulo = titulo.trim();
    if (!trimmedTitulo) {
      setError("Por favor ingresá un título para la lección.");
      return;
    }

    if (trimmedTitulo.length > 150) {
      setError("El título no puede exceder los 150 caracteres.");
      return;
    }

    const trimmedFormula = formulaGramatica.trim();
    if (!trimmedFormula) {
      setError("Por favor ingresá la fórmula gramatical de la lección.");
      return;
    }

    if (trimmedFormula.length > 100) {
      setError("La fórmula gramatical no puede exceder los 100 caracteres.");
      return;
    }

    try {
      await onSave({
        id: editingLesson ? editingLesson.id_leccion : undefined,
        titulo: trimmedTitulo,
        estado_activo: estadoActivo,
        vocabulario,
        gramatica: {
          nombre_tema: gramaticaTitulo.trim() || trimmedTitulo,
          explicacion: gramaticaDesc.trim(),
          formula: trimmedFormula,
          ejemplo: ejemploOracion.trim(),
          gramatica_columnas: gramaticaColumnas,
          ejemplo_roles: ejemploRoles,
        },
      });

      setSuccess(
        editingLesson
          ? "¡Lección actualizada con éxito!"
          : "¡Nueva lección creada con éxito!",
      );

      if (!editingLesson) {
        resetToDefaults();
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al guardar la lección";
      setError(msg);
    }
  };

  return (
    <div className="bg-white rounded-[18px] p-5 md:p-6 w-full shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4">
        <div>
          <h4 className="text-lg md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            {editingLesson ? "📝 Editar Lección" : "➕ Crear Nuevo Tema"}
          </h4>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            {editingLesson
              ? "Modificá el título, vocabulario y gramática de la lección"
              : "Definí la información general, vocabulario inicial y estructura gramatical"}
          </p>
        </div>

        {editingLesson && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Cancelar Edición
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* 1. GENERAL */}
        <SectionAccordion number="1" title="General" defaultOpen={true}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="lesson-title"
                className="block text-sm md:text-base font-bold text-slate-700 mb-2"
              >
                Título de la Lección <span className="text-rose-500">*</span>
              </label>
              <input
                id="lesson-title"
                type="text"
                required
                maxLength={150}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="ej: Present Simple"
                className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl text-base md:text-lg font-bold outline-none focus:border-sky-500 bg-white text-slate-800 transition-colors shadow-xs"
              />
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                Nombre representativo del tema que verán los alumnos.
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <span className="block text-sm font-bold text-slate-700">
                  Estado de la lección
                </span>
                <p className="text-xs text-slate-500 font-medium">
                  {estadoActivo
                    ? "La lección estará visible y disponible para los estudiantes."
                    : "La lección estará oculta hasta que decidas activarla."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEstadoActivo((v) => !v)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  estadoActivo ? "bg-emerald-500" : "bg-slate-300"
                }`}
                aria-label="Alternar estado de activación"
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    estadoActivo ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </SectionAccordion>

        {/* 2. VOCABULARIO INICIAL */}
        <SectionAccordion number="2" title="Vocabulario Inicial" defaultOpen={true}>
          <VocabTable
            items={vocabulario}
            onAdd={(item) => setVocabulario((prev) => [...prev, item])}
            onUpdate={(idx, item) =>
              setVocabulario((prev) =>
                prev.map((current, i) => (i === idx ? item : current)),
              )
            }
            onRemove={(idx) =>
              setVocabulario((prev) => prev.filter((_, i) => i !== idx))
            }
          />
        </SectionAccordion>

        {/* 3. ESTRUCTURA GRAMATICAL */}
        <SectionAccordion number="3" title="Estructura Gramatical" defaultOpen={true}>
          {/* Plantillas Rápidas */}
          <div className="bg-sky-50/80 p-4 rounded-xl border border-sky-100 space-y-2">
            <span className="text-xs font-black text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
              ✨ Plantillas Rápidas (Llená la gramática con 1 clic):
            </span>
            <div className="flex flex-wrap gap-2">
              {GRAMMAR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setGramaticaTitulo(preset.titulo);
                    setGramaticaDesc(preset.desc);
                    setFormulaGramatica(preset.formula);
                    setGramaticaColumnas(
                      preset.columnas.map((col) => ({ ...col })),
                    );
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-sky-500 hover:text-white border-2 border-sky-200 text-sky-700 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Título y Descripción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="grammar-title"
                className="text-xs font-bold text-slate-500 uppercase block mb-1.5"
              >
                Título de la Gramática
              </label>
              <input
                id="grammar-title"
                type="text"
                maxLength={150}
                value={gramaticaTitulo}
                onChange={(e) => setGramaticaTitulo(e.target.value)}
                placeholder="ej: PRESENT SIMPLE"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base font-extrabold uppercase outline-none focus:border-sky-500 bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="grammar-desc"
                className="text-xs font-bold text-slate-500 uppercase block mb-1.5"
              >
                Descripción de la Gramática
              </label>
              <input
                id="grammar-desc"
                type="text"
                value={gramaticaDesc}
                onChange={(e) => setGramaticaDesc(e.target.value)}
                placeholder="ej: Rutinas Diarias"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base font-bold outline-none focus:border-sky-500 bg-white"
              />
            </div>
          </div>

          {/* Vista previa mini de la gramática */}
          <div
            className="w-full rounded-[14px] p-4 text-white text-sm"
            style={{
              background:
                "linear-gradient(135deg, #1a8fe3 0%, #0d6bbf 60%, #0a55a0 100%)",
              boxShadow: "0 4px 16px rgba(13, 107, 191, 0.2)",
            }}
          >
            <div className="font-extrabold tracking-wide">
              Grammar Guide: {gramaticaTitulo || "TITLE"}
            </div>
            <div className="text-[10px] text-white/75 mb-3">
              {gramaticaDesc || "Descripción del tema"}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {gramaticaColumnas.map((col, i) => (
                <div
                  key={i}
                  className={
                    i === 2
                      ? "bg-white/12 rounded-[8px] p-2 text-center flex flex-col items-center justify-center gap-1"
                      : "bg-white/12 rounded-[8px] p-2 text-center"
                  }
                >
                  <div className="text-[9px] text-white/70 leading-tight">
                    {col.titulo}
                  </div>
                  <div
                    className={`text-sm font-extrabold ${
                      i === 0 ? "text-[#4dff6e]" : "text-[#ffe44d]"
                    }`}
                  >
                    {col.verbo}
                  </div>
                  <div className="text-[8px] text-white/65 whitespace-pre-line">
                    {col.nota}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor de columnas */}
          <DetailsCollapsible
            title="📊 Personalizar Columnas de la Tarjeta (Opcional)"
            count={0}
          >
            <div className="space-y-4">
              {gramaticaColumnas.map((col, i) => (
                <div
                  key={i}
                  className="p-3 border border-slate-200 rounded-xl bg-white space-y-2.5"
                >
                  <span className="text-xs font-black text-sky-600 uppercase tracking-wider">
                    Columna {i + 1}
                    {i === 0
                      ? " — I/You/We/They"
                      : i === 1
                        ? " — He/She/It"
                        : " — Fórmula"}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        Título
                      </label>
                      <input
                        type="text"
                        value={col.titulo}
                        onChange={(e) => {
                          const updated = [...gramaticaColumnas];
                          updated[i] = { ...updated[i], titulo: e.target.value };
                          setGramaticaColumnas(updated);
                        }}
                        className="w-full px-2.5 py-2 border-2 border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-sky-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        Verbo / Etiqueta
                      </label>
                      <input
                        type="text"
                        value={col.verbo}
                        onChange={(e) => {
                          const updated = [...gramaticaColumnas];
                          updated[i] = { ...updated[i], verbo: e.target.value };
                          setGramaticaColumnas(updated);
                        }}
                        className="w-full px-2.5 py-2 border-2 border-slate-200 rounded-lg text-sm font-mono font-bold outline-none focus:border-sky-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        Nota
                      </label>
                      <input
                        type="text"
                        value={col.nota ?? ""}
                        onChange={(e) => {
                          const updated = [...gramaticaColumnas];
                          updated[i] = { ...updated[i], nota: e.target.value };
                          setGramaticaColumnas(updated);
                        }}
                        className="w-full px-2.5 py-2 border-2 border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-sky-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DetailsCollapsible>

          {/* Fórmula Gramatical con Asistente Rápido */}
          <div className="space-y-2">
            <label
              htmlFor="grammar-formula"
              className="block text-base md:text-lg font-bold text-slate-700"
            >
              Fórmula Gramatical general <span className="text-rose-500">*</span>
            </label>
            <input
              id="grammar-formula"
              type="text"
              required
              maxLength={100}
              value={formulaGramatica}
              onChange={(e) => setFormulaGramatica(e.target.value)}
              placeholder="ej: Subject + Verb (-s/-es) + Complement"
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl text-base md:text-lg font-bold font-mono outline-none focus:border-sky-500 text-sky-700 bg-sky-50/20 transition-colors shadow-xs"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Insertar bloque rápido:
              </span>
              {FORMULA_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    const current = formulaGramatica.trim();
                    const nextVal = current ? `${current} + ${chip}` : chip;
                    setFormulaGramatica(nextVal);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  +{chip}
                </button>
              ))}
            </div>
          </div>

          {/* Ejemplo Práctico Interactivo */}
          <GrammarExampleSection
            ejemploOracion={ejemploOracion}
            ejemploRoles={ejemploRoles}
            onChangeOracion={(oracion, roles) => {
              setEjemploOracion(oracion);
              setEjemploRoles(roles);
            }}
            onChangeRoles={setEjemploRoles}
          />
        </SectionAccordion>

        {error && (
          <div className="bg-rose-50 border-2 border-rose-200 text-rose-600 rounded-xl p-3.5 text-sm font-bold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 rounded-xl p-3.5 text-sm font-bold flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 font-black rounded-xl text-base md:text-lg tracking-wider cursor-pointer btn-3d-green transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>GUARDANDO...</span>
            </>
          ) : editingLesson ? (
            "ACTUALIZAR LECCIÓN"
          ) : (
            "CREAR LECCIÓN"
          )}
        </button>
      </form>
    </div>
  );
}
