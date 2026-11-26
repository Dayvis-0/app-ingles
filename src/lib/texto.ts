/**
 * Shared text helpers used to compare student answers across the exercises.
 * Keeping one normalization guarantees that bubbles, typed answers and speech
 * transcripts are all evaluated the same way.
 */

/** Removes punctuation while keeping the word readable. */
export function limpiarPalabra(palabra: string): string {
  return palabra.replace(/[.,/#!$%^&*;:{}=\-_`~()?¿!¡"']/g, "");
}

/** Splits a phrase into readable words without punctuation. */
export function palabrasDe(frase: string): string[] {
  return frase
    .split(/\s+/)
    .map(limpiarPalabra)
    .filter(Boolean);
}

/** Lowercase, punctuation-free, single-spaced version of a phrase. */
export function normalizarFrase(frase: string): string {
  return palabrasDe(frase).join(" ").toLowerCase();
}
