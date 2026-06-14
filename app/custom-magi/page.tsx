"use client";

import { useState, useEffect } from "react";
import { MagiSettings, MagiTripletConfig, MagiUnitConfig } from "@/lib/types";
import { useLanguage } from "@/lib/language-context";

const EMPTY_UNIT: MagiUnitConfig = { nome: "", ambito: "", descrizione: "" };

const DEFAULT_TRIPLET: MagiTripletConfig = {
  attiva: false,
  melchior: { ...EMPTY_UNIT },
  balthasar: { ...EMPTY_UNIT },
  casper: { ...EMPTY_UNIT },
};

const UNIT_KEYS = ["melchior", "balthasar", "casper"] as const;
const UNIT_DEFAULTS = ["MELCHIOR-1", "BALTHASAR-2", "CASPER-3"];
const UNIT_ACCENTS = ["#3B8BEB", "#1DB87E", "#E89020"];

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
  const activeTripletId = triplet.attiva
    ? "custom"
    : existing.activeTripletId === "custom"
    ? "evangelion-classic"
    : existing.activeTripletId;
  localStorage.setItem(
    "magi-settings",
    JSON.stringify({ ...existing, triplet, activeTripletId })
  );
}

export default function CustomMagiPage() {
  const { t } = useLanguage();
  const [triplet, setTriplet] = useState<MagiTripletConfig>(DEFAULT_TRIPLET);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTriplet(loadTriplet());
  }, []);

  function updateUnit(key: "melchior" | "balthasar" | "casper", field: keyof MagiUnitConfig, value: string) {
    setTriplet((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    setSaved(false);
  }

  function handleToggle() {
    setTriplet((prev) => ({ ...prev, attiva: !prev.attiva }));
    setSaved(false);
  }

  function handleSave() {
    saveTriplet(triplet);
    setSaved(true);
  }

  const isComplete = UNIT_KEYS.every(
    (key) => triplet[key].ambito.trim() && triplet[key].descrizione.trim()
  );

  return (
    <div className="min-h-full font-mono text-sm" style={{ background: "#0a0a0a", color: "#E0E0D0" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b px-4 sm:px-6 py-3 flex items-center gap-3"
        style={{ borderColor: "#2a2a2a", background: "#0d0d0d" }}
      >
        <span className="text-sm font-bold tracking-widest text-gray-200">{t.custom.header}</span>
        <span className="hidden sm:inline text-xs text-gray-600">{t.custom.subtitle}</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Enable toggle card */}
        <div
          className="flex items-center justify-between border rounded p-4 gap-4"
          style={{ borderColor: triplet.attiva ? "#3B8BEB50" : "#2a2a2a", background: "#111111" }}
        >
          <div className="min-w-0">
            <div className="text-xs font-bold tracking-widest" style={{ color: triplet.attiva ? "#3B8BEB" : "#9ca3af" }}>
              {t.custom.toggleLabel}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {triplet.attiva ? t.custom.toggleActive : t.custom.toggleInactive}
            </div>
          </div>
          <button
            onClick={handleToggle}
            className="relative w-12 h-6 rounded-full border shrink-0 transition-all"
            style={{
              borderColor: triplet.attiva ? "#3B8BEB" : "#3a3a3a",
              background: triplet.attiva ? "#3B8BEB20" : "transparent",
            }}
            aria-label={t.custom.toggleAriaLabel}
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
          {UNIT_KEYS.map((key, i) => {
            const accent = UNIT_ACCENTS[i];
            const unitStrings = t.custom.units[i];
            return (
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
                    {unitStrings.label}
                  </span>
                  <span className="text-xs text-gray-600 truncate ml-2">{UNIT_DEFAULTS[i]}</span>
                </div>

                {/* Unit name */}
                <div className="space-y-1.5">
                  <label className="text-xs tracking-widest text-gray-500 block">{t.custom.unitName}</label>
                  <input
                    type="text"
                    value={triplet[key].nome}
                    onChange={(e) => updateUnit(key, "nome", e.target.value)}
                    placeholder={unitStrings.hint}
                    className="w-full bg-transparent border rounded px-3 py-2 text-xs outline-none transition-colors placeholder-gray-700"
                    style={{ borderColor: "#2a2a2a", color: "#E0E0D0" }}
                    onFocus={(e) => (e.target.style.borderColor = accent)}
                    onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                  />
                </div>

                {/* Scope */}
                <div className="space-y-1.5">
                  <label className="text-xs tracking-widest text-gray-500 block">
                    {t.custom.scope} <span style={{ color: accent }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={triplet[key].ambito}
                    onChange={(e) => updateUnit(key, "ambito", e.target.value)}
                    placeholder={unitStrings.hintScope}
                    className="w-full bg-transparent border rounded px-3 py-2 text-xs outline-none transition-colors placeholder-gray-700"
                    style={{ borderColor: "#2a2a2a", color: "#E0E0D0" }}
                    onFocus={(e) => (e.target.style.borderColor = accent)}
                    onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                  />
                </div>

                {/* Behavior */}
                <div className="space-y-1.5">
                  <label className="text-xs tracking-widest text-gray-500 block">
                    {t.custom.behavior} <span style={{ color: accent }}>*</span>
                  </label>
                  <textarea
                    value={triplet[key].descrizione}
                    onChange={(e) => updateUnit(key, "descrizione", e.target.value)}
                    placeholder={unitStrings.hintBehavior}
                    rows={5}
                    className="w-full bg-transparent border rounded px-3 py-2 text-xs outline-none transition-colors resize-none placeholder-gray-700 leading-relaxed"
                    style={{ borderColor: "#2a2a2a", color: "#E0E0D0" }}
                    onFocus={(e) => (e.target.style.borderColor = accent)}
                    onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Required fields note */}
        <p className="text-xs text-gray-600">
          <span className="text-blue-400">*</span> {t.custom.requiredNote}
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
            {t.custom.saveBtn}
          </button>
          {triplet.attiva && !isComplete && (
            <span className="text-xs text-yellow-500 tracking-widest">{t.custom.incompleteWarning}</span>
          )}
          {saved && (
            <span className="text-xs text-green-400 tracking-widest">{t.custom.savedOk}</span>
          )}
        </div>
      </div>
    </div>
  );
}
