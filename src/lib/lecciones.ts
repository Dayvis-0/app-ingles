import { supabase } from "./supabase";
import type { Leccion } from "../types/database";

/**
 * Capa de acceso a datos de lecciones (HU03 - Yunior).
 * Operaciones: listar, guardar (crear/editar), eliminar y activar/desactivar.
 * Todas las escrituras validan que la lección pertenezca al docente autenticado.
 */

const TABLE = "leccion";
const TITULO_MAX_LENGTH = 150;

export type LeccionInput = {
  id?: string;
  titulo: string;
  estado_activo: boolean;
};

function normalizeTitulo(titulo: string): string {
  const value = titulo.trim();

  if (!value) {
    throw new Error("El título de la lección es obligatorio.");
  }

  if (value.length > TITULO_MAX_LENGTH) {
    throw new Error(
      `El título no puede superar los ${TITULO_MAX_LENGTH} caracteres.`,
    );
  }

  return value;
}

function newLeccionId(): string {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return `lesson_${uuid}`;
}

/**
 * Resuelve el id_docente asociado a un usuario autenticado.
 * Devuelve null cuando el usuario no tiene perfil de docente.
 */
export async function getDocenteIdByUsuario(
  idUsuario: number,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("docente")
    .select("id_docente")
    .eq("id_usuario", idUsuario)
    .maybeSingle();

  if (error) {
    console.error("Error fetching docente id:", error);
    throw new Error("No se pudo verificar el perfil del docente.");
  }

  return data?.id_docente ?? null;
}

/** Lista las lecciones de un docente, ordenadas por fecha de creación. */
export async function fetchLecciones(docenteId: number): Promise<Leccion[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id_docente", docenteId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching lecciones:", error);
    throw new Error("No se pudieron cargar las lecciones.");
  }

  return data ?? [];
}

/**
 * Crea o actualiza una lección.
 * - Con `id`: actualiza solo si pertenece al docente.
 * - Sin `id`: inserta una nueva lección con un ID único.
 */
export async function saveLeccion(
  input: LeccionInput,
  idDocente: number,
): Promise<Leccion> {
  const titulo = normalizeTitulo(input.titulo);
  const now = new Date().toISOString();

  if (input.id) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        titulo,
        estado_activo: input.estado_activo,
        updated_at: now,
      })
      .eq("id_leccion", input.id)
      .eq("id_docente", idDocente)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating leccion:", error);
      throw new Error("No se pudo actualizar la lección.");
    }

    return data as Leccion;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      id_leccion: newLeccionId(),
      id_docente: idDocente,
      titulo,
      estado_activo: input.estado_activo,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error inserting leccion:", error);
    throw new Error("No se pudo crear la lección.");
  }

  return data as Leccion;
}

/** Elimina una lección del docente autenticado. */
export async function deleteLeccion(
  idLeccion: string,
  idDocente: number,
): Promise<void> {
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id_leccion", idLeccion)
    .eq("id_docente", idDocente)
    .select("id_leccion");

  if (error) {
    console.error("Error deleting leccion:", error);
    throw new Error("No se pudo eliminar la lección.");
  }

  if (!data || data.length === 0) {
    throw new Error("La lección no existe o no pertenece a tu usuario.");
  }
}

/**
 * Activa o desactiva una lección invirtiendo su estado actual.
 * Devuelve el nuevo estado guardado en la base de datos.
 */
export async function toggleLeccionEstado(
  idLeccion: string,
  currentStatus: boolean,
  idDocente: number,
): Promise<boolean> {
  const newStatus = !currentStatus;

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      estado_activo: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id_leccion", idLeccion)
    .eq("id_docente", idDocente)
    .select("estado_activo")
    .single();

  if (error) {
    console.error("Error toggling leccion estado:", error);
    throw new Error("No se pudo cambiar el estado de la lección.");
  }

  return Boolean(data?.estado_activo);
}

/**
 * Lista todas las lecciones activas del sistema (HU05 - Dayvis).
 * El estudiante visualiza lecciones de cualquier docente con estado_activo = true.
 */
export async function fetchLeccionesActivas(): Promise<Leccion[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("estado_activo", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching lecciones activas:", error);
    throw new Error("No se pudieron cargar las lecciones.");
  }

  return data ?? [];
}
