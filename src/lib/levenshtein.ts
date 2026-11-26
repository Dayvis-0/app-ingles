/**
 * Levenshtein distance between two strings.
 * Used by the pronunciation scorer to tolerate small recognition slips
 * ("writes" vs "write", "park" vs "pack") without accepting a wrong word.
 */
export function distanciaLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const columnas = b.length + 1;
  let anterior: number[] = Array.from({ length: columnas }, (_, j) => j);

  for (let i = 1; i <= a.length; i += 1) {
    const actual: number[] = [i];
    for (let j = 1; j < columnas; j += 1) {
      const coste = a[i - 1] === b[j - 1] ? 0 : 1;
      actual[j] = Math.min(
        anterior[j] + 1, // deletion
        actual[j - 1] + 1, // insertion
        anterior[j - 1] + coste, // substitution
      );
    }
    anterior = actual;
  }

  return anterior[columnas - 1];
}
