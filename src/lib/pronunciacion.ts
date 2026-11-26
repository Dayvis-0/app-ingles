/**
 * Comparación de pronunciación (HU08 - Yunior).
 *
 * Compara lo que dijo el estudiante contra la oración correcta con una
 * alineación Levenshtein a nivel de palabras, de modo que el orden importa y
 * las palabras faltantes o sobrantes bajan el puntaje. Dentro de cada palabra
 * se usa la distancia de Levenshtein a nivel de caracteres para tolerar
 * pequeños errores del reconocimiento de voz.
 */

import { distanciaLevenshtein } from "./levenshtein";
import { palabrasDe } from "./texto";

/** Porcentaje mínimo para considerar aprobada una frase. */
export const UMBRAL_PRONUNCIACION = 70;

/** Coste de una palabra que coincide de forma aproximada. */
const COSTE_PALABRA_PARECIDA = 0.25;
/** Coste de una palabra distinta. */
const COSTE_PALABRA_DISTINTA = 1;
const EPSILON = 1e-9;

export type PalabraEvaluada = {
  palabra: string;
  coincide: boolean;
};

export type ResultadoPronunciacion = {
  porcentaje: number;
  palabras: PalabraEvaluada[];
};

/**
 * True when both words are the same or differ by a small Levenshtein distance.
 *
 * Las palabras de 3 letras o menos deben coincidir exactamente: un solo cambio
 * convierte una palabra en otra ("cat" vs "cut", "he" vs "she").
 */
export function palabrasParecidas(a: string, b: string): boolean {
  const izquierda = a.toLowerCase();
  const derecha = b.toLowerCase();
  if (izquierda === derecha) return true;

  const mayor = Math.max(izquierda.length, derecha.length);
  if (mayor <= 3) return false;

  const distancia = distanciaLevenshtein(izquierda, derecha);
  const distanciaMaxima = mayor <= 6 ? 1 : 2;
  return distancia <= distanciaMaxima;
}

/**
 * Coste de sustituir una palabra objetivo por una palabra dicha:
 * 0 si es idéntica, 0.25 si es un error leve de reconocimiento, 1 si es otra.
 */
function costePalabra(objetivo: string, dicho: string): number {
  if (objetivo === dicho) return 0;
  return palabrasParecidas(objetivo, dicho)
    ? COSTE_PALABRA_PARECIDA
    : COSTE_PALABRA_DISTINTA;
}

function iguales(a: number, b: number): boolean {
  return Math.abs(a - b) <= EPSILON;
}

/**
 * Calcula qué tan cerca está `dicho` de `objetivo`.
 *
 * La matriz DP es una distancia de edición entre secuencias de palabras:
 * - borrar una palabra objetivo que no se dijo,
 * - insertar una palabra extra que no estaba en el objetivo,
 * - sustituir una palabra por otra (con coste reducido si se parece).
 *
 * El porcentaje final es la similitud normalizada de esa distancia.
 */
export function calcularSimilitud(
  objetivo: string,
  dicho: string,
): ResultadoPronunciacion {
  const objetivoOriginal = palabrasDe(objetivo);
  const objetivoPalabras = objetivoOriginal.map((palabra) =>
    palabra.toLowerCase(),
  );
  const dichasPalabras = palabrasDe(dicho).map((palabra) =>
    palabra.toLowerCase(),
  );

  if (objetivoPalabras.length === 0) {
    return { porcentaje: 0, palabras: [] };
  }

  const filas = objetivoPalabras.length + 1;
  const columnas = dichasPalabras.length + 1;

  // dp[i][j] = coste mínimo de alinear las primeras i palabras objetivo con
  // las primeras j palabras dichas.
  const dp: number[][] = Array.from({ length: filas }, (_, i) =>
    Array.from({ length: columnas }, (_, j) => {
      if (i === 0) return j;
      if (j === 0) return i;
      return 0;
    }),
  );

  for (let i = 1; i < filas; i += 1) {
    for (let j = 1; j < columnas; j += 1) {
      const coste = costePalabra(
        objetivoPalabras[i - 1],
        dichasPalabras[j - 1],
      );

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // falta la palabra objetivo
        dp[i][j - 1] + 1, // sobra una palabra dicha
        dp[i - 1][j - 1] + coste, // coincidencia o sustitución
      );
    }
  }

  // Reconstruye la alineación para saber qué palabras objetivo se acertaron.
  const palabras: PalabraEvaluada[] = [];
  let i = objetivoPalabras.length;
  let j = dichasPalabras.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const coste = costePalabra(
        objetivoPalabras[i - 1],
        dichasPalabras[j - 1],
      );

      if (iguales(dp[i][j], dp[i - 1][j - 1] + coste)) {
        palabras.push({
          palabra: objetivoOriginal[i - 1],
          coincide: coste < COSTE_PALABRA_DISTINTA,
        });
        i -= 1;
        j -= 1;
        continue;
      }
    }

    if (i > 0 && iguales(dp[i][j], dp[i - 1][j] + 1)) {
      palabras.push({ palabra: objetivoOriginal[i - 1], coincide: false });
      i -= 1;
      continue;
    }

    // La palabra dicha es adicional y no tiene equivalente en el objetivo.
    j -= 1;
  }

  palabras.reverse();

  const distancia = dp[objetivoPalabras.length][dichasPalabras.length];
  const base = Math.max(objetivoPalabras.length, dichasPalabras.length, 1);
  const porcentaje = Math.round(
    Math.max(0, Math.min(1, 1 - distancia / base)) * 100,
  );

  return { porcentaje, palabras };
}

export function aprobado(resultado: ResultadoPronunciacion | null): boolean {
  return (resultado?.porcentaje ?? 0) >= UMBRAL_PRONUNCIACION;
}
