import { useState } from "react";
import { BookOpen, AlertCircle, Edit3, Trash2 } from "lucide-react";
import type { LeccionConContenido } from "../../lib/lecciones";
import { ModalConfirm } from "../ui";

interface LessonListProps {
  lessons: LeccionConContenido[];
  loading: boolean;
  onEdit: (lesson: LeccionConContenido) => void;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, currentStatus: boolean) => Promise<void>;
}

export default function LessonList({
  lessons,
  loading,
  onEdit,
  onDelete,
  onToggle,
}: LessonListProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTargetId || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTargetId);
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="bg-white rounded-[18px] p-5 md:p-6 w-full shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
        <h4 className="text-base md:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-500" />
          Lecciones Disponibles
        </h4>
        <span className="text-xs md:text-sm bg-sky-50 text-[#1cb0f6] font-extrabold px-3 py-1 rounded-xl border border-sky-100">
          {lessons.length} {lessons.length === 1 ? "tema" : "temas"}
        </span>
      </div>

      <div className="space-y-3.5">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-2xl border-2 border-slate-200 bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-6 bg-slate-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-48" />
                    <div className="h-3 bg-slate-200 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <AlertCircle className="w-10 h-10 stroke-[1.5] mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm">No hay lecciones en la base de datos.</p>
            <p className="text-xs text-slate-400 mt-1">
              Usá el formulario de la izquierda para crear una.
            </p>
          </div>
        ) : (
          lessons.map((les) => {
            const isActive = les.estado_activo;
            return (
              <div
                key={les.id_leccion}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? "bg-emerald-50/20 border-emerald-300 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggle(les.id_leccion, les.estado_activo)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                    title={isActive ? "Desactivar lección" : "Activar lección"}
                    aria-label={isActive ? "Desactivar lección" : "Activar lección"}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5
                        className="text-sm md:text-base font-black text-slate-800 truncate"
                        title={les.titulo}
                      >
                        {les.titulo}
                      </h5>
                      <span
                        className={`text-[10px] md:text-xs font-black uppercase px-2 py-0.5 rounded-lg ${
                          isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isActive ? "Activa" : "Inactiva"}
                      </span>
                      {les.vocabulario.length > 0 && (
                        <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                          {les.vocabulario.length}{" "}
                          {les.vocabulario.length === 1 ? "palabra" : "palabras"}
                        </span>
                      )}
                    </div>
                    {les.gramatica?.formula ? (
                      <p className="text-xs md:text-sm text-slate-500 font-medium truncate mt-1">
                        <b>Estructura:</b> {les.gramatica.formula}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                        ID: {les.id_leccion}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEdit(les)}
                    className="text-sky-500 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 p-2.5 rounded-xl border border-sky-100 transition-colors cursor-pointer"
                    title="Editar Lección"
                    aria-label="Editar lección"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(les.id_leccion)}
                    className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2.5 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                    title="Eliminar Lección"
                    aria-label="Eliminar lección"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ModalConfirm
        isOpen={deleteTargetId !== null}
        title="Eliminar lección"
        message="¿Estás seguro que deseas eliminar este tema por completo? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        confirmLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
