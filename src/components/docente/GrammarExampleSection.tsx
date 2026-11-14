interface GrammarExampleSectionProps {
  ejemploOracion: string;
  ejemploRoles: string[];
  onChangeOracion: (oracion: string, roles: string[]) => void;
  onChangeRoles: (roles: string[]) => void;
}

export default function GrammarExampleSection({
  ejemploOracion,
  ejemploRoles,
  onChangeOracion,
  onChangeRoles,
}: GrammarExampleSectionProps) {
  const words = ejemploOracion.split(" ").filter(Boolean);

  return (
    <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border-2 border-slate-200 space-y-4">
      <div>
        <label
          htmlFor="grammar-example-sentence"
          className="text-base md:text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5"
        >
          🎯 Ejemplo Práctico Interactivo
        </label>
        <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed mt-1">
          Escribí una oración de ejemplo y asigná roles a sus palabras para que los estudiantes las exploren de manera interactiva.
        </p>
        <input
          id="grammar-example-sentence"
          type="text"
          value={ejemploOracion}
          onChange={(e) => {
            const val = e.target.value;
            const nextWords = val.split(" ").filter(Boolean);
            const updatedRoles = [...ejemploRoles];
            while (updatedRoles.length < nextWords.length) {
              updatedRoles.push("Ninguno");
            }
            updatedRoles.length = nextWords.length;
            onChangeOracion(val, updatedRoles);
          }}
          placeholder="ej: She loves apples"
          className="w-full mt-3 px-4 py-3 border-2 border-slate-200 rounded-xl text-base font-bold font-mono outline-none focus:border-sky-500 bg-white"
        />
      </div>

      {words.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <span className="block text-sm md:text-base font-bold text-slate-600">
            Asignación de Roles por Palabra:
          </span>
          <div className="flex flex-wrap gap-3">
            {words.map((word, wordIdx) => {
              const currentRole = ejemploRoles[wordIdx] || "Ninguno";
              return (
                <div
                  key={`${word}-${wordIdx}`}
                  className="bg-white p-3.5 rounded-xl border-2 border-slate-200 flex flex-col items-center gap-2 min-w-[110px] shadow-xs"
                >
                  <span className="font-extrabold text-sm md:text-base text-slate-800 break-all text-center">
                    {word}
                  </span>
                  <select
                    aria-label={`Rol para ${word}`}
                    value={currentRole}
                    onChange={(e) => {
                      const updated = [...ejemploRoles];
                      updated[wordIdx] = e.target.value;
                      onChangeRoles(updated);
                    }}
                    className="p-2 text-xs md:text-sm bg-slate-50 border-2 border-slate-200 rounded-lg font-bold text-slate-700 outline-none w-full text-center cursor-pointer"
                  >
                    <option value="Ninguno">Ninguno</option>
                    <option value="Sujeto">👤 Sujeto / Subject</option>
                    <option value="Verbo">⚡ Verbo / Verb</option>
                    <option value="Complemento">📌 Complemento / Object</option>
                    <option value="Pronombre">👤 Pronombre Personal / Personal Pronoun</option>
                    <option value="Sustantivo">📦 Sustantivo / Noun</option>
                    <option value="Adjetivo">🎨 Adjetivo / Adjective</option>
                    <option value="Adverbio">🔄 Adverbio / Adverb</option>
                    <option value="Preposicion">📍 Preposición / Preposition</option>
                    <option value="Articulo">🔗 Artículo / Article</option>
                    <option value="Auxiliar">⚙️ Verbo Auxiliar / Auxiliary Verb</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
