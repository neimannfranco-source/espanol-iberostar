"use client";
import { useState } from "react";
import type { AppState, PropertyType } from "../lib/types";
import {
  PROPERTY_LABELS,
  PROPERTY_EMOJI,
  modulePropertyFor,
} from "../lib/types";
import { C, FONT, DISPLAY, MONO, input, btnPrimary, normalize } from "../lib/constants";

interface Props {
  appState:      AppState;
  setAppState:   (s: AppState | ((p: AppState) => AppState)) => void;
  onProfessor:   () => void;
}

const PROPERTIES: PropertyType[] = [
  "iberostar_praia_do_forte",
  "iberostar_waves_bahia",
  "grand_amazon",
];

export default function Login({ appState, setAppState, onProfessor }: Props) {
  const [name,         setName]         = useState("");
  const [code,         setCode]         = useState("");
  const [property,     setProperty]     = useState<PropertyType | "">("");
  const [error,        setError]        = useState("");
  const [step,         setStep]         = useState<1 | 2>(1); // 1=propiedad, 2=credenciales

  // ── paso 1 → elegir propiedad ──────────────────────────────────────────
  const handleSelectProperty = (p: PropertyType) => {
    setProperty(p);
    setStep(2);
    setError("");
  };

  // ── paso 2 → login ─────────────────────────────────────────────────────
  const login = () => {
    if (!property) return;

    const found = appState.students.find(
      (s) =>
        normalize(s.name) === normalize(name) &&
        normalize(s.code) === normalize(code) &&
        s.property === property
    );

    if (!found) {
      setError("Nombre, contraseña o propiedad incorrectos.");
      return;
    }

    setAppState((prev) => ({ ...prev, currentStudentId: found.id }));
    setError("");
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: "100vh",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: FONT,
      overflow: "hidden",
    }}>
      {/* Fondo */}
      <img
        src="/bahia.jpg"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          filter: "brightness(0.82) saturate(1.2) contrast(1.05)",
        }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(160deg, rgba(4,18,14,0.55) 0%, rgba(6,22,18,0.65) 100%)",
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: ${C.textDim}; }
        input:focus { border-color: ${C.borderA} !important; outline: none; }
        button { transition: opacity 0.15s; }
        button:hover { opacity: 0.85; }
        .prop-btn { transition: all 0.2s ease; }
        .prop-btn:hover { transform: translateY(-2px); }
      `}</style>

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{
            fontSize: 34, fontWeight: 800,
            color: C.text, margin: "0 0 6px",
            fontFamily: DISPLAY, letterSpacing: "-0.02em",
          }}>
            Español Iberostar
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.85)", fontSize: 14,
            margin: "0 0 6px", fontWeight: 500,
          }}>
            Plataforma de aprendizaje para colaboradores
          </p>
          <p style={{
            color: "rgba(255,255,255,0.5)", fontSize: 11,
            margin: 0, fontFamily: MONO, letterSpacing: "0.06em",
          }}>
            Bahia, Brasil · Manaos, Brasil
          </p>
        </div>

        {/* ── PASO 1: elegir propiedad ─────────────────────────────────── */}
        {step === 1 && (
          <div style={{
            background: C.bg2,
            border: `1px solid ${C.border}`,
            borderRadius: 24, padding: 28,
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700,
              color: C.textDim, letterSpacing: "0.07em",
              textTransform: "uppercase", marginBottom: 16,
              fontFamily: MONO,
            }}>
              ¿Dónde trabajas?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PROPERTIES.map((p) => (
                <button
                  key={p}
                  className="prop-btn"
                  onClick={() => handleSelectProperty(p)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px",
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    cursor: "pointer",
                    fontFamily: FONT,
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 24 }}>{PROPERTY_EMOJI[p]}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                      {PROPERTY_LABELS[p]}
                    </div>
                    <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
                      {p === "grand_amazon" ? "Manaos, Brasil" : "Praia do Forte, Bahia"}
                    </div>
                  </div>
                  <span style={{ marginLeft: "auto", color: C.textDim, fontSize: 18 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PASO 2: nombre + contraseña ──────────────────────────────── */}
        {step === 2 && property && (
          <div style={{
            background: C.bg2,
            border: `1px solid ${C.border}`,
            borderRadius: 24, padding: 28,
          }}>
            {/* propiedad elegida */}
            <button
              onClick={() => { setStep(1); setError(""); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "8px 12px",
                marginBottom: 20,
                cursor: "pointer", fontFamily: FONT,
              }}
            >
              <span style={{ fontSize: 16 }}>{PROPERTY_EMOJI[property]}</span>
              <span style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>
                {PROPERTY_LABELS[property]}
              </span>
              <span style={{ fontSize: 11, color: C.textDim, marginLeft: 4 }}>← cambiar</span>
            </button>

            {/* nombre */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                fontSize: 11, fontWeight: 700, color: C.textDim,
                letterSpacing: "0.07em", display: "block",
                marginBottom: 8, fontFamily: MONO, textTransform: "uppercase",
              }}>Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
                style={input}
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
            </div>

            {/* contraseña */}
            <div style={{ marginBottom: 22 }}>
              <label style={{
                fontSize: 11, fontWeight: 700, color: C.textDim,
                letterSpacing: "0.07em", display: "block",
                marginBottom: 8, fontFamily: MONO, textTransform: "uppercase",
              }}>Contraseña</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••••••"
                type="password"
                style={input}
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(224,112,112,0.08)",
                border: `1px solid rgba(224,112,112,0.22)`,
                borderRadius: 10, padding: "10px 14px",
                fontSize: 13, color: C.red, marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button
              onClick={login}
              style={{ ...btnPrimary, width: "100%", padding: "13px 24px", fontSize: 15 }}
            >
              Entrar a la plataforma →
            </button>
          </div>
        )}

        {/* Botón profesor */}
        <button
          onClick={onProfessor}
          style={{
            marginTop: 10, width: "100%",
            background: "transparent",
            border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "11px 16px",
            color: "rgba(255,255,255,0.75)", fontSize: 13,
            fontWeight: 700, cursor: "pointer", fontFamily: FONT,
          }}
        >
          Panel del profesor
        </button>
      </div>
    </div>
  );
}
