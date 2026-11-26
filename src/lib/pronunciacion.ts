/**
 * Pronunciation scoring (HU08).
 *
 * Compares what the student said (speech transcript or typed fallback) against
 * the target sentence word by word. A word counts as correct when it matches
 * exactly or within a small Levenshtein distance, which absorbs the typical
 * slips of the Web Speech API without accepting a different word.
 */

import { distanciaLevenshtein } from "./levenshtein";
import { palabrasDe } from "./texto";

/** Minimum similarity accepted to consider the phrase pronounced correctly. */
export const UMBRAL_PRONUNCIACION = 70;

export type PalabraEvaluada = {
  palabra: string;
  coincide: boolean;
};

export type ResultadoPronunciacion = {
  porcentaje: number;
  palabras: PalabraEvaluada[];
};

/**
 * Short words tolerate one edit, longer words two. This is intentionally
 * conservative: "cat"/"cut" are different words, but "writes"/"write" are not.
 */
export function palabrasParecidas(a: string, b: string): boolean {
  const izquierda = a.toLowerCase();
  const derecha = b.toLowerCase();
  if (izquierda === derecha) return true;

  const distancia = distanciaLevenshtein(izquierda, derecha);
  return distancia <= (izquierda.length <= 4 ? 1 : 2);
}

/**
 * Scores how close `dicho` is to `objetivo`.
 * Each target word is matched at most once, so repeating a word does not
 * inflate the score.
 */
export function calcularSimilitud(
  objetivo: string,
  dicho: string,
): ResultadoPronunciacion {
  const objetivoPalabras = palabrasDe(objetivo);
  const dichasPalabras = palabrasDe(dicho);
  const usadas = new Set<number>();

  const palabras = objetivoPalabras.map((palabra) => {
    const indice = dichasPalabras.findIndex(
      (dicha, i) => !usadas.has(i) && palabrasParecidas(palabra, dicha),
    );

    if (indice >= 0) {
      usadas.add(indice);
      return { palabra, coincide: true };
    }

    return { palabra, coincide: false };
  });

  const aciertos = palabras.filter((palabra) => palabra.coincide).length;
  const base = Math.max(objetivoPalabras.length, dichasPalabras.length, 1);
  const porcentaje = Math.min(Math.round((aciertos / base) * 100), 100);

  return { porcentaje, palabras };
}

export function aprobado(resultado: ResultadoPronunciacion | null): boolean {
  return (resultado?.porcentaje ?? 0) >= UMBRAL_PRONUNCIACION;
}
