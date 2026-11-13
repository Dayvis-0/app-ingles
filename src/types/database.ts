/**
 * Definiciones de tipos TypeScript para el modelo de datos de Supabase.
 * Tareas: HU01 - Usuarios, estudiantes y lecciones.
 *          HU04 - Vocabulario, gramática, construcciones, pronunciación y preguntas.
 * Autor: Yunior
 */

export interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  nombre_usuario: string;
  contrasena?: string;
  created_at: string;
}

export interface Docente {
  id_docente: number;
  id_usuario: number;
  usuario?: Usuario;
}

export interface Estudiante {
  id_estudiante: number;
  id_usuario: number;
  usuario?: Usuario;
}

export interface Leccion {
  id_leccion: string;
  id_docente: number;
  titulo: string;
  estado_activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vocabulario {
  id_vocabulario: number;
  id_leccion: string;
  palabra_ingles: string;
  traduccion_espanol: string;
  url_audio: string | null;
  orden: number;
}

/** Columna de la tabla visual de gramática (JSONB). */
export interface GramaticaColumna {
  titulo: string;
  verbo: string;
  nota?: string;
}

export interface Gramatica {
  id_gramatica: number;
  id_leccion: string;
  nombre_tema: string;
  explicacion: string;
  formula: string | null;
  ejemplo: string | null;
  gramatica_columnas: GramaticaColumna[];
  ejemplo_roles: string[];
}

export interface ConstruccionOracion {
  id_construccion: number;
  id_leccion: string;
  oracion_espanol: string;
  respuesta_correcta: string;
  orden: number;
}

export interface PalabraConstruccion {
  id_palabra: number;
  id_construccion: number;
  palabra: string;
  orden_correcto: number;
}

export interface Pronunciacion {
  id_pronunciacion: number;
  id_leccion: string;
  oracion_ingles: string;
  orden: number;
}

export interface Evaluacion {
  id_evaluacion: number;
  id_leccion: string;
}

export type RespuestaCorrecta = 'A' | 'B' | 'C' | 'D';

export interface Pregunta {
  id_pregunta: number;
  id_evaluacion: number;
  enunciado: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  respuesta_correcta: RespuestaCorrecta;
  orden: number;
}

export type RolUsuario = 'docente' | 'estudiante' | 'ninguno';

export interface SesionUsuario {
  usuario: Usuario;
  rol: RolUsuario;
  id_docente?: number;
  id_estudiante?: number;
}
