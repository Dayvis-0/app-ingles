import { supabase } from "./supabase";
import type {
  ConstruccionOracion,
  Evaluacion,
  Gramatica,
  GramaticaColumna,
  Leccion,
  Pregunta,
  Pronunciacion,
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
  oraciones: OracionItem[];
  pronunciaciones: PronunciacionItem[];
  preguntas: PreguntaItem[];
};

export type OracionItem = {
  espanol: string;
  ingles: string;
};

export type PronunciacionItem = {
  ingles: string;
};

export type PreguntaItem = {
  enunciado: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  respuesta_correcta: "A" | "B" | "C" | "D";
};

export type LeccionInput = {
  id?: string;
  titulo: string;
  estado_activo: boolean;
  vocabulario?: VocabularioItem[];
  gramatica?: GramaticaInput;
  oraciones?: OracionItem[];
  pronunciaciones?: PronunciacionItem[];
  preguntas?: PreguntaItem[];
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

async function hydrateLeccionesContenido(
  lecciones: Leccion[],
): Promise<LeccionConContenido[]> {
  if (lecciones.length === 0) {
    return [];
  }

  const ids = lecciones.map((l) => l.id_leccion);

  const [vocabRes, gramRes, oracRes, pronRes, evalRes] = await Promise.all([
    supabase
      .from("vocabulario")
      .select("*")
      .in("id_leccion", ids)
      .order("orden", { ascending: true }),
    supabase.from("gramatica").select("*").in("id_leccion", ids),
    supabase
      .from("construccion_oracion")
      .select("*")
      .in("id_leccion", ids)
      .order("orden", { ascending: true }),
    supabase
      .from("pronunciacion")
      .select("*")
      .in("id_leccion", ids)
      .order("orden", { ascending: true }),
    supabase.from("evaluacion").select("*").in("id_leccion", ids),
  ]);

  let vocabRows: Vocabulario[] = [];
  if (vocabRes.error) {
    console.warn(
      "No se pudo cargar vocabulario (migración pendiente?):",
      vocabRes.error.message,
    );
  } else {
    vocabRows = (vocabRes.data ?? []) as Vocabulario[];
  }

  let gramRows: Gramatica[] = [];
  if (gramRes.error) {
    console.warn(
      "No se pudo cargar gramática (migración pendiente?):",
      gramRes.error.message,
    );
  } else {
    gramRows = (gramRes.data ?? []) as Gramatica[];
  }

  let oracRows: ConstruccionOracion[] = [];
  if (oracRes.error) {
    console.warn(
      "No se pudieron cargar oraciones (migración pendiente?):",
      oracRes.error.message,
    );
  } else {
    oracRows = (oracRes.data ?? []) as ConstruccionOracion[];
  }

  let pronRows: Pronunciacion[] = [];
  if (pronRes.error) {
    console.warn(
      "No se pudo cargar pronunciación (migración pendiente?):",
      pronRes.error.message,
    );
  } else {
    pronRows = (pronRes.data ?? []) as Pronunciacion[];
  }

  let evalRows: Evaluacion[] = [];
  if (evalRes.error) {
    console.warn(
      "No se pudo cargar la evaluación (migración pendiente?):",
      evalRes.error.message,
    );
  } else {
    evalRows = (evalRes.data ?? []) as Evaluacion[];
  }

  let questionRows: Pregunta[] = [];
  if (evalRows.length > 0) {
    const evalIds = evalRows.map((e) => e.id_evaluacion);
    const { data: questionData, error: questionError } = await supabase
      .from("pregunta")
      .select("*")
      .in("id_evaluacion", evalIds)
      .order("orden", { ascending: true });

    if (questionError) {
      console.warn(
        "No se pudieron cargar las preguntas (migración pendiente?):",
        questionError.message,
      );
    } else {
      questionRows = (questionData ?? []) as Pregunta[];
    }
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

  const oracByLesson = new Map<string, OracionItem[]>();
  for (const row of oracRows) {
    const list = oracByLesson.get(row.id_leccion) ?? [];
    list.push({
      espanol: row.oracion_espanol,
      ingles: row.respuesta_correcta,
    });
    oracByLesson.set(row.id_leccion, list);
  }

  const pronByLesson = new Map<string, PronunciacionItem[]>();
  for (const row of pronRows) {
    const list = pronByLesson.get(row.id_leccion) ?? [];
    list.push({ ingles: row.oracion_ingles });
    pronByLesson.set(row.id_leccion, list);
  }

  const lessonIdByEvaluacion = new Map<number, string>();
  for (const row of evalRows) {
    lessonIdByEvaluacion.set(row.id_evaluacion, row.id_leccion);
  }

  const preguntasByLesson = new Map<string, PreguntaItem[]>();
  for (const row of questionRows) {
    const idLeccion = lessonIdByEvaluacion.get(row.id_evaluacion);
    if (!idLeccion) continue;

    const list = preguntasByLesson.get(idLeccion) ?? [];
    list.push({
      enunciado: row.enunciado,
      alternativa_a: row.alternativa_a,
      alternativa_b: row.alternativa_b,
      alternativa_c: row.alternativa_c,
      alternativa_d: row.alternativa_d,
      respuesta_correcta: row.respuesta_correcta,
    });
    preguntasByLesson.set(idLeccion, list);
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
    oraciones: oracByLesson.get(leccion.id_leccion) ?? [],
    pronunciaciones: pronByLesson.get(leccion.id_leccion) ?? [],
    preguntas: preguntasByLesson.get(leccion.id_leccion) ?? [],
  }));
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

  return hydrateLeccionesContenido((data ?? []) as Leccion[]);
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

  if (input.oraciones !== undefined) {
    const { error: delOracError } = await supabase
      .from("construccion_oracion")
      .delete()
      .eq("id_leccion", id);

    if (delOracError) {
      console.error("Error clearing construccion_oracion:", delOracError);
      throw new Error("No se pudieron actualizar las oraciones de la lección.");
    }

    const validOraciones = input.oraciones.filter(
      (o) => o.espanol.trim() !== "" && o.ingles.trim() !== "",
    );

    if (validOraciones.length > 0) {
      const oracPayload = validOraciones.map((o, idx) => ({
        id_leccion: id,
        oracion_espanol: o.espanol.trim(),
        respuesta_correcta: o.ingles.trim(),
        orden: idx + 1,
      }));

      const { error: insOracError } = await supabase
        .from("construccion_oracion")
        .insert(oracPayload);

      if (insOracError) {
        console.error("Error inserting construccion_oracion:", insOracError);
        throw new Error("No se pudieron guardar las oraciones de la lección.");
      }
    }
  }

  if (input.pronunciaciones !== undefined) {
    const { error: delPronError } = await supabase
      .from("pronunciacion")
      .delete()
      .eq("id_leccion", id);

    if (delPronError) {
      console.error("Error clearing pronunciacion:", delPronError);
      throw new Error(
        "No se pudieron actualizar las pronunciaciones de la lección.",
      );
    }

    const validPronunciaciones = input.pronunciaciones.filter(
      (p) => p.ingles.trim() !== "",
    );

    if (validPronunciaciones.length > 0) {
      const pronPayload = validPronunciaciones.map((p, idx) => ({
        id_leccion: id,
        oracion_ingles: p.ingles.trim(),
        orden: idx + 1,
      }));

      const { error: insPronError } = await supabase
        .from("pronunciacion")
        .insert(pronPayload);

      if (insPronError) {
        console.error("Error inserting pronunciacion:", insPronError);
        throw new Error(
          "No se pudieron guardar las pronunciaciones de la lección.",
        );
      }
    }
  }

  if (input.preguntas !== undefined) {
    const { data: evalRow, error: evalSelectError } = await supabase
      .from("evaluacion")
      .select("id_evaluacion")
      .eq("id_leccion", id)
      .maybeSingle();

    if (evalSelectError) {
      console.error("Error fetching evaluacion:", evalSelectError);
      throw new Error("No se pudo verificar la evaluación de la lección.");
    }

    let idEvaluacion: number | null = evalRow?.id_evaluacion ?? null;

    if (idEvaluacion === null) {
      const { data: evalInserted, error: evalInsertError } = await supabase
        .from("evaluacion")
        .insert({ id_leccion: id })
        .select("id_evaluacion")
        .single();

      if (evalInsertError) {
        console.error("Error inserting evaluacion:", evalInsertError);
        throw new Error("No se pudo crear la evaluación de la lección.");
      }

      idEvaluacion = (evalInserted as Evaluacion).id_evaluacion;
    }

    const { error: delPregError } = await supabase
      .from("pregunta")
      .delete()
      .eq("id_evaluacion", idEvaluacion);

    if (delPregError) {
      console.error("Error clearing pregunta:", delPregError);
      throw new Error("No se pudieron actualizar las preguntas de la lección.");
    }

    const validPreguntas = input.preguntas.filter(
      (p) =>
        p.enunciado.trim() !== "" &&
        p.alternativa_a.trim() !== "" &&
        p.alternativa_b.trim() !== "" &&
        p.alternativa_c.trim() !== "" &&
        p.alternativa_d.trim() !== "",
    );

    if (validPreguntas.length > 0) {
      const pregPayload = validPreguntas.map((p, idx) => ({
        id_evaluacion: idEvaluacion,
        enunciado: p.enunciado.trim(),
        alternativa_a: p.alternativa_a.trim().slice(0, 100),
        alternativa_b: p.alternativa_b.trim().slice(0, 100),
        alternativa_c: p.alternativa_c.trim().slice(0, 100),
        alternativa_d: p.alternativa_d.trim().slice(0, 100),
        respuesta_correcta: p.respuesta_correcta,
        orden: idx + 1,
      }));

      const { error: insPregError } = await supabase
        .from("pregunta")
        .insert(pregPayload);

      if (insPregError) {
        console.error("Error inserting pregunta:", insPregError);
        throw new Error("No se pudieron guardar las preguntas de la lección.");
      }
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

/**
 * Obtiene una lección activa por su ID junto con su vocabulario y gramática
 * para el recorrido guiado de 5 etapas (HU06 - Jhermy).
 */
export async function fetchLeccionById(
  idLeccion: string,
): Promise<LeccionConContenido | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id_leccion", idLeccion)
    .eq("estado_activo", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching leccion by id:", error);
    throw new Error("No se pudo cargar la lección seleccionada.");
  }

  if (!data) {
    return null;
  }

  const [hydrated] = await hydrateLeccionesContenido([data as Leccion]);
  return hydrated ?? null;
}

