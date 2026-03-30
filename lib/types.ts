// ─────────────────────────────────────────────────────────────────────────────
//  TYPES — Español para Colaboradores Iberostar & Grand Amazon
// ─────────────────────────────────────────────────────────────────────────────

export type TabType      = "phrases" | "dialogue" | "quiz";
export type PropertyType =
  | "iberostar_praia_do_forte"
  | "iberostar_waves_bahia"
  | "grand_amazon";

// Módulos que corresponden a cada tipo de propiedad
export const HOTEL_PROPERTIES: PropertyType[] = [
  "iberostar_praia_do_forte",
  "iberostar_waves_bahia",
];

// Etiquetas legibles para la UI
export const PROPERTY_LABELS: Record<PropertyType, string> = {
  iberostar_praia_do_forte: "Iberostar Selection Praia do Forte",
  iberostar_waves_bahia:    "Iberostar Waves Bahia",
  grand_amazon:             "Grand Amazon Expedition",
};

export const PROPERTY_EMOJI: Record<PropertyType, string> = {
  iberostar_praia_do_forte: "🏖️",
  iberostar_waves_bahia:    "🌊",
  grand_amazon:             "🚢",
};

// Dado una propiedad, devuelve qué tipo de módulos puede ver
export function modulePropertyFor(p: PropertyType): "hotel" | "crucero" {
  return HOTEL_PROPERTIES.includes(p) ? "hotel" : "crucero";
}

// ─── FRASES / VOCAB / DIÁLOGO / QUIZ ─────────────────────────────────────────

export interface Phrase {
  es: string;   // frase en español (lo que aprenden)
  pt: string;   // traducción al portugués (lengua nativa)
}

export interface VocabItem {
  es: string;
  pt: string;
}

export interface DialogueLine {
  speaker: string;
  es: string;
  pt: string;
}

export interface QuizItem {
  question: string;   // pregunta en portugués
  options:  string[]; // opciones en español
  answer:   string;   // respuesta correcta en español
}

// ─── MÓDULO ───────────────────────────────────────────────────────────────────

export interface ModuleType {
  id:       string;
  title:    string;
  category: string;
  emoji:    string;
  property: "hotel" | "crucero";  // filtra qué propiedad lo ve
  phrases:  Phrase[];
  vocab:    VocabItem[];
  dialogue: DialogueLine[];
  quiz:     QuizItem[];
}

// ─── ESTUDIANTE / APP STATE ───────────────────────────────────────────────────

export interface Student {
  id:       string;
  name:     string;
  code:     string;
  property: PropertyType; // elegida en el login
}

export interface Position {
  moduleId:      string;
  tab:           TabType;
  phraseIndex:   number;
  vocabIndex:    number;
  dialogueIndex: number;
  quizIndex:     number;
}

export interface AppState {
  students:         Student[];
  currentStudentId: string | null;
  progress:         Record<string, Record<string, boolean>>;
  lastPosition:     Record<string, Record<string, Position>>;
}

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────

export const HOTEL_CATEGORIES = [
  "Todos",
  "Recepción",
  "Gastronomía",
  "Animación",
  "Spa",
  "Medio Ambiente",
  "Atención al Cliente",
];

export const CRUCERO_CATEGORIES = [
  "Todos",
  "Bienvenida y atención",
  "Expediciones y fauna",
  "Gastronomía",
  "Cultura e historia",
  "Navegación y seguridad",
  "Naturaleza amazónica",
];