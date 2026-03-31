"use client";

import { useState, useCallback, useEffect } from "react";
import type { AppState, TabType, PropertyType } from "@/lib/types";
import { modulePropertyFor, HOTEL_CATEGORIES, CRUCERO_CATEGORIES } from "@/lib/types";
import { MODULES } from "@/lib/modules";
import { C, FONT, DISPLAY, catColor, PROFESSOR_PASSWORD, normalize } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

import Login          from "@/components/Login";
import ModuleView     from "@/components/ModuleView";
import Sidebar        from "@/components/Sidebar";
import ProgressPanel  from "@/components/ProgressPanel";
import ProfessorPanel from "@/components/ProfessorPanel";
import ProfessorModal from "@/components/ProfessorModal";

const INITIAL_STATE: AppState = {
  students: [], currentStudentId: null, progress: {}, lastPosition: {},
};

export default function HomePage() {
  const [appState,         setAppState]         = useState<AppState>(INITIAL_STATE);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [activeCategory,   setActiveCategory]   = useState("Todos");
  const [resumeToken,      setResumeToken]       = useState(0);
  const [showProfModal,    setShowProfModal]     = useState(false);
  const [showProfPanel,    setShowProfPanel]     = useState(false);
  const [profError,        setProfError]         = useState("");
  const [hydrated,         setHydrated]          = useState(false);
  const [loading,          setLoading]           = useState(true);

  // Cargar datos de Supabase al inicio
  useEffect(() => {
    async function load() {
      try {
        const [{ data: sd }, { data: pd }, { data: lpd }] = await Promise.all([
          supabase.from("students").select("*").order("created_at"),
          supabase.from("progress").select("*"),
          supabase.from("last_position").select("*"),
        ]);

        const students = (sd ?? []).map((s: any) => ({
          id: s.id, name: s.name, code: s.code, property: s.property as PropertyType,
        }));

        const progress: Record<string, Record<string, boolean>> = {};
        (pd ?? []).forEach((p: any) => {
          if (!progress[p.student_id]) progress[p.student_id] = {};
          progress[p.student_id][p.module_id] = p.completed;
        });

        const lastPosition: Record<string, Record<string, any>> = {};
        (lpd ?? []).forEach((pos: any) => {
          if (!lastPosition[pos.student_id]) lastPosition[pos.student_id] = {};
          lastPosition[pos.student_id][pos.module_id] = {
            moduleId: pos.module_id, tab: pos.tab,
            phraseIndex: pos.phrase_index, vocabIndex: 0,
            dialogueIndex: pos.dialogue_index, quizIndex: pos.quiz_index,
          };
        });

        setAppState({ students, currentStudentId: null, progress, lastPosition });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false); setHydrated(true);
      }
    }
    load();
  }, []);

  // setAppState con sincronización a Supabase
  const setAppStateSync = useCallback((updater: AppState | ((prev: AppState) => AppState)) => {
    setAppState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;

      // Nuevos estudiantes
      next.students
        .filter(s => !prev.students.find(ps => ps.id === s.id))
        .forEach(s =>
          supabase
            .from("students")
            .upsert({ id: s.id, name: s.name, code: s.code, property: s.property })
            .then(({ error }) => {
              if (error) console.error("Error guardando alumno:", error.message);
              else console.log("Alumno guardado:", s.name);
            })
        );

      // Estudiantes eliminados
      prev.students
        .filter(s => !next.students.find(ns => ns.id === s.id))
        .forEach(s =>
          supabase.from("students").delete().eq("id", s.id)
            .then(({ error }) => {
              if (error) console.error("Error eliminando alumno:", error.message);
              else console.log("Alumno eliminado:", s.name);
            })
        );

      // Progreso actualizado
      const sid = next.currentStudentId ?? prev.currentStudentId;
      if (sid && next.progress[sid]) {
        const prevP = prev.progress?.[sid] ?? {};
        Object.entries(next.progress[sid]).forEach(([mid, done]) => {
          if (prevP[mid] !== done)
            supabase
              .from("progress")
              .upsert(
                { student_id: sid, module_id: mid, completed: done },
                { onConflict: "student_id,module_id" }
              )
              .then(({ error }) => {
                if (error) console.error("Error guardando progreso:", error.message);
              });
        });
      }

      return next;
    });
  }, []);

  const handlePositionChange = useCallback(async (pos: {
    moduleId: string; tab: TabType; phraseIndex: number; dialogueIndex: number; quizIndex: number;
  }) => {
    const sid = appState.currentStudentId;
    if (!sid) return;
    setAppState(prev => ({
      ...prev,
      lastPosition: {
        ...prev.lastPosition,
        [sid]: {
          ...(prev.lastPosition?.[sid] ?? {}),
          [pos.moduleId]: { ...pos, vocabIndex: 0 },
        },
      },
    }));
    supabase.from("last_position").upsert({
      student_id: sid, module_id: pos.moduleId, tab: pos.tab,
      phrase_index: pos.phraseIndex, dialogue_index: pos.dialogueIndex, quiz_index: pos.quizIndex,
    }, { onConflict: "student_id,module_id" })
      .then(({ error }) => {
        if (error) console.error("Error guardando posición:", error.message);
      });
  }, [appState.currentStudentId]);

  const currentStudent  = appState.students.find(s => s.id === appState.currentStudentId) ?? null;
  const visibleModules  = currentStudent ? MODULES.filter(m => m.property === modulePropertyFor(currentStudent.property)) : [];
  const filteredModules = activeCategory === "Todos" ? visibleModules : visibleModules.filter(m => m.category === activeCategory);
  const categories      = currentStudent
    ? (modulePropertyFor(currentStudent.property) === "hotel" ? HOTEL_CATEGORIES : CRUCERO_CATEGORIES)
    : ["Todos"];

  useEffect(() => {
    if (visibleModules.length > 0 && !selectedModuleId) setSelectedModuleId(visibleModules[0].id);
  }, [visibleModules.length]);

  const handleProfessorLogin = (pwd: string) => {
    if (normalize(pwd) === normalize(PROFESSOR_PASSWORD)) {
      setShowProfModal(false); setShowProfPanel(true); setProfError("");
    } else { setProfError("Contraseña incorrecta."); }
  };

  if (!hydrated || loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🌿</div>
        <div style={{ color: C.textMid, fontSize: 14 }}>Cargando plataforma…</div>
      </div>
    </div>
  );

  if (!appState.currentStudentId) return (
    <>
      <Login appState={appState} setAppState={setAppStateSync} onProfessor={() => setShowProfModal(true)} />
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
          setAppState={setAppStateSync}
          onClose={() => setShowProfPanel(false)}
        />
      )}
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
      `}</style>

      {showProfPanel && (
        <ProfessorPanel
          appState={appState}
          setAppState={setAppStateSync}
          onClose={() => setShowProfPanel(false)}
        />
      )}

      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(9,15,14,0.92)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`, padding: "14px 24px",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
          Español Iberostar
        </h1>
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: "7px 14px", borderRadius: 999,
              background: activeCategory === cat ? `${catColor(cat)}18` : "rgba(255,255,255,0.02)",
              border: activeCategory === cat ? `1px solid ${catColor(cat)}44` : `1px solid ${C.border}`,
              color: activeCategory === cat ? C.text : C.textDim,
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT, transition: "all 0.15s",
            }}>{cat}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowProfModal(true)}
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", color: C.textMid, cursor: "pointer", fontFamily: FONT, fontSize: 12, fontWeight: 600 }}
          >
            👨‍🏫 Profesor
          </button>
          <button
            onClick={() => setAppState(prev => ({ ...prev, currentStudentId: null }))}
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", color: C.textMid, cursor: "pointer", fontFamily: FONT, fontSize: 12, fontWeight: 600 }}
          >
            Salir
          </button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 260px", gap: 16, padding: "16px 20px", maxWidth: 1400, margin: "0 auto", alignItems: "start" }}>
        <Sidebar
          appState={appState}
          selectedModuleId={selectedModuleId}
          setSelectedModuleId={id => { setSelectedModuleId(id); setResumeToken(t => t + 1); }}
          activeCategory={activeCategory}
          visibleModules={filteredModules}
        />
        <main>
          {filteredModules.length > 0 ? (
            <ModuleView
              appState={appState}
              setAppState={setAppStateSync}
              selectedModuleId={filteredModules.some(m => m.id === selectedModuleId) ? selectedModuleId : filteredModules[0].id}
              resumeToken={resumeToken}
              onGoHome={() => setSelectedModuleId(visibleModules[0]?.id ?? "")}
              onPositionChange={handlePositionChange}
            />
          ) : (
            <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 24, padding: 32, textAlign: "center", color: C.textDim }}>
              No hay módulos en esta categoría.
            </div>
          )}
        </main>
        <ProgressPanel appState={appState} visibleModules={visibleModules} />
      </div>

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