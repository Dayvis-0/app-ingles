export type EtapaKey =
  | "vocabulario"
  | "gramatica"
  | "construccion-de-oraciones"
  | "pronunciacion"
  | "evaluacion";

export interface EtapaDefinition {
  key: EtapaKey;
  number: number;
  label: string;
  shortLabel: string;
  description: string;
}

export const ETAPAS_LECCION: readonly EtapaDefinition[] = [
  {
    key: "vocabulario",
    number: 1,
    label: "Vocabulario",
    shortLabel: "Vocab.",
    description: "Palabras clave del tema",
  },
  {
    key: "gramatica",
    number: 2,
    label: "Gramática",
    shortLabel: "Gramática",
    description: "Estructura y fórmula visual",
  },
  {
    key: "construccion-de-oraciones",
    number: 3,
    label: "Construcción de Oraciones",
    shortLabel: "Oraciones",
    description: "Armado guiado de frases",
  },
  {
    key: "pronunciacion",
    number: 4,
    label: "Pronunciación",
    shortLabel: "Habla",
    description: "Práctica de voz en inglés",
  },
  {
    key: "evaluacion",
    number: 5,
    label: "Evaluación",
    shortLabel: "Examen",
    description: "Preguntas de opción múltiple",
  },
];
