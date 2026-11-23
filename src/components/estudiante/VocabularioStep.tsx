import { Check, CheckCircle2, Volume2 } from "lucide-react";
import type { VocabularioItem } from "../../lib/lecciones";

type VocabularioStepProps = {
  palabras: VocabularioItem[];
  vistos: string[];
  onListen: (palabra: string) => void;
};

export default function VocabularioStep({
  palabras,
  vistos,
  onListen,
}: VocabularioStepProps) {
  const total = palabras.length;
  const escuchadas = palabras.filter((item) =>
    vistos.includes(item.ingles),
  ).length;
  const faltantes = total - escuchadas;
  const completado = total > 0 && faltantes === 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs md:text-sm font-black uppercase tracking-[0.12em] text-[#1cb0f6] block">
          VOCABULARIO INICIAL
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">
          Aprende la Pronunciación Clave
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Tocá cada tarjeta para escuchar la pronunciación en inglés.
        </p>
        {total > 0 && (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full transition-colors ${
              completado
                ? "bg-emerald-100 text-emerald-700"
                : "bg-sky-100 text-[#1cb0f6]"
            }`}
          >
            {completado && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
            {escuchadas}/{total} escuchadas
          </span>
        )}
      </div>

      {total === 0 ? (
        <p className="text-center text-sm font-bold text-slate-400">
          No hay vocabulario cargado para esta lección.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {palabras.map((item, idx) => {
            const isVisto = vistos.includes(item.ingles);

            return (
              <button
                key={`${item.ingles}-${idx}`}
                type="button"
                onClick={() => onListen(item.ingles)}
                aria-pressed={isVisto}
                aria-label={`Escuchar ${item.ingles}`}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-colors duration-200 shadow-sm active:scale-95 cursor-pointer text-center w-full group ${
                  isVisto
                    ? "bg-emerald-50/50 border-emerald-300 hover:border-emerald-500"
                    : "bg-white border-slate-200 hover:border-[#1cb0f6] hover:shadow"
                }`}
              >
                {item.categoria && (
                  <span
                    className={`text-[8px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border ${
                      isVisto
                        ? "text-emerald-700 bg-emerald-100/50 border-emerald-200"
                        : "text-[#1cb0f6] bg-sky-50 border-sky-100"
                    }`}
                  >
                    {item.categoria}
                  </span>
                )}

                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isVisto
                      ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"
                      : "bg-sky-50 text-sky-600 group-hover:bg-sky-100"
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </div>

                <span className="font-black text-sm md:text-base text-slate-800 leading-tight inline-flex items-center gap-1">
                  {item.ingles}
                  {isVisto && (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </span>

                {item.espanol && (
                  <span className="font-bold text-xs text-slate-500 italic block">
                    &ldquo;{item.espanol}&rdquo;
                  </span>
                )}

                <span
                  className={`text-[8px] uppercase font-extrabold tracking-wider mt-0.5 inline-flex items-center gap-1 ${
                    isVisto ? "text-emerald-600" : "text-[#1cb0f6]"
                  }`}
                >
                  {isVisto ? (
                    <>
                      <Check className="w-3 h-3" />
                      ¡Escuchado!
                    </>
                  ) : (
                    <>Vocalizar 🗣️</>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {total > 0 && (
        <div
          role="status"
          aria-live="polite"
          className={`w-full rounded-xl p-4 flex items-center gap-3 border-2 transition-all duration-200 ${
            completado
              ? "bg-[#d7ffb7] border-[#58cc02]"
              : "bg-slate-50 border-slate-200"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm ${
              completado ? "text-emerald-500" : "text-slate-500"
            }`}
          >
            {completado ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <span className="text-lg">📝</span>
            )}
          </div>
          <div className="text-left">
            <p
              className={`text-sm font-extrabold leading-tight ${
                completado ? "text-[#58cc02]" : "text-slate-800"
              }`}
            >
              {completado
                ? "¡Bloque completado!"
                : `Vocabulario inicial (${escuchadas}/${total})`}
            </p>
            <p className="text-[11px] font-bold mt-0.5 text-slate-600">
              {completado
                ? `Escuchaste las ${total} palabras. Ya podés continuar con la gramática.`
                : `Te faltan ${faltantes} palabra(s) por escuchar.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
