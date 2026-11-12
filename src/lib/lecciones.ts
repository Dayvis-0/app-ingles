import { supabase } from "./supabase";
import type { Leccion } from "../types/database";

/**
 * Resolves the id_docente associated with a given id_usuario.
 */
export async function getDocenteIdByUsuario(idUsuario: number): Promise<number | null> {
  const { data, error } = await supabase
    .from("docente")
    .select("id_docente")
    .eq("id_usuario", idUsuario)
    .maybeSingle();

  if (error) {
    console.error("Error fetching docente id:", error);
    return null;
  }

  return data?.id_docente ?? null;
}

/**
 * Fetches all lessons for the docente or all lessons ordered by created_at.
 */
export async function fetchLecciones(docenteId?: number): Promise<Leccion[]> {
  let query = supabase
    .from("leccion")
    .select("*")
    .order("created_at", { ascending: true });

  if (docenteId) {
    query = query.eq("id_docente", docenteId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching lecciones:", error);
    throw error;
  }

  return data ?? [];
}

/**
 * Saves (inserts or updates) a lesson in Supabase.
 */
export async function saveLeccion(
  lesson: { id?: string; titulo: string; estado_activo?: boolean },
  idDocente: number,
): Promise<Leccion> {
  const isUpdate = Boolean(lesson.id);
  const idLeccion = lesson.id || `lesson_${Date.now()}`;
  const now = new Date().toISOString();

  const payload: Partial<Leccion> = {
    id_leccion: idLeccion,
    id_docente: idDocente,
    titulo: lesson.titulo.trim(),
    estado_activo: lesson.estado_activo ?? false,
    updated_at: now,
  };

  if (!isUpdate) {
    payload.created_at = now;
  }

  const { data, error } = await supabase
    .from("leccion")
    .upsert(payload, { onConflict: "id_leccion" })
    .select("*")
    .single();

  if (error) {
    console.error("Error saving leccion:", error);
    throw error;
  }

  return data as Leccion;
}

/**
 * Deletes a lesson by id.
 */
export async function deleteLeccion(idLeccion: string): Promise<void> {
  const { error } = await supabase
    .from("leccion")
    .delete()
    .eq("id_leccion", idLeccion);

  if (error) {
    console.error("Error deleting leccion:", error);
    throw error;
  }
}

/**
 * Toggles the active status of a lesson.
 */
export async function toggleLeccionEstado(
  idLeccion: string,
  currentStatus: boolean,
): Promise<boolean> {
  const newStatus = !currentStatus;
  const { error } = await supabase
    .from("leccion")
    .update({ estado_activo: newStatus, updated_at: new Date().toISOString() })
    .eq("id_leccion", idLeccion);

  if (error) {
    console.error("Error toggling leccion estado:", error);
    throw error;
  }

  return newStatus;
}
