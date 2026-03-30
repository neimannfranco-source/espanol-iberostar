"use client";

import { useEffect, useMemo, useState } from "react";
import { MODULES } from "@/lib/modules";
import type { AppState, TabType } from "@/lib/types";
import {
  C, FONT, DISPLAY, catColor, btnGhost, btnDanger,
} from "@/lib/constants";

type Props = {
  appState:          AppState;
  setAppState:       React.Dispatch<React.SetStateAction<AppState>>;
  selectedModuleId:  string;
  resumeToken?:      number;
  onGoHome?:         () => void;
  onPositionChange?: (pos: {
    moduleId: string; tab: TabType;
    phraseIndex: number; dialogueIndex: number; quizIndex: number;
  }) => void;
};

export default function ModuleView({
  appState, setAppState,
  selectedModuleId, resumeToken,
  onGoHome, onPositionChange,
}: Props) {
  const module = useMemo(
    () => MODULES.find((m) => m.id === selectedModuleId) ?? MODULES[0],
    [selectedModuleId]
  );

  const [activeTab,        setActiveTab]        = useState<TabType>("phrases");
  const [phraseIndex,      setPhraseIndex]      = useState(0);
  const [dialogueIndex,    setDialogueIndex]    = useState(0);
  const [quizIndex,        setQuizIndex]        = useState(0);
  const [selectedAnswer,   setSelectedAnswer]   = useState<string | null>(null);
  const [showTranslation,  setShowTranslation]  = useState(true);
  const [speaking,         setSpeaking]         = useState(false);
  const [didRestore,       setDidRestore]       = useState(false);
  const [showCelebration,  setShowCelebration]  = useState(false);
  const [visitedDialogue,  setVisitedDialogue]  = useState(false);
  const [visitedQuiz,      setVisitedQuiz]      = useState(false);
  const [voices,           setVoices]           = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIdx, setSelectedVoiceIdx] = useState<number>(-1); // -1 = auto

  const stopSpeak = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // Cargar voces
  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    const load = () => { const v = synth.getVoices(); if (v.length) setVoices(v); };
    load();
    synth.onvoiceschanged = load;
    return () => { synth.onvoiceschanged = null; };
  }, []);

  // Notificar posición
  useEffect(() => {
    if (!module) return;
    onPositionChange?.({ moduleId: module.id, tab: activeTab, phraseIndex, dialogueIndex, quizIndex });
  }, [module?.id, activeTab, phraseIndex, dialogueIndex, quizIndex]);

  // Restaurar posición al cambiar de módulo
  useEffect(() => {
    const sid = appState.currentStudentId;
    if (!sid || !module) return;
    const saved = appState.lastPosition?.[sid]?.[module.id];
    if (saved) {
      const tab: TabType = (["phrases","dialogue","quiz"] as TabType[]).includes(saved.tab as TabType)
        ? saved.tab as TabType : "phrases";
      setActiveTab(tab);
      setPhraseIndex(saved.phraseIndex ?? 0);
      setDialogueIndex(saved.dialogueIndex ?? 0);
      setQuizIndex(saved.quizIndex ?? 0);
    } else {
      setActiveTab("phrases"); setPhraseIndex(0); setDialogueIndex(0); setQuizIndex(0);
    }
    setSelectedAnswer(null); setShowTranslation(true);
    stopSpeak(); setDidRestore(true);
  }, [appState.currentStudentId, module?.id, resumeToken]);

  useEffect(() => { stopSpeak(); }, [phraseIndex, dialogueIndex, activeTab]);

  const currentPhrase   = module?.phrases?.[phraseIndex];
  const currentDialogue = module?.dialogue?.[dialogueIndex];
  const currentQuiz     = module?.quiz?.[quizIndex];

  // ── Selección de mejor voz española ──────────────────────────────────────
  const getBestSpanishVoice = (): SpeechSynthesisVoice | null => {
    if (!voices.length) return null;
    // Si el usuario eligió una voz manualmente
    if (selectedVoiceIdx >= 0 && voices[selectedVoiceIdx]) return voices[selectedVoiceIdx];

    // Prioridad: voces latinas naturales primero (suenan mejor que es-ES)
    const priority = [
      // Windows 11 — voces neuronales de alta calidad
      (v: SpeechSynthesisVoice) => v.name === "Microsoft Sabina Online (Natural) - Spanish (Mexico)",
      (v: SpeechSynthesisVoice) => v.name === "Microsoft Jorge Online (Natural) - Spanish (Mexico)",
      (v: SpeechSynthesisVoice) => v.name === "Microsoft Camila Online (Natural) - Spanish (United States)",
      (v: SpeechSynthesisVoice) => v.name === "Microsoft Valentina Online (Natural) - Spanish (Chile)",
      (v: SpeechSynthesisVoice) => v.name === "Microsoft Lupe Online (Natural) - Spanish (Mexico)",
      // Cualquier voz neuronal online en español
      (v: SpeechSynthesisVoice) => v.name.includes("Online (Natural)") && v.lang.startsWith("es"),
      // Voces offline latinas
      (v: SpeechSynthesisVoice) => v.lang === "es-MX",
      (v: SpeechSynthesisVoice) => v.lang === "es-US",
      (v: SpeechSynthesisVoice) => v.lang === "es-AR",
      (v: SpeechSynthesisVoice) => v.lang === "es-CO",
      (v: SpeechSynthesisVoice) => v.lang === "es-CL",
      // Cualquier español
      (v: SpeechSynthesisVoice) => v.lang.toLowerCase().startsWith("es"),
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("spanish"),
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("español"),
    ];

    for (const test of priority) {
      const found = voices.find(test);
      if (found) return found;
    }
    return null;
  };

  // TTS en español — voz latina priorizada
  const speak = (text: string, slow = false) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    setTimeout(() => {
      const utt = new SpeechSynthesisUtterance(text);
      const esVoice = getBestSpanishVoice();
      if (esVoice) {
        utt.voice = esVoice;
        utt.lang  = esVoice.lang;
      } else {
        utt.lang = "es-MX"; // fallback: hint al navegador de usar variante latina
      }
      // Ajuste de velocidad y tono según tipo de voz
      const isNatural = esVoice?.name?.includes("Natural") ?? false;
      utt.rate  = slow ? 0.72 : (isNatural ? 1.0 : 0.90);
      utt.pitch = isNatural ? 1.0 : 1.05; // pitch levemente más cálido en voces offline
      utt.volume = 1;
      utt.onend   = () => setSpeaking(false);
      utt.onerror = () => setSpeaking(false);
      setSpeaking(true);
      synth.speak(utt);
    }, 80);
  };

  const markModuleDone = () => {
    const sid = appState.currentStudentId;
    if (!sid || !module) return;
    setAppState((prev) => ({
      ...prev,
      progress: { ...prev.progress, [sid]: { ...(prev.progress?.[sid] ?? {}), [module.id]: true } },
    }));
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const resetModule = () => {
    const sid = appState.currentStudentId;
    if (!sid || !module) return;
    setActiveTab("phrases"); setPhraseIndex(0); setDialogueIndex(0); setQuizIndex(0);
    setSelectedAnswer(null); setShowTranslation(true); stopSpeak();
    setAppState((prev) => {
      const next = { ...(prev.progress?.[sid] ?? {}) };
      delete next[module.id];
      return {
        ...prev,
        progress: { ...prev.progress, [sid]: next },
        lastPosition: {
          ...prev.lastPosition,
          [sid]: { ...(prev.lastPosition?.[sid] ?? {}), [module.id]: { moduleId: module.id, tab: "phrases", phraseIndex: 0, vocabIndex: 0, dialogueIndex: 0, quizIndex: 0 } },
        },
      };
    });
  };

  const isCompleted = !!appState.currentStudentId && !!module &&
    !!appState.progress?.[appState.currentStudentId]?.[module.id];

  const hasReachedEnd =
    phraseIndex === (module?.phrases.length ?? 1) - 1 &&
    visitedDialogue && dialogueIndex === (module?.dialogue?.length ?? 1) - 1 &&
    visitedQuiz     && quizIndex     === (module?.quiz?.length ?? 1) - 1;

  const tabs: { id: TabType; label: string }[] = [
    { id: "phrases",  label: "Frases" },
    { id: "dialogue", label: "Diálogo" },
    { id: "quiz",     label: "Quiz" },
  ];

  const color = catColor(module?.category ?? "");

  // ── Estilos compartidos ─────────────────────────────────────────────────
  const panel: React.CSSProperties = {
    background: "linear-gradient(180deg, rgba(9,20,18,0.96), rgba(7,16,15,0.98))",
    border: `1px solid ${C.border}`, borderRadius: 28,
    padding: "20px 24px 18px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.34)",
    backdropFilter: "blur(10px)",
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 11, color: C.textDim, textAlign: "center",
    letterSpacing: "0.08em", textTransform: "uppercase",
  };

  // Frase en español — grande, prominente
  const bigEs: React.CSSProperties = {
    fontFamily: DISPLAY, fontSize: 42, fontWeight: 700,
    lineHeight: 1.08, color: "#F0EDE4", textAlign: "center",
    marginTop: 16, letterSpacing: "-0.03em",
  };

  // Traducción en portugués — más pequeña
  const ptText: React.CSSProperties = {
    fontSize: 22, lineHeight: 1.35,
    color: "rgba(210,230,220,0.72)",
    textAlign: "center", marginTop: 10, minHeight: 32,
  };

  const btnAccent: React.CSSProperties = {
    background: "linear-gradient(180deg, #D4A843, #A07820)",
    color: "#090f0e", border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 14, padding: "12px 18px",
    fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: FONT, boxShadow: "0 10px 24px rgba(212,168,67,0.18)",
    transition: "all 0.22s ease",
  };

  const btnPrimary: React.CSSProperties = {
    background: `linear-gradient(135deg, ${C.green}, ${C.greenDim})`,
    color: "#F0EDE4", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: "11px 16px",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: FONT, transition: "all 0.22s ease",
  };

  const smallBtn: React.CSSProperties = {
    ...btnGhost, minWidth: 116, borderRadius: 14, padding: "11px 16px",
    fontSize: 13, fontWeight: 600,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: C.textMid,
  };

  const progressDots = (count: number, active: number, onSelect: (i: number) => void) => (
    <div style={{ display: "flex", justifyContent: "center", gap: 4, margin: "10px auto 0" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} onClick={() => onSelect(i)} style={{
          width: i === active ? 18 : 5, height: 5, borderRadius: 999,
          background: i === active
            ? "linear-gradient(90deg, #D4A843, #EDD47A)"
            : i < active ? "rgba(212,168,67,0.35)" : "rgba(255,255,255,0.08)",
          cursor: "pointer", transition: "all 0.22s ease",
        }} />
      ))}
    </div>
  );

  if (!module) return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, color: C.text, fontFamily: FONT }}>
      No hay módulos disponibles.
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 8, fontFamily: FONT }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .phrase-animate { animation: fadeSlideIn 0.28s ease both; }
      `}</style>

      {/* Celebración */}
      {showCelebration && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
        }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(9,20,18,0.97), rgba(7,16,15,0.99))",
            border: `1px solid rgba(32,178,130,0.35)`,
            borderRadius: 28, padding: "40px 56px", textAlign: "center",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
            animation: "fadeSlideIn 0.35s ease both",
          }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, color: C.green, marginBottom: 8 }}>
              ¡Módulo completado!
            </div>
            <div style={{ fontSize: 16, color: "rgba(210,230,220,0.75)" }}>
              {module.emoji} {module.title}
            </div>
          </div>
        </div>
      )}

      {/* Header del módulo — imagen */}
      <div style={{
        position: "relative", overflow: "hidden",
        borderRadius: 28, border: `1px solid ${C.border}`,
        boxShadow: "0 24px 70px rgba(0,0,0,0.34)",
        minHeight: 200, background: "#0a1614",
      }}>
        <img
          src={appState.students.find(s => s.id === appState.currentStudentId)?.property === "grand_amazon" ? "/amazon.jpg" : "/bahia.jpg"}
          alt={module.title}
          style={{
            display: "block", width: "100%", height: 200,
            objectFit: "cover",
            filter: "brightness(0.78) contrast(1.06) saturate(1.1)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(180deg, rgba(4,12,10,0.08) 0%, rgba(4,12,10,0.22) 30%, rgba(4,12,10,0.75) 100%)`,
        }} />

        {/* Botones top */}
        <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
          {onGoHome && (
            <button onClick={onGoHome} style={{
              ...btnGhost, fontSize: 12, padding: "8px 12px", borderRadius: 999,
              background: "rgba(4,12,10,0.40)", color: "rgba(240,237,228,0.88)",
              border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(8px)",
            }}>🏠 Inicio</button>
          )}
          <button onClick={resetModule} style={{
            ...btnDanger, fontSize: 12, padding: "8px 12px", borderRadius: 999,
            background: "rgba(4,12,10,0.40)", color: "#F2C6BF",
            border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(8px)",
          }}>↺ Reset</button>
        </div>

        {/* Título */}
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 10px", borderRadius: 999,
              background: "rgba(240,237,228,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(240,237,228,0.90)",
              backdropFilter: "blur(8px)", fontSize: 11, fontWeight: 600,
            }}>{module.category}</span>
            <span style={{
              display: "inline-flex", alignItems: "center",
              padding: "6px 10px", borderRadius: 999,
              background: "rgba(240,237,228,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(240,237,228,0.90)",
              backdropFilter: "blur(8px)", fontSize: 11,
            }}>{module.phrases?.length ?? 0} frases · {module.quiz?.length ?? 0} quiz</span>
          </div>
          <div style={{
            color: "#F0EDE4", fontSize: 42, fontWeight: 700, lineHeight: 1,
            letterSpacing: "-0.03em", fontFamily: DISPLAY,
            textShadow: "0 4px 18px rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 26 }}>{module.emoji}</span>
            {module.title}
          </div>
        </div>
      </div>

      {/* Tabs + botón completado */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => {
              stopSpeak(); setActiveTab(tab.id);
              if (tab.id === "dialogue") setVisitedDialogue(true);
              if (tab.id === "quiz")     setVisitedQuiz(true);
            }} style={{
              padding: "10px 16px", borderRadius: 999,
              background: activeTab === tab.id ? "rgba(212,168,67,0.12)" : "rgba(255,255,255,0.02)",
              border:     activeTab === tab.id ? "1px solid rgba(212,168,67,0.22)" : "1px solid rgba(255,255,255,0.06)",
              color:      activeTab === tab.id ? C.text : C.textDim,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: FONT, transition: "all 0.22s ease",
            }}>{tab.label}</button>
          ))}
        </div>

        {(activeTab !== "phrases" || phraseIndex !== module.phrases.length - 1) && (
          <button
            onClick={hasReachedEnd || isCompleted ? markModuleDone : undefined}
            disabled={!hasReachedEnd && !isCompleted}
            style={{
              ...btnAccent,
              ...(isCompleted
                ? { background: `${C.green}18`, color: C.green, border: `1px solid ${C.green}44`, boxShadow: "none" }
                : !hasReachedEnd ? { opacity: 0.35, cursor: "not-allowed" } : {}),
            }}
          >
            {isCompleted ? "✓ Completado" : "Marcar completo"}
          </button>
        )}
      </div>

      {/* ── TAB: FRASES ──────────────────────────────────────────────────── */}
      {activeTab === "phrases" && currentPhrase && (
        <div style={panel}>
          <div style={sectionLabel}>Frase {phraseIndex + 1} de {module.phrases.length}</div>
          {progressDots(module.phrases.length, phraseIndex, setPhraseIndex)}

          {/* ES — grande (lo que aprenden) */}
          <div key={`es-${phraseIndex}`} className="phrase-animate" style={bigEs}>
            {currentPhrase.es}
          </div>

          {/* PT — traducción */}
          <div key={`pt-${phraseIndex}`} className="phrase-animate"
            style={{ ...ptText, animationDelay: "0.06s" }}>
            {showTranslation ? currentPhrase.pt : "· · · · · · · · · · ·"}
          </div>

          {/* Controles audio */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button onClick={() => speak(currentPhrase.es)} style={btnPrimary}>🔊 Escuchar</button>
            <button onClick={() => speak(currentPhrase.es, true)} style={smallBtn}>🐢 Lento</button>
            <button onClick={stopSpeak} style={{ ...btnDanger, borderRadius: 14, padding: "11px 16px" }}>⏹ Parar</button>
            <button
              onClick={() => setShowTranslation((v) => !v)}
              style={{ ...smallBtn, color: C.accent, border: `1px solid ${C.accent}44` }}
            >
              {showTranslation ? "Ocultar PT" : "Mostrar PT"}
            </button>
          </div>

          {/* Selector de voz */}
          {voices.filter(v => v.lang.toLowerCase().startsWith("es")).length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>🎙 Voz:</span>
              <select
                value={selectedVoiceIdx}
                onChange={(e) => setSelectedVoiceIdx(Number(e.target.value))}
                style={{
                  background: C.bg3, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "4px 10px",
                  color: C.textMid, fontSize: 12,
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  cursor: "pointer", outline: "none",
                }}
              >
                <option value={-1}>✨ Automática</option>
                {voices
                  .map((v, i) => ({ v, i }))
                  .filter(({ v }) => v.lang.toLowerCase().startsWith("es"))
                  .map(({ v, i }) => (
                    <option key={i} value={i}>
                      {v.name.replace("Microsoft ", "").replace(" Online (Natural)", " ★").slice(0, 42)}
                    </option>
                  ))
                }
              </select>
            </div>
          )}

          {/* Navegación */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <button onClick={() => setPhraseIndex((i) => Math.max(i - 1, 0))} style={smallBtn} disabled={phraseIndex === 0}>
              ← Anterior
            </button>
            {phraseIndex === module.phrases.length - 1 ? (
              <button
                onClick={hasReachedEnd || isCompleted ? markModuleDone : undefined}
                disabled={!hasReachedEnd && !isCompleted}
                style={{
                  ...btnAccent,
                  ...(isCompleted ? { background: `${C.green}18`, color: C.green, border: `1px solid ${C.green}44`, boxShadow: "none" }
                    : !hasReachedEnd ? { opacity: 0.35, cursor: "not-allowed" } : {}),
                }}
              >
                {isCompleted ? "✓ Completado" : "✅ Marcar completo"}
              </button>
            ) : (
              <button onClick={() => setPhraseIndex((i) => i + 1)} style={btnAccent}>Siguiente →</button>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: DIÁLOGO ─────────────────────────────────────────────────── */}
      {activeTab === "dialogue" && currentDialogue && (
        <div style={panel}>
          <div style={sectionLabel}>Diálogo {dialogueIndex + 1} de {module.dialogue?.length ?? 0}</div>
          {progressDots(module.dialogue?.length ?? 0, dialogueIndex, setDialogueIndex)}

          <div style={{ textAlign: "center", marginTop: 18 }}>
            <span style={{
              display: "inline-block", padding: "6px 14px", borderRadius: 999,
              background: `${color}18`, color: color, fontWeight: 600,
              fontSize: 13, border: `1px solid ${color}44`,
            }}>{currentDialogue.speaker}</span>
          </div>

          {/* ES — frase en español */}
          <div key={`es-d-${dialogueIndex}`} className="phrase-animate" style={bigEs}>
            {currentDialogue.es}
          </div>

          {/* PT — traducción */}
          <div key={`pt-d-${dialogueIndex}`} className="phrase-animate"
            style={{ ...ptText, animationDelay: "0.06s" }}>
            {showTranslation ? currentDialogue.pt : "· · · · · · · · · · ·"}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button onClick={() => speak(currentDialogue.es)} style={btnPrimary}>🔊 Escuchar</button>
            <button onClick={() => speak(currentDialogue.es, true)} style={smallBtn}>🐢 Lento</button>
            <button onClick={stopSpeak} style={{ ...btnDanger, borderRadius: 14, padding: "11px 16px" }}>⏹ Parar</button>
            <button
              onClick={() => setShowTranslation((v) => !v)}
              style={{ ...smallBtn, color: C.accent, border: `1px solid ${C.accent}44` }}
            >
              {showTranslation ? "Ocultar PT" : "Mostrar PT"}
            </button>
          </div>

          {/* Selector de voz diálogo */}
          {voices.filter(v => v.lang.toLowerCase().startsWith("es")).length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
              <span style={{ fontSize: 11, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>🎙 Voz:</span>
              <select
                value={selectedVoiceIdx}
                onChange={(e) => setSelectedVoiceIdx(Number(e.target.value))}
                style={{
                  background: C.bg3, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "4px 10px",
                  color: C.textMid, fontSize: 12,
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  cursor: "pointer", outline: "none",
                }}
              >
                <option value={-1}>✨ Automática</option>
                {voices
                  .map((v, i) => ({ v, i }))
                  .filter(({ v }) => v.lang.toLowerCase().startsWith("es"))
                  .map(({ v, i }) => (
                    <option key={i} value={i}>
                      {v.name.replace("Microsoft ", "").replace(" Online (Natural)", " ★").slice(0, 42)}
                    </option>
                  ))
                }
              </select>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <button onClick={() => setDialogueIndex((i) => Math.max(i - 1, 0))} style={smallBtn} disabled={dialogueIndex === 0}>
              ← Anterior
            </button>
            <button
              onClick={() => setDialogueIndex((i) => Math.min(i + 1, (module.dialogue?.length ?? 1) - 1))}
              style={btnAccent}
              disabled={dialogueIndex === (module.dialogue?.length ?? 1) - 1}
            >Siguiente →</button>
          </div>
        </div>
      )}

      {/* ── TAB: QUIZ ────────────────────────────────────────────────────── */}
      {activeTab === "quiz" && currentQuiz && (
        <div style={panel}>
          <div style={sectionLabel}>Quiz {quizIndex + 1} de {module.quiz?.length ?? 0}</div>

          {/* Barra de progreso */}
          <div style={{
            height: 4, width: 220, background: "rgba(255,255,255,0.08)",
            borderRadius: 999, margin: "14px auto 0", overflow: "hidden",
          }}>
            <div style={{
              width: `${((quizIndex + 1) / (module.quiz?.length ?? 1)) * 100}%`,
              height: "100%", background: "linear-gradient(90deg, #D4A843, #EDD47A)",
              borderRadius: 999, transition: "width 0.3s ease",
            }} />
          </div>

          {/* Pregunta (en portugués) */}
          <div style={{
            fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, lineHeight: 1.3,
            color: "#F0EDE4", textAlign: "center",
            margin: "28px 0 22px", letterSpacing: "-0.02em",
          }}>
            {currentQuiz.question}
          </div>

          {/* Opciones (en español) */}
          <div style={{ display: "grid", gap: 10 }}>
            {currentQuiz.options.map((opt) => {
              const isCorrect = !!selectedAnswer && opt === currentQuiz.answer;
              const isWrong   = selectedAnswer === opt && opt !== currentQuiz.answer;
              return (
                <button key={opt} onClick={() => setSelectedAnswer(opt)} style={{
                  textAlign: "left", borderRadius: 16, padding: "14px 16px",
                  border: `1px solid ${isCorrect ? `${C.green}60` : isWrong ? `${C.red}60` : "rgba(255,255,255,0.08)"}`,
                  background: isCorrect ? `${C.green}12` : isWrong ? `${C.red}12` : "rgba(255,255,255,0.03)",
                  color: isCorrect ? C.green : isWrong ? C.red : C.textMid,
                  cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: FONT,
                  display: "flex", alignItems: "center", gap: 10,
                  transition: "all 0.18s ease",
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%",
                    border: `1.5px solid ${isCorrect ? C.green : isWrong ? C.red : C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, flexShrink: 0,
                  }}>
                    {isCorrect ? "✓" : isWrong ? "✗" : ""}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {selectedAnswer && (
            <div style={{
              marginTop: 16, padding: "12px 16px", borderRadius: 14, fontSize: 14, fontWeight: 600,
              background: selectedAnswer === currentQuiz.answer ? `${C.green}10` : `${C.red}10`,
              border: `1px solid ${selectedAnswer === currentQuiz.answer ? `${C.green}40` : `${C.red}40`}`,
              color: selectedAnswer === currentQuiz.answer ? C.green : C.red,
              textAlign: "center",
            }}>
              {selectedAnswer === currentQuiz.answer
                ? "✓ ¡Correcto!"
                : `✗ Respuesta correcta: ${currentQuiz.answer}`}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <button
              onClick={() => { setSelectedAnswer(null); setQuizIndex((i) => Math.max(i - 1, 0)); }}
              style={smallBtn} disabled={quizIndex === 0}
            >← Anterior</button>
            <button
              onClick={() => { setSelectedAnswer(null); setQuizIndex((i) => Math.min(i + 1, (module.quiz?.length ?? 1) - 1)); }}
              style={btnAccent}
              disabled={quizIndex === (module.quiz?.length ?? 1) - 1}
            >Siguiente →</button>
          </div>
        </div>
      )}
    </div>
  );
}