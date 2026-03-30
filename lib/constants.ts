import type { CSSProperties } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  PALETA OFICIAL IBEROSTAR
//  Verde teal #00857C · Oscuro marino · Dorado arena
// ─────────────────────────────────────────────────────────────────────────────

export const C = {
  // Fondos — oscuro marino premium
  bg:           "#04100F",
  bg2:          "#081918",
  bg3:          "#0c2220",
  surface:      "rgba(255,255,255,0.03)",
  border:       "rgba(255,255,255,0.09)",
  borderA:      "rgba(0,133,124,0.40)",
  borderStrong: "rgba(0,133,124,0.25)",

  // Verde Iberostar — color de marca oficial #00857C
  green:        "#00857C",
  greenDim:     "#004d47",
  greenGlow:    "rgba(0,133,124,0.14)",
  greenLight:   "#00a89e",

  // Azul marino complementario
  blue:         "#1a6fa8",
  blueDim:      "rgba(26,111,168,0.12)",

  // Dorado arena — acento cálido
  accent:       "#C8964A",
  accentDim:    "rgba(200,150,74,0.12)",
  accentBright: "#E4B870",

  // Textos
  text:         "#F2F0EC",
  textMid:      "#7DBFBA",
  textDim:      "#3A7470",

  // Estados
  red:          "#e07070",
  redDim:       "rgba(224,112,112,0.10)",
  redBorder:    "rgba(224,112,112,0.22)",
  correct:      "#00857C",
  wrong:        "#e07070",
};

export const FONT    = "'Plus Jakarta Sans', system-ui, sans-serif";
export const MONO    = "'JetBrains Mono', 'Fira Mono', monospace";
export const DISPLAY = "'Playfair Display', Georgia, serif";

export const input: CSSProperties = {
  width: "100%", background: C.bg3,
  border: `1px solid ${C.border}`, borderRadius: 12,
  padding: "12px 16px", color: C.text,
  fontSize: 14, fontFamily: FONT, outline: "none", boxSizing: "border-box",
};

export const btnPrimary: CSSProperties = {
  background: `linear-gradient(135deg, ${C.green}, ${C.greenDim})`,
  color: "#F2F0EC", border: "none", borderRadius: 12,
  padding: "11px 24px", fontSize: 14, fontWeight: 700,
  cursor: "pointer", fontFamily: FONT,
};

export const btnAccent: CSSProperties = {
  background: `linear-gradient(135deg, ${C.accent}, #8a5f20)`,
  color: "#04100F", border: "none", borderRadius: 12,
  padding: "11px 24px", fontSize: 14, fontWeight: 700,
  cursor: "pointer", fontFamily: FONT,
};

export const btnGhost: CSSProperties = {
  background: "transparent", border: `1px solid ${C.border}`,
  borderRadius: 10, padding: "7px 14px",
  fontSize: 13, color: C.textMid, cursor: "pointer", fontFamily: FONT,
};

export const btnDanger: CSSProperties = {
  background: C.redDim, border: `1px solid ${C.redBorder}`,
  borderRadius: 10, padding: "7px 14px",
  fontSize: 12, color: C.red, cursor: "pointer", fontFamily: FONT,
};

export const HOTEL_CATEGORIES = [
  "Todos", "Recepción", "Gastronomía", "Animación",
  "Spa", "Medio Ambiente", "Atención al Cliente",
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

export const CATEGORIES = HOTEL_CATEGORIES;

export const catColor = (cat: string): string => ({
  "Recepción":           "#00857C",
  "Gastronomía":         "#C8964A",
  "Animación":           "#1a6fa8",
  "Spa":                 "#9b7eb8",
  "Crucero":             "#2a8fc4",
  "Medio Ambiente":      "#4aaa6a",
  "Atención al Cliente": "#e07070",
} as Record<string, string>)[cat] ?? C.textMid;

export const catBg = (cat: string): string => `${catColor(cat)}18`;

export function normalize(value: string): string {
  return value.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

export const PROFESSOR_PASSWORD = "iberostar2025";
export const LS_KEY             = "espanol-iberostar-v1";