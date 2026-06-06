"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagiSettings, MagiTripletConfig, MagiUnitConfig } from "@/lib/types";

const EMPTY_UNIT: MagiUnitConfig = { nome: "", ambito: "", descrizione: "" };

const DEFAULT_TRIPLET: MagiTripletConfig = {
  attiva: false,
  melchior: { ...EMPTY_UNIT },
  balthasar: { ...EMPTY_UNIT },
  casper: { ...EMPTY_UNIT },
};

const UNIT_META = [
  {
    key: "melchior" as const,
    label: "UNITÀ I",
    defaultName: "MELCHIOR-1",
    accent: "#3B8BEB",
    hint: "Es. Analista quantitativo, esperto legale, revisore tecnico…",
    hintAmbito: "Es. Analisi statistica e modellazione del rischio",
    hintDescrizione:
      "Ragioni per dati e probabilità. Sei preciso, conciso e diffidi delle argomentazioni prive di evidenza empirica.",
  },
  {
    key: "balthasar" as const,
    label: "UNITÀ II",
    defaultName: "BALTHASAR-2",
    accent: "#1DB87E",
    hint: "Es. Responsabile etico, welfare manager, consulente sociale…",
    hintAmbito: "Es. Impatto umano e considerazioni etiche",
    hintDescrizione:
      "Valuti ogni decisione dal punto di vista delle persone coinvolte e delle conseguenze a lungo termine per la comunità.",
  },
  {
    key: "casper" as const,
    label: "UNITÀ III",
    defaultName: "CASPER-3",
    accent: "#E89020",
    hint: "Es. Creativo, stratega, avvocato del diavolo…",
    hintAmbito: "Es. Visione strategica e pensiero laterale",
    hintDescrizione:
      "Porti una prospettiva non convenzionale. Puoi contraddire le altre unità sulla base di intuizione o esperienza soggettiva.",
  },
];

function loadTriplet(): MagiTripletConfig {
  if (typeof window === "undefined") return DEFAULT_TRIPLET;
  try {
    const raw = localStorage.getItem("magi-settings");
    if (!raw) return DEFAULT_TRIPLET;
    const settings: MagiSettings = JSON.parse(raw);
    return settings.triplet ?? DEFAULT_TRIPLET;
  } catch {
    return DEFAULT_TRIPLET;
  }
}

function saveTriplet(triplet: MagiTripletConfig) {
  const raw = localStorage.getItem("magi-settings");
  const existing: Partial<MagiSettings> = raw ? JSON.parse(raw) : {};
  localStorage.setItem("magi-settings", JSON.stringify({ ...existing, triplet }));
}

export default function CustomMagiPage() {
  const router = useRouter();
  const [triplet, setTriplet] = useState<MagiTripletConfig>(DEFAULT_TRIPLET);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTriplet(loadTriplet());
  }, []);

  function updateUnit(key: "melchior" | "balthasar" | "casper", field: keyof MagiUnitConfig, value: string) {
    setTriplet((t) => ({ ...t, [key]: { ...t[key], [field]: value } }));
    setSaved(false);
  }

  function handleToggle() {
    setTriplet((t) => ({ ...t, attiva: !t.attiva }));
    setSaved(false);
  }

  function handleSave() {
    saveTriplet(triplet);
    setSaved(true);
  }

  const isComplete = UNIT_META.every(
    ({ key }) => triplet[key].ambito.trim() && triplet[key].descrizione.trim()
  );

  return (
    <div className="min-h-[100dvh] font-mono text-sm" style={{ background: "#0a0a0a", color: "#E0E0D0" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b px-4 sm:px-6 py-3 flex items-center gap-4"
        style={{ borderColor: "#2a2a2a", background: "#0d0d0d" }}
      >
        <button
          onClick={() => router.push("/")}
          className="text-gray-600 hover:text-gray-300 text-xs tracking-widest transition-colors shrink-0"
        >
          ← INDIETRO
        </button>
        <div className="min-w-0">
          <span className="text-sm font-bold tracking-widest text-gray-200">MAGI SYSTEM</span>
          <span className="hidden sm:inline text-xs text-gray-600 ml-3">CONFIGURAZIONE TRIPLETTA</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Enable toggle card */}
        <div
          className="flex items-center justify-between border rounded p-4 gap-4"
          style={{ borderColor: triplet.attiva ? "#3B8BEB50" : "#2a2a2a", background: "#111111" }}
        >
          <div className="min-w-0">
            <div className="text-xs font-bold tracking-widest" style={{ color: triplet.attiva ? "#3B8BEB" : "#9ca3af" }}>
              TRIPLETTA PERSONALIZZATA
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {triplet.attiva
                ? "Attiva — i prompt personalizzati sostituiscono i system prompt standard"
                : "Inattiva — le unità MAGI usano i prompt predefiniti"}
            </div>
          </div>
          <button
            onClick={handleToggle}
            className="relative w-12 h-6 rounded-full border shrink-0 transition-all"
            style={{
              borderColor: triplet.attiva ? "#3B8BEB" : "#3a3a3a",
              background: triplet.attiva ? "#3B8BEB20" : "transparent",
            }}
            aria-label="Attiva tripletta personalizzata"
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200"
              style={{
                background: triplet.attiva ? "#3B8BEB" : "#3a3a3a",
                left: triplet.attiva ? "calc(100% - 1.375rem)" : "2px",
              }}
            />
          </button>
        </div>

        {/* Unit cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {UNIT_META.map(({ key, label, defaultName, accent, hint, hintAmbito, hintDescrizione }) => (
            <div
              key={key}
              className="border rounded p-4 space-y-4 transition-all"
              style={{
                borderColor: triplet.attiva ? `${accent}40` : "#2a2a2a",
                background: "#111111",
              }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest" style={{ color: accent }}>
                  {label}
                </span>
                <span className="text-xs text-gray-600 truncate ml-2">{defaultName}</span>
              </div>

              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-gray-500 block">NOME UNITÀ</label>
                <input
                  type="text"
                  value={triplet[key].nome}
                  onChange={(e) => updateUnit(key, "nome", e.target.value)}
                  placeholder={hint}
                  className="w-full bg-transparent border rounded px-3 py-2 text-xs outline-none transition-colors placeholder-gray-700"
                  style={{ borderColor: "#2a2a2a", color: "#E0E0D0" }}
                  onFocus={(e) => (e.target.style.borderColor = accent)}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                />
              </div>

              {/* Ambito */}
              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-gray-500 block">
                  AMBITO <span style={{ color: accent }}>*</span>
                </label>
                <input
                  type="text"
                  value={triplet[key].ambito}
                  onChange={(e) => updateUnit(key, "ambito", e.target.value)}
                  placeholder={hintAmbito}
                  className="w-full bg-transparent border rounded px-3 py-2 text-xs outline-none transition-colors placeholder-gray-700"
                  style={{ borderColor: "#2a2a2a", color: "#E0E0D0" }}
                  onFocus={(e) => (e.target.style.borderColor = accent)}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                />
              </div>

              {/* Descrizione comportamento */}
              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-gray-500 block">
                  COMPORTAMENTO <span style={{ color: accent }}>*</span>
                </label>
                <textarea
                  value={triplet[key].descrizione}
                  onChange={(e) => updateUnit(key, "descrizione", e.target.value)}
                  placeholder={hintDescrizione}
                  rows={5}
                  className="w-full bg-transparent border rounded px-3 py-2 text-xs outline-none transition-colors resize-none placeholder-gray-700 leading-relaxed"
                  style={{ borderColor: "#2a2a2a", color: "#E0E0D0" }}
                  onFocus={(e) => (e.target.style.borderColor = accent)}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Required fields note */}
        <p className="text-xs text-gray-600">
          <span className="text-blue-400">*</span> Campi obbligatori per attivare la tripletta personalizzata.
        </p>

        {/* Save row */}
        <div className="flex items-center gap-4 pb-8">
          <button
            onClick={handleSave}
            disabled={triplet.attiva && !isComplete}
            className="px-6 py-2.5 rounded border text-xs font-bold tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderColor: "#3B8BEB", color: "#3B8BEB", background: "transparent" }}
            onMouseEnter={(e) => {
              if (!(triplet.attiva && !isComplete)) e.currentTarget.style.background = "#3B8BEB20";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            SALVA CONFIGURAZIONE
          </button>
          {triplet.attiva && !isComplete && (
            <span className="text-xs text-yellow-500 tracking-widest">
              ⚠ Compila ambito e comportamento per tutte e tre le unità
            </span>
          )}
          {saved && (
            <span className="text-xs text-green-400 tracking-widest">✓ CONFIGURAZIONE SALVATA</span>
          )}
        </div>
      </div>
    </div>
  );
}
