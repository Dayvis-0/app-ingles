import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

type SupabaseProbe = {
  status: "probing" | "ok" | "error";
  detail: string;
};

/** Pantalla temporal del Sprint 1 (Dayvis).
 *  Solo verifica: Tailwind activo + conexión a Supabase sin explotar.
 *  Se reemplaza por el login real (tarea de Yunior/Dayvis del Sprint 1). */
function App() {
  const [probe, setProbe] = useState<SupabaseProbe>({
    status: "probing",
    detail: "Consultando supabase.auth.getSession()...",
  });

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ error }) => {
        if (error) {
          setProbe({ status: "error", detail: error.message });
        } else {
          setProbe({
            status: "ok",
            detail: "Conexión OK. Session = null (todavía no hay usuarios logueados).",
          });
        }
      })
      .catch((e: unknown) => {
        setProbe({
          status: "error",
          detail: e instanceof Error ? e.message : String(e),
        });
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-50 flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-black text-emerald-400">
        app-ingles · Sprint 1
      </h1>

      <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md text-center">
        <p className="text-sm text-slate-400 mb-2">
          Tailwind activo (fondo oscuro + tarjeta) y conexión Supabase:
        </p>
        <p
          className={
            probe.status === "ok"
              ? "text-emerald-400 font-bold"
              : probe.status === "error"
                ? "text-red-400 font-bold"
                : "text-slate-300 font-bold animate-pulse"
          }
        >
          {probe.status === "probing" && "⏳ probando..."}
          {probe.status === "ok" && "✅ Supabase conectado"}
          {probe.status === "error" && "❌ Error de Supabase"}
        </p>
        <p className="text-xs text-slate-500 mt-3 break-words">{probe.detail}</p>
      </section>
    </main>
  );
}

export default App;
