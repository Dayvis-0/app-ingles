import { useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type FieldErrors = { username?: string; password?: string };

/**
 * LoginView — autentica contra la tabla usuario (nombre_usuario + contrasena)
 * y resuelve el rol por pertenencia a docente / estudiante.
 * Estilo visual: tarjeta Duolingo del proyecto original (duo-card + btn-3d-green).
 */
export default function LoginView() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const uname = username.trim();
    const pass = password;

    if (!uname) errors.username = "Ingresá tu usuario";
    else if (uname.length > 50) errors.username = "Máximo 50 caracteres";

    if (!pass) errors.password = "Ingresá tu contraseña";
    else if (pass.length > 100) errors.password = "Máximo 100 caracteres";

    return errors;
  };

  const handleLoginSubmit = async (e?: FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    const result = await login(username.trim(), password);
    setSubmitting(false);

    if (!result.ok) {
      setLoginError(result.message ?? "Usuario o contraseña incorrectos");
    }
  };

  const inputClasses =
    "w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl text-base font-bold text-[#3c3c3c] outline-none focus:border-emerald-500 transition-colors";

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white duo-card p-8 shadow-xl">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3">
            I.E. Manuel Vivanco Altamirano
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#3c3c3c]">
            Learn English
          </h1>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-5" noValidate>

          <div>
            <label htmlFor="username" className="block text-sm font-bold text-[#3c3c3c] mb-2 uppercase tracking-wide">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu usuario"
              maxLength={50}
              className={inputClasses}
            />
            {fieldErrors.username && (
              <p className="mt-1.5 text-xs font-bold text-red-500">{fieldErrors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-[#3c3c3c] mb-2 uppercase tracking-wide">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                maxLength={100}
                className={`${inputClasses} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#afafaf] hover:text-[#3c3c3c] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-xs font-bold text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          {loginError && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-xl p-3 text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 font-black rounded-xl text-lg tracking-wider cursor-pointer btn-3d-green"
          >
            {submitting ? "INGRESANDO..." : "INGRESAR"}
          </button>

        </form>

        <div className="mt-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
          UNAJMA
        </div>

      </div>
    </main>
  );
}
