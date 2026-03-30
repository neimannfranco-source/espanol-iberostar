"use client";

import type { AppState, ModuleType } from "@/lib/types";
import { PROPERTY_LABELS, PROPERTY_EMOJI } from "@/lib/types";
import { C, FONT, DISPLAY, catColor } from "@/lib/constants";

type Props = {
  appState:       AppState;
  visibleModules: ModuleType[];
};

export default function ProgressPanel({ appState, visibleModules }: Props) {
  const current = appState.students.find((s) => s.id === appState.currentStudentId) ?? null;
  if (!current) return null;

  const progress = appState.progress?.[current.id] ?? {};
  const completed = Object.keys(progress).filter((k) => progress[k]).length;
  const total     = visibleModules.length;
  const percent   = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Agrupar por categoría
  const categories = [...new Set(visibleModules.map((m) => m.category))];
  const catStats = categories.map((cat) => {
    const mods = visibleModules.filter((m) => m.category === cat);
    const done = mods.filter((m) => progress[m.id]).length;
    return { cat, done, total: mods.length, pct: mods.length > 0 ? Math.round((done / mods.length) * 100) : 0 };
  });

  return (
    <aside style={{
      background: "linear-gradient(180deg, rgba(6,18,16,0.82), rgba(5,14,13,0.94))",
      border: `1px solid ${C.border}`, borderRadius: 24, padding: 20,
      fontFamily: FONT, display: "flex", flexDirection: "column", gap: 18,
      position: "sticky", top: 76,
      boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
      backdropFilter: "blur(10px)",
    }}>

      {/* Header */}
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: C.text, fontFamily: DISPLAY, letterSpacing: "-0.03em" }}>
          Progreso
        </div>
        <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
          {PROPERTY_EMOJI[current.property]} {PROPERTY_LABELS[current.property]}
        </div>
        <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
          {current.name}
        </div>
      </div>

      {/* Progreso principal */}
      <div style={{
        padding: 18, borderRadius: 20,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
          Módulos completados
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: "#F0EDE4", lineHeight: 1, letterSpacing: "-0.04em", fontFamily: DISPLAY }}>
            {completed}
          </span>
          <span style={{ fontSize: 16, color: C.textDim, fontWeight: 500 }}>/{total}</span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: 16 }}>
          <div style={{
            width: `${percent}%`, height: "100%", borderRadius: 999,
            background: "linear-gradient(90deg, #20b282, #3dd6a4)",
            transition: "width 0.45s ease",
            boxShadow: "0 0 16px rgba(32,178,130,0.22)",
          }} />
        </div>
        <div style={{ fontSize: 12, color: C.textDim, marginTop: 10 }}>{percent}% completado</div>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gap: 10, padding: 16, borderRadius: 18,
        background: "rgba(255,255,255,0.018)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}>
        {[
          { label: "Módulos pendientes", value: String(total - completed) },
          { label: "Total de frases",    value: String(visibleModules.reduce((a, m) => a + (m.phrases?.length ?? 0), 0)) },
          { label: "Quizzes disponibles",value: String(visibleModules.reduce((a, m) => a + (m.quiz?.length ?? 0), 0)) },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 12 }}>
            <span style={{ color: C.textDim }}>{item.label}</span>
            <span style={{ color: C.textMid, fontWeight: 600, textAlign: "right" }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Por categoría */}
      <div style={{
        padding: 16, borderRadius: 18,
        background: "rgba(255,255,255,0.018)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
          Por categoría
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {catStats.map(({ cat, done, total: tot, pct }) => (
            <div key={cat}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 10 }}>
                <span style={{ fontSize: 12, color: C.textMid }}>{cat}</span>
                <span style={{ fontSize: 11, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{done}/{tot}</span>
              </div>
              <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{
                  width: `${pct}%`, height: "100%", borderRadius: 999,
                  background: catColor(cat),
                  transition: "width 0.45s ease",
                  boxShadow: pct > 0 ? `0 0 12px ${catColor(cat)}40` : "none",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consejo */}
      <div style={{
        background: "rgba(212,168,67,0.07)",
        border: "1px solid rgba(212,168,67,0.16)",
        borderRadius: 16, padding: "14px 15px",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.accent, textTransform: "uppercase", marginBottom: 7 }}>
          Consejo
        </div>
        <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>
          Practicá cada frase en voz alta dos o tres veces. En hotelería de lujo, la seguridad al hablar transmite confianza y profesionalismo.
        </div>
      </div>
    </aside>
  );
}
