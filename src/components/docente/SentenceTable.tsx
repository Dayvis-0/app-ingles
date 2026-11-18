import { AlertCircle, Plus, Trash2 } from "lucide-react";
import type { OracionItem } from "../../lib/lecciones";

interface SentenceTableProps {
  oraciones: OracionItem[];
  onChange: (items: OracionItem[]) => void;
}

const INPUT_CLASS =
  "w-full px-3 py-2.5 text-sm md:text-base font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-sky-500 bg-white";

export default function SentenceTable({
  oraciones,
  onChange,
}: SentenceTableProps) {
  const handleUpdate = (idx: number, patch: Partial<OracionItem>) => {
    onChange(
      oraciones.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    );
  };

  const handleAdd = () => {
    onChange([...oraciones, { espanol: "", ingles: "" }]);
  };

  const handleRemove = (idx: number) => {
    onChange(oraciones.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border-2 border-slate-200 space-y-4">
      <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
        Escribí las oraciones en español con su traducción correcta en inglés
        para el ejercicio de construcción de oraciones.
      </p>

      {oraciones.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-8 px-4 text-center">
          <p className="text-sm md:text-base font-bold text-slate-400">
            Aún no hay oraciones para armar.
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Agregá la primera oración para empezar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {oraciones.map((oracion, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border-2 border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-sky-600 uppercase tracking-wider">
                  Oración {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                  title="Eliminar oración"
                  aria-label={`Eliminar oración ${idx + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`sentence-es-${idx}`}
                    className="block text-sm font-bold text-slate-600 mb-1.5"
                  >
                    Oración en español
                  </label>
                  <input
                    id={`sentence-es-${idx}`}
                    type="text"
                    value={oracion.espanol}
                    onChange={(e) =>
                      handleUpdate(idx, { espanol: e.target.value })
                    }
                    placeholder="ej: Ella come una manzana"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`sentence-en-${idx}`}
                    className="block text-sm font-bold text-slate-600 mb-1.5"
                  >
                    Traducción correcta en inglés
                  </label>
                  <input
                    id={`sentence-en-${idx}`}
                    type="text"
                    value={oracion.ingles}
                    onChange={(e) =>
                      handleUpdate(idx, { ingles: e.target.value })
                    }
                    placeholder="ej: She eats an apple"
                    className={`${INPUT_CLASS} font-mono ${
                      oracion.ingles.trim() === "" ? "border-amber-300" : ""
                    }`}
                  />
                  {oracion.ingles.trim() === "" && (
                    <p className="flex items-center gap-1.5 text-xs text-amber-600 font-bold mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Falta la traducción en inglés.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="w-full sm:w-auto py-3 px-5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm md:text-base font-black tracking-wide transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-xs"
      >
        <Plus className="w-4 h-4" /> Agregar oración
      </button>
    </div>
  );
}
