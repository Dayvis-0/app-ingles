import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, GraduationCap, RotateCcw } from "lucide-react";
import { HeaderBar } from "./ui";
import { useAuth } from "../context/AuthContext";
import { fetchLeccionesActivas } from "../lib/lecciones";
import type { Leccion } from "../types/database";

type LoadState = "loading" | "error" | "ready";

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatFechaCreacion(leccion: Leccion): string {
  const date = new Date(leccion.created_at);
  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }
  return `Creada el ${dateFormatter.format(date)}`;
}

export default function EstudianteView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initial state is "loading", so the mount effect never sets state synchronously.
  // Shape mirrors DocenteView: inner async function, all setState calls after await.
  useEffect(() => {
    let isMounted = true;

    async function loadLecciones() {
      try {
        const data = await fetchLeccionesActivas();
        if (!isMounted) return;
        setLecciones(data);
        setLoadState("ready");
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado al cargar las lecciones.",
        );
        setLoadState("error");
      }
    }

    void loadLecciones();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetry = () => {
    setLoadState("loading");
    setErrorMessage(null);

    void fetchLeccionesActivas()
      .then((data) => {
        setLecciones(data);
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado al cargar las lecciones.",
        );
        setLoadState("error");
      });
  };

  const header = (
    <HeaderBar
      icon="student"
      title={user?.nombreCompleto ?? "Estudiante"}
      subtitle="Estudiante de Manuel Vivanco Altamirano"
      onLogout={logout}
    />
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f7]">
      {header}

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col justify-start space-y-8">
        <div className="bg-gradient-to-r from-[#1cb0f6] to-[#1489da] text-white p-6 md:p-8 rounded-3xl shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 text-center md:text-left relative z-10">
            <span className="bg-yellow-400 text-slate-900 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
              IDIOMA-INGLES
            </span>
            <h4 className="text-3xl font-black">Aprende Hablando e Interactuando</h4>
            <p className="text-white/80 font-semibold text-sm max-w-lg">
              Estudia la teoría visual, traduce oraciones usando bloques y habla en inglés directo
              a tu micrófono para que el software autocalifique.
            </p>
          </div>
          <GraduationCap className="w-24 h-24 text-white/20 shrink-0 select-none absolute right-4 bottom-0 mr-4" />
        </div>

        <div>
          <h5 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-3">
            Tus Lecciones Activas
          </h5>

          {loadState === "loading" && (
            <div className="duo-card p-8 text-center bg-white border-2 border-slate-200 animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-3" />
              <div className="h-5 bg-slate-200 rounded w-48 mx-auto mb-2" />
              <div className="h-4 bg-slate-200 rounded w-64 mx-auto" />
            </div>
          )}

          {loadState === "error" && (
            <div className="duo-card p-8 text-center bg-white border-2 border-slate-200">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h4 className="text-xl font-bold text-slate-700">
                No se pudieron cargar las lecciones
              </h4>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">{errorMessage}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-4 py-3 px-6 font-black uppercase tracking-wider rounded-xl cursor-pointer btn-3d-blue inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> REINTENTAR
              </button>
            </div>
          )}

          {loadState === "ready" && lecciones.length === 0 && (
            <div className="duo-card p-8 text-center bg-white border-2 border-slate-200">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h4 className="text-xl font-bold text-slate-700">No hay lecciones asignadas</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                El docente aún no ha habilitado ninguna lección de manera activa en el sistema.
              </p>
            </div>
          )}

          {loadState === "ready" && lecciones.length > 0 && (
            <div className="flex flex-col gap-4">
              {lecciones.map((leccion) => (
                <div
                  key={leccion.id_leccion}
                  className="duo-card p-6 md:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 hover:shadow-lg transition-all"
                >
                  <div className="space-y-3 flex-1 text-left">
                    <span className="bg-[#58cc02] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                      LECCIÓN ACTIVA
                    </span>
                    <h4 className="text-2xl font-black text-slate-800">{leccion.titulo}</h4>
                    <p className="text-xs text-slate-400 font-bold">
                      {formatFechaCreacion(leccion)}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/estudiante/leccion/${leccion.id_leccion}/vocabulario`)
                      }
                      className="py-5 px-10 text-xl font-black uppercase tracking-wider rounded-2xl w-full md:w-auto btn-3d-green cursor-pointer"
                    >
                      EMPEZAR LECCIÓN
                    </button>
                    <p className="text-[10px] text-slate-400 font-bold">
                      Recorrido guiado de 5 etapas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
