/**
 * Definiciones de tipos TypeScript para el modelo de datos de Supabase.
 * Tarea: HU01 - Tablas de usuarios, estudiantes y lecciones.
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

export type RolUsuario = 'docente' | 'estudiante' | 'ninguno';

export interface SesionUsuario {
  usuario: Usuario;
  rol: RolUsuario;
  id_docente?: number;
  id_estudiante?: number;
}
