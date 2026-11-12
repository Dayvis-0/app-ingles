import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, CheckCircle, RotateCcw } from "lucide-react";
import type { Leccion } from "../../types/database";

interface LessonFormProps {
  editingLesson: Leccion | null;
  onSave: (data: { id?: string; titulo: string; estado_activo: boolean }) => Promise<void>;
  onCancelEdit: () => void;
  isSaving: boolean;
}

export default function LessonForm({
  editingLesson,
  onSave,
  onCancelEdit,
  isSaving,
}: LessonFormProps) {
  const [titulo, setTitulo] = useState(editingLesson?.titulo ?? "");
  const [estadoActivo, setEstadoActivo] = useState(editingLesson?.estado_activo ?? false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [success]);

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

    try {
      await onSave({
        id: editingLesson ? editingLesson.id_leccion : undefined,
        titulo: trimmedTitulo,
        estado_activo: estadoActivo,
      });

      setSuccess(
        editingLesson
          ? "¡Lección actualizada con éxito!"
          : "¡Nueva lección creada con éxito!",
      );

      if (!editingLesson) {
        setTitulo("");
        setEstadoActivo(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar la lección";
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
              ? "Modificá los detalles de la lección seleccionada"
              : "Definí el título y estado de la nueva lección"}
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

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                Estado inicial de la lección
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

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 font-black rounded-xl text-base md:text-lg tracking-wider cursor-pointer btn-3d-green transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
