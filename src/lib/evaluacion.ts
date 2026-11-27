/**
 * Reglas de la evaluación final (HU09 - Jhermy).
 *
 * Se mantienen en funciones puras para que la pantalla de evaluación y el
 * guardado del resultado (HU09 - Yunior) usen exactamente la misma fórmula.
 */

export const NOTA_MAXIMA = 20;
export const NOTA_APROBATORIA = 14;

export type AlternativaEvaluacion = "A" | "B" | "C" | "D";

/** Campos mínimos de una pregunta para poder evaluarla. */
export type PreguntaEvaluable = {
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  respuesta_correcta: AlternativaEvaluacion;
};

export type AlternativaConTexto = {
  letra: AlternativaEvaluacion;
  texto: string;
};

export type ResultadoEvaluacion = {
  aciertos: number;
  totalPreguntas: number;
  nota: number;
  aprobado: boolean;
};

/** Devuelve las cuatro alternativas de una pregunta con su letra A/B/C/D. */
export function alternativasDe(
  pregunta: PreguntaEvaluable,
): AlternativaConTexto[] {
  return [
    { letra: "A", texto: pregunta.alternativa_a },
    { letra: "B", texto: pregunta.alternativa_b },
    { letra: "C", texto: pregunta.alternativa_c },
    { letra: "D", texto: pregunta.alternativa_d },
  ];
}

/**
 * Calcula aciertos, nota 0-20 y estado de aprobación.
 * Una respuesta sin contestar cuenta como incorrecta.
 */
export function calcularResultado(
  preguntas: readonly PreguntaEvaluable[],
  respuestas: readonly (AlternativaEvaluacion | null)[],
): ResultadoEvaluacion {
  const totalPreguntas = preguntas.length;
  const aciertos = preguntas.reduce(
    (total, pregunta, index) =>
      respuestas[index] === pregunta.respuesta_correcta ? total + 1 : total,
    0,
  );

  const nota =
    totalPreguntas > 0
      ? Math.round((aciertos / totalPreguntas) * NOTA_MAXIMA)
      : 0;

  return {
    aciertos,
    totalPreguntas,
    nota,
    aprobado: totalPreguntas > 0 && nota >= NOTA_APROBATORIA,
  };
}
