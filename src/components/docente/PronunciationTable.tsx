import { Plus, Trash2 } from "lucide-react";
import type { PronunciacionItem } from "../../lib/lecciones";

interface PronunciationTableProps {
  pronunciaciones: PronunciacionItem[];
  onChange: (items: PronunciacionItem[]) => void;
}

export default function PronunciationTable({
  pronunciaciones,
  onChange,
}: PronunciationTableProps) {
  const handleUpdate = (idx: number, ingles: string) => {
    onChange(
      pronunciaciones.map((item, i) => (i === idx ? { ingles } : item)),
    );
  };

  const handleAdd = () => {
    onChange([...pronunciaciones, { ingles: "" }]);
  };

  const handleRemove = (idx: number) => {
    onChange(pronunciaciones.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border-2 border-slate-200 space-y-4">
      <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
        Agregá las oraciones en inglés que los alumnos practicarán en la etapa
        de pronunciación de esta lección.
      </p>

      {pronunciaciones.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-8 px-4 text-center">
          <p className="text-sm md:text-base font-bold text-slate-400">
            Aún no hay oraciones de pronunciación.
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Agregá la primera oración para empezar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pronunciaciones.map((pronunciacion, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border-2 border-slate-200 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor={`pronunciation-${idx}`}
                  className="text-xs font-black text-sky-600 uppercase tracking-wider"
                >
                  Oración {idx + 1}
                </label>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                  title="Eliminar oración"
                  aria-label={`Eliminar oración de pronunciación ${idx + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <input
                id={`pronunciation-${idx}`}
                type="text"
                value={pronunciacion.ingles}
                onChange={(e) => handleUpdate(idx, e.target.value)}
                placeholder="Oración en inglés para pronunciar"
                className="w-full px-3 py-2.5 text-sm md:text-base font-bold font-mono border-2 border-slate-200 rounded-xl outline-none focus:border-sky-500 bg-white"
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="w-full sm:w-auto py-3 px-5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm md:text-base font-black tracking-wide transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-xs"
      >
        <Plus className="w-4 h-4" /> Agregar pronunciación
      </button>
    </div>
  );
}
