/**
 * Pure helpers for the sentence-building exercise (HU07 - construir oraciones).
 * They are kept outside the component so the answer comparison and the bubble
 * generation can be verified without rendering React.
 */

/**
 * Common English words used as decoys. They are filtered against the sentence
 * words so a decoy never duplicates a real answer bubble.
 */
const DISTRACTORES = [
  "the",
  "at",
  "with",
  "always",
  "never",
  "some",
  "very",
  "from",
  "about",
  "there",
  "here",
  "today",
  "tomorrow",
  "because",
  "under",
  "between",
];

/** Removes punctuation while keeping the word readable as a bubble. */
function limpiarPalabra(palabra: string): string {
  return palabra.replace(/[.,/#!$%^&*;:{}=\-_`~()?¿!¡"']/g, "");
}

/**
 * Normalizes an answer so keyboard input and bubbles compare the same way:
 * punctuation is dropped, casing is ignored and spacing is collapsed.
 */
export function normalizarFrase(frase: string): string {
  return frase
    .split(/\s+/)
    .map(limpiarPalabra)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function mezclar<T>(items: T[]): T[] {
  const copia = [...items];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Returns the sentence words plus two decoys, in random order. */
export function construirBurbujas(ingles: string): string[] {
  const principales = ingles
    .split(/\s+/)
    .map(limpiarPalabra)
    .filter(Boolean);

  const usadas = new Set(principales.map((palabra) => palabra.toLowerCase()));
  const disponibles = DISTRACTORES.filter(
    (distractor) => !usadas.has(distractor),
  );

  return mezclar([...principales, ...mezclar(disponibles).slice(0, 2)]);
}

/** True when the student's answer matches the target sentence. */
export function esRespuestaCorrecta(
  respuesta: string,
  esperada: string,
): boolean {
  return normalizarFrase(respuesta) === normalizarFrase(esperada);
}
