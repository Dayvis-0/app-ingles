import { useCallback, useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { HeaderBar } from "./ui";
import { LessonForm, LessonList } from "./docente";
import type { LeccionConContenido, LeccionInput } from "../lib/lecciones";
import {
  deleteLeccion,
  fetchLecciones,
  getDocenteIdByUsuario,
  saveLeccion,
  toggleLeccionEstado,
} from "../lib/lecciones";

export default function DocenteView() {
  const { user, logout } = useAuth();
  const [docenteId, setDocenteId] = useState<number | null>(null);
  const [lessons, setLessons] = useState<LeccionConContenido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LeccionConContenido | null>(null);
  const [docenteError, setDocenteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load teacher record and lessons together
  useEffect(() => {
    let isMounted = true;

    async function initDocenteData() {
      if (!user) return;

      try {
        const resolvedId = await getDocenteIdByUsuario(user.idUsuario);
        if (!isMounted) return;

        if (!resolvedId) {
          setDocenteError(
            "Tu usuario no tiene un perfil de docente asignado. Contactá al administrador.",
          );
          setLoading(false);
          return;
        }

        setDocenteId(resolvedId);

        const data = await fetchLecciones(resolvedId);
        if (isMounted) {
          setLessons(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al inicializar datos del docente:", err);
        if (isMounted) {
          setDocenteError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los datos del docente.",
          );
          setLoading(false);
        }
      }
    }

    initDocenteData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const reloadLessons = useCallback(async (currentDocenteId: number) => {
    try {
      const data = await fetchLecciones(currentDocenteId);
      setLessons(data);
    } catch (err) {
      console.error("Error al recargar lecciones:", err);
      setActionError("No se pudo refrescar la lista de lecciones.");
    }
  }, []);

  const handleSave = async (data: LeccionInput) => {
    if (!docenteId) {
      throw new Error("No se encontró el perfil del docente.");
    }

    setActionError(null);
    setIsSaving(true);
    try {
      await saveLeccion(data, docenteId);
      await reloadLessons(docenteId);
      setEditingLesson(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!docenteId) {
      setActionError("No se encontró el perfil del docente.");
      return;
    }

    setActionError(null);
    // Optimistic delete
    setLessons((prev) => prev.filter((l) => l.id_leccion !== id));

    try {
      await deleteLeccion(id, docenteId);
    } catch (err) {
      console.error("Error al eliminar lección:", err);
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la lección.",
      );
      await reloadLessons(docenteId);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    if (!docenteId) {
      setActionError("No se encontró el perfil del docente.");
      return;
    }

    setActionError(null);
    // Optimistic toggle
    setLessons((prev) =>
      prev.map((l) =>
        l.id_leccion === id ? { ...l, estado_activo: !currentStatus } : l,
      ),
    );

    try {
      const newStatus = await toggleLeccionEstado(
        id,
        currentStatus,
        docenteId,
      );
      setLessons((prev) =>
        prev.map((l) =>
          l.id_leccion === id ? { ...l, estado_activo: newStatus } : l,
        ),
      );
    } catch (err) {
      console.error("Error al alternar estado de lección:", err);
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar el estado de la lección.",
      );
      await reloadLessons(docenteId);
    }
  };

  const handleEdit = (lesson: LeccionConContenido) => {
    setActionError(null);
    setEditingLesson(lesson);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingLesson(null);
  };

  const teacherName = user?.nombreCompleto
    ? user.nombreCompleto.toLowerCase().startsWith("prof")
      ? user.nombreCompleto
      : `Prof. ${user.nombreCompleto}`
    : "Docente";

  const header = (
    <HeaderBar
      title="Panel del Docente"
      subtitle={`${teacherName} | UNAJMA - I.E. M.V.A.`}
      onLogout={logout}
      icon="teacher"
    />
  );

  if (docenteError) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        {header}
        <main className="flex-1 flex items-center justify-center p-4">
          <section className="w-full max-w-md bg-white duo-card p-8 shadow-xl flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <h2 className="text-xl font-black text-slate-800">
              No se pudo abrir el panel
            </h2>
            <p className="text-sm font-semibold text-slate-500">
              {docenteError}
            </p>
            <button
              type="button"
              onClick={logout}
              className="mt-3 w-full py-3 font-black rounded-xl tracking-wider cursor-pointer btn-3d-green"
            >
              CERRAR SESIÓN
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {header}

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        {actionError && (
          <div className="lg:col-span-12 bg-rose-50 border-2 border-rose-200 text-rose-600 rounded-xl p-3.5 text-sm font-bold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="flex-1">{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              aria-label="Cerrar aviso"
              className="p-1 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <section className="lg:col-span-7 space-y-8">
          <LessonForm
            key={editingLesson?.id_leccion ?? "new"}
            editingLesson={editingLesson}
            onSave={handleSave}
            onCancelEdit={handleCancelEdit}
            isSaving={isSaving}
          />
        </section>

        <section className="lg:col-span-5 space-y-8 self-start">
          <LessonList
            lessons={lessons}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        </section>
      </main>
    </div>
  );
}
