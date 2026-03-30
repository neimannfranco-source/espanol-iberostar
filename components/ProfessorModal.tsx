"use client";
import { useState, useEffect, useRef } from "react";
import { C, FONT, input, btnGhost } from "@/lib/constants";

interface Props {
  onSubmit: (pwd: string) => void;
  onClose:  () => void;
  error:    string;
}

export default function ProfessorModal({ onSubmit, onClose, error }: Props) {
  const [pwd, setPwd] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => { if (pwd.trim()) onSubmit(pwd.trim()); };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.62)", zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.bg2, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: 24, width: 320,
          display: "flex", flexDirection: "column", gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>👨‍🏫 Acceso del Profesor</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>

        <input
          ref={ref}
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") onClose(); }}
          placeholder="Contraseña del profesor"
          style={{ ...input, width: "100%" }}
        />

        {error && <span style={{ fontSize: 12, color: C.red }}>{error}</span>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ ...btnGhost, fontSize: 13 }}>Cancelar</button>
          <button onClick={submit} style={{
            ...btnGhost, fontSize: 13,
            background: "rgba(32,178,130,0.10)",
            borderColor: "rgba(32,178,130,0.30)",
            color: C.green,
          }}>Entrar</button>
        </div>
      </div>
    </div>
  );
}
