import { supabase } from "./supabase";
import type {
  Gramatica,
  GramaticaColumna,
  Leccion,
  Vocabulario,
} from "../types/database";

/**
 * Capa de acceso a datos de lecciones (HU03 - Yunior, extendido HU04 - Jhermy).
 * Operaciones: listar, guardar (crear/editar), eliminar y activar/desactivar,
 * incluyendo el contenido de vocabulario y gramática por lección.
 * Todas las escrituras validan que la lección pertenezca al docente autenticado.
 */

const TABLE = "leccion";
const TITULO_MAX_LENGTH = 150;

export type VocabularioItem = {
  ingles: string;
  espanol: string;
  categoria: string;
};

export type GramaticaInput = {
  nombre_tema: string;
  explicacion: string;
  formula: string;
  ejemplo: string;
  gramatica_columnas: GramaticaColumna[];
  ejemplo_roles: string[];
};

export type LeccionConContenido = Leccion & {
  vocabulario: VocabularioItem[];
  gramatica: GramaticaInput | null;
};

export type LeccionInput = {
  id?: string;
  titulo: string;
  estado_activo: boolean;
  vocabulario?: VocabularioItem[];
  gramatica?: GramaticaInput;
};

export const DEFAULT_GRAMATICA_TITULO = "PRESENT SIMPLE";
export const DEFAULT_GRAMATICA_DESC = "Rutinas Diarias";
export const DEFAULT_GRAMATICA_FORMULA =
  "Subject + Verb (-s/-es) + Complement";
export const DEFAULT_GRAMATICA_COLUMNAS: GramaticaColumna[] = [
  { titulo: "I / You / We / They", verbo: "PLAY", nota: "Every Saturday" },
  {
    titulo: "He / She / It",
    verbo: "PLAYS",
    nota: "Adds -s / -es\ne.g. works, studies",
  },
  {
    titulo: "FORMULA",
    verbo: "S + Verb(-s) + Complement",
    nota: "e.g. She eats an apple.",
  },
];

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

/**
 * Lista las lecciones de un docente junto con su vocabulario y gramática,
 * ordenadas por fecha de creación.
 */
export async function fetchLecciones(
  docenteId: number,
): Promise<LeccionConContenido[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id_docente", docenteId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching lecciones:", error);
    throw new Error("No se pudieron cargar las lecciones.");
  }

  const lecciones = (data ?? []) as Leccion[];
  if (lecciones.length === 0) {
    return [];
  }

  const ids = lecciones.map((l) => l.id_leccion);

  const [vocabRes, gramRes] = await Promise.all([
    supabase
      .from("vocabulario")
      .select("*")
      .in("id_leccion", ids)
      .order("orden", { ascending: true }),
    supabase.from("gramatica").select("*").in("id_leccion", ids),
  ]);

  let vocabRows: Vocabulario[] = [];
  if (vocabRes.error) {
    console.warn("No se pudo cargar vocabulario (migración pendiente?):", vocabRes.error.message);
  } else {
    vocabRows = (vocabRes.data ?? []) as Vocabulario[];
  }

  let gramRows: Gramatica[] = [];
  if (gramRes.error) {
    console.warn("No se pudo cargar gramática (migración pendiente?):", gramRes.error.message);
  } else {
    gramRows = (gramRes.data ?? []) as Gramatica[];
  }

  const vocabByLesson = new Map<string, VocabularioItem[]>();
  for (const row of vocabRows) {
    const list = vocabByLesson.get(row.id_leccion) ?? [];
    list.push({
      ingles: row.palabra_ingles,
      espanol: row.traduccion_espanol,
      categoria: "Sustantivo",
    });
    vocabByLesson.set(row.id_leccion, list);
  }

  const gramByLesson = new Map<string, GramaticaInput>();
  for (const row of gramRows) {
    gramByLesson.set(row.id_leccion, {
      nombre_tema: row.nombre_tema,
      explicacion: row.explicacion,
      formula: row.formula ?? "",
      ejemplo: row.ejemplo ?? "",
      gramatica_columnas: Array.isArray(row.gramatica_columnas)
        ? row.gramatica_columnas
        : DEFAULT_GRAMATICA_COLUMNAS,
      ejemplo_roles: Array.isArray(row.ejemplo_roles) ? row.ejemplo_roles : [],
    });
  }

  return lecciones.map((leccion) => ({
    ...leccion,
    vocabulario: vocabByLesson.get(leccion.id_leccion) ?? [],
    gramatica: gramByLesson.get(leccion.id_leccion) ?? null,
  }));
}

/**
 * Crea o actualiza una lección y persiste su vocabulario y gramática si se proveen.
 * - Con `id`: actualiza solo si pertenece al docente.
 * - Sin `id`: inserta una nueva lección con un ID único.
 */
export async function saveLeccion(
  input: LeccionInput,
  idDocente: number,
): Promise<Leccion> {
  const titulo = normalizeTitulo(input.titulo);
  const now = new Date().toISOString();

  let savedLeccion: Leccion;

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

    savedLeccion = data as Leccion;
  } else {
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

    savedLeccion = data as Leccion;
  }

  const id = savedLeccion.id_leccion;

  if (input.vocabulario !== undefined) {
    const { error: delVocabError } = await supabase
      .from("vocabulario")
      .delete()
      .eq("id_leccion", id);

    if (delVocabError) {
      console.error("Error clearing vocabulario:", delVocabError);
      throw new Error("No se pudo actualizar el vocabulario de la lección.");
    }

    const validVocab = input.vocabulario.filter((v) => v.ingles.trim() !== "");
    if (validVocab.length > 0) {
      const vocabPayload = validVocab.map((v, idx) => ({
        id_leccion: id,
        palabra_ingles: v.ingles.trim().slice(0, 100),
        traduccion_espanol: (v.espanol.trim() || "—").slice(0, 100),
        url_audio: null,
        orden: idx + 1,
      }));

      const { error: insVocabError } = await supabase
        .from("vocabulario")
        .insert(vocabPayload);

      if (insVocabError) {
        console.error("Error inserting vocabulario:", insVocabError);
        throw new Error("No se pudo guardar el vocabulario de la lección.");
      }
    }
  }

  if (input.gramatica !== undefined) {
    const { error: delGramError } = await supabase
      .from("gramatica")
      .delete()
      .eq("id_leccion", id);

    if (delGramError) {
      console.error("Error clearing gramatica:", delGramError);
      throw new Error("No se pudo actualizar la gramática de la lección.");
    }

    const { error: insGramError } = await supabase.from("gramatica").insert({
      id_leccion: id,
      nombre_tema: (input.gramatica.nombre_tema.trim() || titulo).slice(0, 150),
      explicacion: input.gramatica.explicacion.trim() || "",
      formula: input.gramatica.formula.trim()
        ? input.gramatica.formula.trim().slice(0, 100)
        : null,
      ejemplo: input.gramatica.ejemplo.trim() || null,
      gramatica_columnas: input.gramatica.gramatica_columnas,
      ejemplo_roles: input.gramatica.ejemplo_roles,
    });

    if (insGramError) {
      console.error("Error inserting gramatica:", insGramError);
      throw new Error("No se pudo guardar la gramática de la lección.");
    }
  }

  return savedLeccion;
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
