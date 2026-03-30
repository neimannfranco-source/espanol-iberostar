"use client";

import type { AppState, ModuleType } from "@/lib/types";
import { C, FONT, catColor } from "@/lib/constants";

type Props = {
  appState:             AppState;
  selectedModuleId:     string;
  setSelectedModuleId:  (id: string) => void;
  activeCategory:       string;
  visibleModules:       ModuleType[];
};

export default function Sidebar({
  appState, selectedModuleId, setSelectedModuleId,
  activeCategory, visibleModules,
}: Props) {
  const current = appState.students.find((s) => s.id === appState.currentStudentId) ?? null;

  return (
    <aside style={{
      background: "rgba(6,14,12,0.60)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 24,
      padding: 16,
      fontFamily: FONT,
      position: "sticky",
      top: 76,
      maxHeight: "calc(100vh - 100px)",
      overflowY: "auto",
      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      // sin display:grid acá para que no estire el contenido
    }}>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 17, color: C.text, fontWeight: 700 }}>Módulos</h3>
        <div style={{ marginTop: 3, fontSize: 12, color: C.textDim }}>
          {visibleModules.length} disponibles
        </div>
      </div>

      {/* Lista de módulos — sin espacios vacíos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visibleModules.map((m) => {
          const done   = !!current && !!appState.progress?.[current.id]?.[m.id];
          const active = selectedModuleId === m.id;
          const color  = catColor(m.category);

          return (
            <button
              key={m.id}
              onClick={() => setSelectedModuleId(m.id)}
              style={{
                textAlign: "left",
                border: active
                  ? `1px solid ${color}44`
                  : "1px solid rgba(255,255,255,0.05)",
                background: active
                  ? `${color}12`
                  : "rgba(255,255,255,0.02)",
                borderRadius: 14,
                padding: "10px 12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{m.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
                    {m.title}
                  </span>
                </div>
                {done && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.green, whiteSpace: "nowrap" }}>✓</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 3, paddingLeft: 24 }}>
                {m.category}
              </div>
            </button>
          );
        })}

        {visibleModules.length === 0 && (
          <div style={{ fontSize: 12, color: C.textDim, padding: "8px 4px" }}>
            Sin módulos en esta categoría
          </div>
        )}
      </div>
    </aside>
  );
}