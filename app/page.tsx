"use client";

import { useState, useCallback, useEffect } from "react";
import type { AppState, TabType, PropertyType } from "@/lib/types";
import { modulePropertyFor, HOTEL_CATEGORIES, CRUCERO_CATEGORIES } from "@/lib/types";
import { MODULES } from "@/lib/modules";
import { C, FONT, DISPLAY, CATEGORIES, catColor, LS_KEY, PROFESSOR_PASSWORD, normalize } from "@/lib/constants";

import Login         from "@/components/Login";
import ModuleView    from "@/components/ModuleView";
import Sidebar       from "@/components/Sidebar";
import ProgressPanel from "@/components/ProgressPanel";
import ProfessorPanel from "@/components/ProfessorPanel";
import ProfessorModal from "@/components/ProfessorModal";

// ─── Estado inicial ────────────────────────────────────────────────────────────
const INITIAL_STATE: AppState = {
  students:         [],
  currentStudentId: null,
  progress:         {},
  lastPosition:     {},
};

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [activeCategory,   setActiveCategory]   = useState("Todos");
  const [resumeToken,      setResumeToken]       = useState(0);
  const [showProfModal,    setShowProfModal]      = useState(false);
  const [showProfPanel,    setShowProfPanel]      = useState(false);
  const [profError,        setProfError]          = useState("");
  const [hydrated,         setHydrated]           = useState(false);

  // ── Persistencia localStorage ────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setAppState(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_KEY, JSON.stringify(appState));
  }, [appState, hydrated]);

  // ── Módulos visibles según la propiedad del colaborador actual ────────────
  const currentStudent = appState.students.find((s) => s.id === appState.currentStudentId) ?? null;

  const visibleModules = currentStudent
    ? MODULES.filter((m) => m.property === modulePropertyFor(currentStudent.property))
    : [];

  // Filtro por categoría
  const filteredModules = activeCategory === "Todos"
    ? visibleModules
    : visibleModules.filter((m) => m.category === activeCategory);

  // Categorías disponibles según la propiedad
  const categories = currentStudent
    ? (modulePropertyFor(currentStudent.property) === "hotel"
        ? HOTEL_CATEGORIES
        : CRUCERO_CATEGORIES)
    : ["Todos"];

  // ── Selección de módulo inicial ──────────────────────────────────────────
  useEffect(() => {
    if (visibleModules.length > 0 && !selectedModuleId) {
      setSelectedModuleId(visibleModules[0].id);
    }
  }, [visibleModules.length]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleProfessorLogin = (pwd: string) => {
    if (normalize(pwd) === normalize(PROFESSOR_PASSWORD)) {
      setShowProfModal(false);
      setShowProfPanel(true);
      setProfError("");
    } else {
      setProfError("Contraseña incorrecta.");
    }
  };

  const handlePositionChange = useCallback((pos: {
    moduleId: string; tab: TabType;
    phraseIndex: number; dialogueIndex: number; quizIndex: number;
  }) => {
    const studentId = appState.currentStudentId;
    if (!studentId) return;
    setAppState((prev) => ({
      ...prev,
      lastPosition: {
        ...prev.lastPosition,
        [studentId]: {
          ...(prev.lastPosition?.[studentId] ?? {}),
          [pos.moduleId]: { ...pos, vocabIndex: 0 },
        },
      },
    }));
  }, [appState.currentStudentId]);

  // ── Sin sesión → Login ────────────────────────────────────────────────────
  if (!hydrated) return null;

  if (!appState.currentStudentId) {
    return (
      <>
        <Login
          appState={appState}
          setAppState={setAppState}
          onProfessor={() => setShowProfModal(true)}
        />
        {showProfModal && (
          <ProfessorModal
            onSubmit={handleProfessorLogin}
            onClose={() => { setShowProfModal(false); setProfError(""); }}
            error={profError}
          />
        )}
        {showProfPanel && (
          <ProfessorPanel
            appState={appState}
            setAppState={setAppState}
            onClose={() => setShowProfPanel(false)}
          />
        )}
      </>
    );
  }

  // ── App principal ─────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT,
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
      `}</style>

      {/* Panel del profesor */}
      {showProfPanel && (
        <ProfessorPanel
          appState={appState}
          setAppState={setAppState}
          onClose={() => setShowProfPanel(false)}
        />
      )}

      {/* Topbar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(9,15,14,0.92)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "14px 24px",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <h1 style={{
          fontFamily: DISPLAY, fontSize: 22, fontWeight: 800,
          color: C.text, margin: 0, letterSpacing: "-0.02em",
        }}>
          Español Iberostar
        </h1>

        {/* Categorías */}
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "7px 14px", borderRadius: 999,
                background: activeCategory === cat
                  ? `${catColor(cat)}18`
                  : "rgba(255,255,255,0.02)",
                border: activeCategory === cat
                  ? `1px solid ${catColor(cat)}44`
                  : `1px solid ${C.border}`,
                color: activeCategory === cat ? C.text : C.textDim,
                fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: FONT,
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Acciones usuario */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setShowProfModal(true)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "8px 12px",
              color: C.textMid, cursor: "pointer",
              fontFamily: FONT, fontSize: 12, fontWeight: 600,
            }}
          >
            👨‍🏫 Profesor
          </button>
          <button
            onClick={() => setAppState((prev) => ({ ...prev, currentStudentId: null }))}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "8px 12px",
              color: C.textMid, cursor: "pointer",
              fontFamily: FONT, fontSize: 12, fontWeight: 600,
            }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr 260px",
        gap: 16, padding: "16px 20px",
        maxWidth: 1400, margin: "0 auto",
        alignItems: "start",  // evita que las columnas se estiren
      }}>
        {/* Sidebar módulos */}
        <Sidebar
          appState={appState}
          selectedModuleId={selectedModuleId}
          setSelectedModuleId={(id) => {
            setSelectedModuleId(id);
            setResumeToken((t) => t + 1);
          }}
          activeCategory={activeCategory}
          visibleModules={filteredModules}
        />

        {/* Vista principal del módulo */}
        <main>
          {selectedModuleId && filteredModules.some((m) => m.id === selectedModuleId) ? (
            <ModuleView
              appState={appState}
              setAppState={setAppState}
              selectedModuleId={selectedModuleId}
              resumeToken={resumeToken}
              onGoHome={() => setSelectedModuleId(visibleModules[0]?.id ?? "")}
              onPositionChange={handlePositionChange}
            />
          ) : filteredModules.length > 0 ? (
            // Si el módulo activo no está en el filtro actual, mostrar el primero
            <ModuleView
              appState={appState}
              setAppState={setAppState}
              selectedModuleId={filteredModules[0].id}
              resumeToken={resumeToken}
              onGoHome={() => setSelectedModuleId(visibleModules[0]?.id ?? "")}
              onPositionChange={handlePositionChange}
            />
          ) : (
            <div style={{
              background: C.bg2, border: `1px solid ${C.border}`,
              borderRadius: 24, padding: 32,
              textAlign: "center", color: C.textDim,
            }}>
              No hay módulos disponibles para esta categoría.
            </div>
          )}
        </main>

        {/* Panel de progreso */}
        <ProgressPanel appState={appState} visibleModules={visibleModules} />
      </div>

      {/* Modal profesor */}
      {showProfModal && (
        <ProfessorModal
          onSubmit={handleProfessorLogin}
          onClose={() => { setShowProfModal(false); setProfError(""); }}
          error={profError}
        />
      )}
    </div>
  );
}