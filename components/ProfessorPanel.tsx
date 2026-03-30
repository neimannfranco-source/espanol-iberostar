"use client";

import { useState } from "react";
import type { AppState, PropertyType } from "@/lib/types";
import {
  PROPERTY_LABELS, PROPERTY_EMOJI, HOTEL_PROPERTIES,
  modulePropertyFor,
} from "@/lib/types";
import { MODULES } from "@/lib/modules";
import { C, FONT, DISPLAY } from "@/lib/constants";

type Props = {
  appState:    AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onClose:     () => void;
};

const ALL_PROPERTIES: PropertyType[] = [
  "iberostar_praia_do_forte",
  "iberostar_waves_bahia",
  "grand_amazon",
];

export default function ProfessorPanel({ appState, setAppState, onClose }: Props) {
  const [newName,     setNewName]     = useState("");
  const [newCode,     setNewCode]     = useState("");
  const [newProperty, setNewProperty] = useState<PropertyType>("iberostar_praia_do_forte");
  const [msg,         setMsg]         = useState("");

  const current = appState.students.find((s) => s.id === appState.currentStudentId) ?? null;
  const currentProgress = current ? appState.progress?.[current.id] ?? {} : {};

  // Módulos que ve el alumno actual
  const visibleModules = current
    ? MODULES.filter((m) => m.property === modulePropertyFor(current.property))
    : [];

  const completedCount = Object.values(currentProgress).filter(Boolean).length;

  // Resumen por propiedad
  const summaries = ALL_PROPERTIES.map((p) => {
    const students = appState.students.filter((s) => s.property === p);
    const total    = MODULES.filter((m) => m.property === modulePropertyFor(p)).length;
    const done     = students.reduce((acc, s) => {
      const prog = appState.progress?.[s.id] ?? {};
      return acc + Object.values(prog).filter(Boolean).length;
    }, 0);
    const possible = students.length * total;
    return {
      property: p,
      students: students.length,
      done,
      possible,
      pct: possible > 0 ? Math.round((done / possible) * 100) : 0,
    };
  });

  // ── crear alumno ──────────────────────────────────────────────────────────
  const createStudent = () => {
    const name = newName.trim();
    const code = newCode.trim().toUpperCase();
    if (!name) { setMsg("Ingresá un nombre."); return; }
    if (!code) { setMsg("Ingresá una contraseña."); return; }
    if (appState.students.some(
      (s) => s.name.trim().toLowerCase() === name.toLowerCase() && s.property === newProperty
    )) { setMsg("Ya existe ese nombre en esa propiedad."); return; }

    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `s-${Date.now()}`;

    setAppState((prev) => ({
      ...prev,
      students: [...prev.students, { id, name, code, property: newProperty }],
      currentStudentId: id,
      progress: { ...prev.progress, [id]: {} },
    }));
    setNewName(""); setNewCode("");
    setMsg("✓ Colaborador creado correctamente.");
  };

  const deleteStudent = () => {
    if (!current) return;
    if (!window.confirm(`¿Eliminar a ${current.name}? Se borrará también su progreso.`)) return;
    setAppState((prev) => {
      const next = prev.students.filter((s) => s.id !== current.id);
      const prog = { ...prev.progress };
      delete prog[current.id];
      return { ...prev, students: next, currentStudentId: next[0]?.id ?? null, progress: prog };
    });
    setMsg(`✓ Eliminado: ${current.name}`);
  };

  const toggleModule = (moduleId: string) => {
    if (!current) return;
    setAppState((prev) => {
      const cur = prev.progress?.[current.id] ?? {};
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [current.id]: { ...cur, [moduleId]: !cur[moduleId] },
        },
      };
    });
  };

  const markAll = () => {
    if (!current) return;
    const all = Object.fromEntries(visibleModules.map((m) => [m.id, true]));
    setAppState((prev) => ({
      ...prev,
      progress: { ...prev.progress, [current.id]: all },
    }));
  };

  const resetAll = () => {
    if (!current) return;
    setAppState((prev) => ({
      ...prev,
      progress: { ...prev.progress, [current.id]: {} },
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────

  const fieldStyle: React.CSSProperties = {
    width: "100%", background: C.bg3,
    border: `1px solid ${C.border}`, borderRadius: 12,
    padding: "11px 14px", color: C.text,
    fontSize: 14, outline: "none", fontFamily: FONT,
  };

  const sectionBox: React.CSSProperties = {
    background: "rgba(255,255,255,0.02)",
    border: `1px solid ${C.border}`,
    borderRadius: 20, padding: 16, marginBottom: 14,
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 11, color: C.textDim,
    textTransform: "uppercase", letterSpacing: "0.08em",
    fontWeight: 700, marginBottom: 12,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(3,8,7,0.82)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 1100, maxHeight: "88vh", overflowY: "auto",
          background: "linear-gradient(180deg, rgba(10,24,22,0.98), rgba(7,18,17,0.99))",
          border: `1px solid ${C.border}`, borderRadius: 28,
          padding: 22, boxShadow: "0 28px 90px rgba(0,0,0,0.42)",
          fontFamily: FONT,
        }}
      >
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 2,
          background: "linear-gradient(180deg, rgba(10,24,22,0.98), rgba(10,24,22,0.94))",
          paddingBottom: 16, marginBottom: 18,
          borderBottom: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontFamily: DISPLAY, fontSize: 32, color: C.text, letterSpacing: "-0.03em" }}>
              Panel del profesor
            </div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>
              Gestión de colaboradores por propiedad
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
            borderRadius: 999, padding: "10px 14px",
            color: C.textMid, cursor: "pointer", fontFamily: FONT, fontWeight: 600,
          }}>
            ✕ Cerrar
          </button>
        </div>

        {/* Dashboard por propiedad */}
        <div style={sectionBox}>
          <div style={sectionTitle}>Dashboard general</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {summaries.map((s) => (
              <div key={s.property} style={{
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${C.border}`,
                borderRadius: 16, padding: 14,
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{PROPERTY_EMOJI[s.property]}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                  {PROPERTY_LABELS[s.property]}
                </div>
                <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>
                  {s.students} colaborador{s.students !== 1 ? "es" : ""}
                </div>
                <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                  <div style={{
                    width: `${s.pct}%`, height: "100%", borderRadius: 999,
                    background: "linear-gradient(90deg, #20b282, #3dd6a4)",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 5 }}>
                  {s.pct}% completado ({s.done}/{s.possible} módulos)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crear colaborador */}
        <div style={sectionBox}>
          <div style={sectionTitle}>Crear colaborador</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <div>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 6 }}>Nombre</div>
              <input
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setMsg(""); }}
                placeholder="Nombre del colaborador"
                style={fieldStyle}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 6 }}>Contraseña</div>
              <input
                value={newCode}
                onChange={(e) => { setNewCode(e.target.value); setMsg(""); }}
                placeholder="Contraseña"
                style={fieldStyle}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 6 }}>Propiedad</div>
              <select
                value={newProperty}
                onChange={(e) => setNewProperty(e.target.value as PropertyType)}
                style={{ ...fieldStyle, appearance: "none" as any }}
              >
                {ALL_PROPERTIES.map((p) => (
                  <option key={p} value={p}>{PROPERTY_EMOJI[p]} {PROPERTY_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <button
              onClick={createStudent}
              style={{
                background: "linear-gradient(180deg, #D4A843, #A07820)",
                color: "#090f0e", border: "none", borderRadius: 12,
                padding: "11px 16px", fontWeight: 700, cursor: "pointer",
                fontFamily: FONT, whiteSpace: "nowrap",
              }}
            >
              Crear
            </button>
          </div>
          {msg && (
            <div style={{ marginTop: 10, fontSize: 13, color: msg.startsWith("✓") ? C.green : C.red }}>
              {msg}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14, marginBottom: 14 }}>
          {/* Colaborador activo */}
          <div style={sectionBox}>
            <div style={sectionTitle}>Colaborador activo</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {appState.students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setAppState((prev) => ({ ...prev, currentStudentId: s.id }))}
                  style={{
                    padding: "8px 12px", borderRadius: 999, cursor: "pointer",
                    fontFamily: FONT, fontSize: 13, fontWeight: 600,
                    border: s.id === current?.id
                      ? `1px solid rgba(200,169,110,0.28)`
                      : `1px solid ${C.border}`,
                    background: s.id === current?.id
                      ? "rgba(200,169,110,0.12)"
                      : "rgba(255,255,255,0.03)",
                    color: s.id === current?.id ? C.text : C.textMid,
                  }}
                >
                  {PROPERTY_EMOJI[s.property]} {s.name}
                </button>
              ))}
              {appState.students.length === 0 && (
                <div style={{ fontSize: 13, color: C.textDim }}>Sin colaboradores todavía</div>
              )}
            </div>
          </div>

          {/* Resumen alumno actual */}
          <div style={sectionBox}>
            <div style={sectionTitle}>Alumno activo</div>
            {current ? (
              <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.textDim }}>Nombre</span>
                  <span style={{ color: C.text, fontWeight: 600 }}>{current.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.textDim }}>Propiedad</span>
                  <span style={{ color: C.text }}>{PROPERTY_EMOJI[current.property]} {PROPERTY_LABELS[current.property]}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.textDim }}>Módulos completos</span>
                  <span style={{ color: C.text, fontWeight: 600 }}>{completedCount}/{visibleModules.length}</span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: C.textDim }}>Seleccioná un colaborador</div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          {[
            { label: "Marcar todo", action: markAll, style: { background: "linear-gradient(180deg,#D4A843,#A07820)", color: "#090f0e" } },
            { label: "Resetear todo", action: resetAll, style: { background: "rgba(224,112,112,0.10)", color: C.red, border: `1px solid rgba(224,112,112,0.22)` } },
            { label: "Eliminar colaborador", action: deleteStudent, style: { background: "rgba(224,112,112,0.10)", color: C.red, border: `1px solid rgba(224,112,112,0.22)` } },
          ].map(({ label, action, style }) => (
            <button
              key={label}
              onClick={action}
              disabled={!current}
              style={{
                ...style, border: "none", borderRadius: 12,
                padding: "10px 14px", fontWeight: 700,
                cursor: current ? "pointer" : "not-allowed",
                fontFamily: FONT, opacity: current ? 1 : 0.5,
              } as React.CSSProperties}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Control por módulo */}
        <div style={sectionBox}>
          <div style={sectionTitle}>
            Control por módulo
            {current && (
              <span style={{ marginLeft: 8, color: C.textMid, fontWeight: 400 }}>
                · {PROPERTY_EMOJI[current.property]} {PROPERTY_LABELS[current.property]}
              </span>
            )}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {visibleModules.map((m) => {
              const done = !!currentProgress[m.id];
              return (
                <button
                  key={m.id}
                  onClick={() => toggleModule(m.id)}
                  disabled={!current}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    gap: 12, textAlign: "left", padding: "11px 14px",
                    borderRadius: 14, cursor: current ? "pointer" : "not-allowed",
                    fontFamily: FONT, opacity: current ? 1 : 0.5,
                    border: done ? "1px solid rgba(32,178,130,0.28)" : `1px solid ${C.border}`,
                    background: done ? "rgba(32,178,130,0.08)" : "rgba(255,255,255,0.02)",
                    color: done ? C.text : C.textMid,
                  }}
                >
                  <span>{m.emoji} {m.title}</span>
                  <span style={{ fontSize: 12, color: done ? C.green : C.textDim, fontWeight: 700 }}>
                    {done ? "✓ Completo" : "Pendiente"}
                  </span>
                </button>
              );
            })}
            {visibleModules.length === 0 && !current && (
              <div style={{ fontSize: 13, color: C.textDim }}>Seleccioná un colaborador para ver sus módulos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
