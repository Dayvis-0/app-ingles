import { Plus, Trash2 } from "lucide-react";
import type { PreguntaItem } from "../../lib/lecciones";

interface QuestionTableProps {
  preguntas: PreguntaItem[];
  onChange: (items: PreguntaItem[]) => void;
}

const ALTERNATIVAS: Array<{
  key: "alternativa_a" | "alternativa_b" | "alternativa_c" | "alternativa_d";
  label: "A" | "B" | "C" | "D";
}> = [
  { key: "alternativa_a", label: "A" },
  { key: "alternativa_b", label: "B" },
  { key: "alternativa_c", label: "C" },
  { key: "alternativa_d", label: "D" },
];

const INPUT_CLASS =
  "w-full px-3 py-2.5 text-sm md:text-base font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-sky-500 bg-white";

export default function QuestionTable({
  preguntas,
  onChange,
}: QuestionTableProps) {
  const handleUpdate = (idx: number, patch: Partial<PreguntaItem>) => {
    onChange(
      preguntas.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    );
  };

  const handleAlternativeChange = (
    idx: number,
    key: "alternativa_a" | "alternativa_b" | "alternativa_c" | "alternativa_d",
    value: string,
  ) => {
    onChange(
      preguntas.map((item, i) => {
        if (i !== idx) return item;
        const next: PreguntaItem = { ...item };
        next[key] = value;
        return next;
      }),
    );
  };

  const handleAdd = () => {
    onChange([
      ...preguntas,
      {
        enunciado: "",
        alternativa_a: "",
        alternativa_b: "",
        alternativa_c: "",
        alternativa_d: "",
        respuesta_correcta: "A",
      },
    ]);
  };

  const handleRemove = (idx: number) => {
    onChange(preguntas.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border-2 border-slate-200 space-y-4">
      <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
        Creá las preguntas de selección múltiple de la evaluación final. Cada
        pregunta necesita un enunciado, cuatro alternativas y una respuesta
        correcta.
      </p>

      {preguntas.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-8 px-4 text-center">
          <p className="text-sm md:text-base font-bold text-slate-400">
            Aún no hay preguntas de evaluación.
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Agregá la primera pregunta para empezar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {preguntas.map((pregunta, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border-2 border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-sky-600 uppercase tracking-wider">
                  Pregunta {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                  title="Eliminar pregunta"
                  aria-label={`Eliminar pregunta ${idx + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label
                  htmlFor={`question-enunciado-${idx}`}
                  className="block text-sm font-bold text-slate-600 mb-1.5"
                >
                  Enunciado
                </label>
                <textarea
                  id={`question-enunciado-${idx}`}
                  rows={2}
                  value={pregunta.enunciado}
                  onChange={(e) =>
                    handleUpdate(idx, { enunciado: e.target.value })
                  }
                  placeholder="ej: ¿Cuál es el pasado simple de 'go'?"
                  className={`${INPUT_CLASS} resize-y`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALTERNATIVAS.map(({ key, label }) => {
                  const isCorrect = pregunta.respuesta_correcta === label;

                  return (
                    <div key={key}>
                      <label
                        htmlFor={`question-${key}-${idx}`}
                        className="block text-sm font-bold text-slate-600 mb-1.5"
                      >
                        Alternativa {label}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 text-slate-600 text-sm font-black flex items-center justify-center">
                          {label}
                        </span>
                        <input
                          id={`question-${key}-${idx}`}
                          type="text"
                          maxLength={100}
                          value={pregunta[key]}
                          onChange={(e) =>
                            handleAlternativeChange(idx, key, e.target.value)
                          }
                          placeholder={`Opción ${label}`}
                          className={`${INPUT_CLASS} ${
                            isCorrect
                              ? "ring-2 ring-emerald-400 border-emerald-400 bg-emerald-50/30"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <fieldset className="border-t border-slate-100 pt-3">
                <legend className="text-sm font-bold text-slate-600 mb-2">
                  Respuesta correcta
                </legend>
                <div className="flex flex-wrap gap-2">
                  {ALTERNATIVAS.map(({ label }) => (
                    <label
                      key={label}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-black cursor-pointer transition-colors ${
                        pregunta.respuesta_correcta === label
                          ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-correct-${idx}`}
                        value={label}
                        checked={pregunta.respuesta_correcta === label}
                        onChange={() =>
                          handleUpdate(idx, { respuesta_correcta: label })
                        }
                        className="accent-emerald-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="w-full sm:w-auto py-3 px-5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm md:text-base font-black tracking-wide transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-xs"
      >
        <Plus className="w-4 h-4" /> Agregar pregunta
      </button>
    </div>
  );
}
