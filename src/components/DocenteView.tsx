import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { HeaderBar } from "./ui";
import { LessonForm, LessonList } from "./docente";
import type { Leccion } from "../types/database";
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
  const [lessons, setLessons] = useState<Leccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Leccion | null>(null);

  // Load teacher record and lessons together
  useEffect(() => {
    let isMounted = true;

    async function initDocenteData() {
      if (!user) return;
      try {
        const resolvedId = (await getDocenteIdByUsuario(user.idUsuario)) ?? 1;
        if (!isMounted) return;
        setDocenteId(resolvedId);

        const data = await fetchLecciones(resolvedId);
        if (isMounted) {
          setLessons(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al inicializar datos del docente:", err);
        if (isMounted) setLoading(false);
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
    }
  }, []);

  const handleSave = async (data: { id?: string; titulo: string; estado_activo: boolean }) => {
    const activeDocenteId = docenteId ?? 1;
    setIsSaving(true);
    try {
      await saveLeccion(data, activeDocenteId);
      await reloadLessons(activeDocenteId);
      setEditingLesson(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const activeDocenteId = docenteId ?? 1;
    // Optimistic delete
    setLessons((prev) => prev.filter((l) => l.id_leccion !== id));
    try {
      await deleteLeccion(id);
    } catch (err) {
      console.error("Error al eliminar lección:", err);
      await reloadLessons(activeDocenteId);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const activeDocenteId = docenteId ?? 1;
    // Optimistic toggle
    setLessons((prev) =>
      prev.map((l) =>
        l.id_leccion === id ? { ...l, estado_activo: !currentStatus } : l,
      ),
    );
    try {
      await toggleLeccionEstado(id, currentStatus);
    } catch (err) {
      console.error("Error al alternar estado de lección:", err);
      await reloadLessons(activeDocenteId);
    }
  };

  const handleEdit = (lesson: Leccion) => {
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <HeaderBar
        title="Panel del Docente"
        subtitle={`${teacherName} | UNAJMA - I.E. M.V.A.`}
        onLogout={logout}
        icon="teacher"
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
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
