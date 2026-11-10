import { supabase } from "./supabase";

export type AuthRole = "docente" | "estudiante";

export type AuthUser = {
  idUsuario: number;
  nombreCompleto: string;
  nombreUsuario: string;
};

export type SignInResult = {
  user: AuthUser;
  role: AuthRole;
} | null;

/**
 * Authenticates a user against the `usuario` table by username + password
 * (plain-text comparison, team decision for the course project), then
 * determines the role by membership in the `docente` / `estudiante` tables.
 * Returns null when the credentials do not match any user.
 */
export async function signInWithCredentials(
  username: string,
  password: string,
): Promise<SignInResult> {
  const { data: matched, error } = await supabase
    .from("usuario")
    .select("id_usuario, nombre_completo, nombre_usuario, contrasena")
    .eq("nombre_usuario", username)
    .eq("contrasena", password)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!matched) {
    return null;
  }

  const { data: docente, error: docenteError } = await supabase
    .from("docente")
    .select("id_docente")
    .eq("id_usuario", matched.id_usuario)
    .maybeSingle();

  if (docenteError) {
    throw docenteError;
  }

  if (docente) {
    return {
      user: {
        idUsuario: matched.id_usuario,
        nombreCompleto: matched.nombre_completo,
        nombreUsuario: matched.nombre_usuario,
      },
      role: "docente",
    };
  }

  const { data: estudiante, error: estudianteError } = await supabase
    .from("estudiante")
    .select("id_estudiante")
    .eq("id_usuario", matched.id_usuario)
    .maybeSingle();

  if (estudianteError) {
    throw estudianteError;
  }

  if (estudiante) {
    return {
      user: {
        idUsuario: matched.id_usuario,
        nombreCompleto: matched.nombre_completo,
        nombreUsuario: matched.nombre_usuario,
      },
      role: "estudiante",
    };
  }

  return null;
}
