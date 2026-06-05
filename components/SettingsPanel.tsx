"use client";

import { useEffect, useRef } from "react";
import { MagiSettings, MagiProvider } from "@/lib/types";

interface SettingsPanelProps {
  settings: MagiSettings;
  onChange: (s: MagiSettings) => void;
  onClose: () => void;
}

const PROVIDERS: { value: MagiProvider; label: string; model: string; color: string }[] = [
  { value: "anthropic", label: "ANTHROPIC", model: "claude-sonnet-4-20250514", color: "#E89020" },
  { value: "openai", label: "OPENAI", model: "gpt-4o", color: "#1DB87E" },
];

export default function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    setTimeout(() => window.addEventListener("mousedown", handleClick), 0);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const activeProvider = PROVIDERS.find((p) => p.value === settings.provider)!;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div
        ref={panelRef}
        className="h-full w-80 flex flex-col border-l"
        style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#2a2a2a" }}>
          <span className="text-xs font-bold tracking-widest text-gray-300">⚙ CONFIGURAZIONE SISTEMA</span>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-300 text-lg leading-none transition-colors"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
          {/* Provider selection */}
          <div className="space-y-3">
            <label className="text-xs tracking-widest text-gray-500 block">PROVIDER LLM</label>
            <div className="space-y-2">
              {PROVIDERS.map((p) => {
                const active = settings.provider === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => onChange({ ...settings, provider: p.value })}
                    className="w-full text-left rounded border px-4 py-3 transition-all"
                    style={{
                      borderColor: active ? p.color : "#2a2a2a",
                      background: active ? `${p.color}10` : "#111111",
                      boxShadow: active ? `0 0 12px ${p.color}30` : "none",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-widest" style={{ color: active ? p.color : "#9ca3af" }}>
                        {p.label}
                      </span>
                      {active && (
                        <span className="text-xs font-bold" style={{ color: p.color }}>
                          ● ATTIVO
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{p.model}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API keys */}
          <div className="space-y-4">
            <label className="text-xs tracking-widest text-gray-500 block">CHIAVI API</label>
            <p className="text-xs text-gray-600 leading-relaxed">
              Opzionale. Se vuote vengono usate le variabili d&apos;ambiente del server{" "}
              <span className="text-gray-500">(.env.local)</span>.
            </p>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 tracking-widest">ANTHROPIC_API_KEY</label>
              <input
                type="password"
                value={settings.anthropicKey}
                onChange={(e) => onChange({ ...settings, anthropicKey: e.target.value })}
                placeholder="sk-ant-..."
                className="w-full bg-transparent border rounded px-3 py-2 text-xs font-mono outline-none transition-colors placeholder-gray-700"
                style={{
                  borderColor: settings.provider === "anthropic" ? "#E89020aa" : "#2a2a2a",
                  color: "#E0E0D0",
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 tracking-widest">OPENAI_API_KEY</label>
              <input
                type="password"
                value={settings.openaiKey}
                onChange={(e) => onChange({ ...settings, openaiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-transparent border rounded px-3 py-2 text-xs font-mono outline-none transition-colors placeholder-gray-700"
                style={{
                  borderColor: settings.provider === "openai" ? "#1DB87Eaa" : "#2a2a2a",
                  color: "#E0E0D0",
                }}
              />
            </div>
          </div>

          {/* Status */}
          <div
            className="rounded border px-4 py-3 space-y-1"
            style={{ borderColor: "#2a2a2a", background: "#111111" }}
          >
            <div className="text-xs tracking-widest text-gray-500 mb-2">STATO CORRENTE</div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Provider</span>
              <span className="font-bold" style={{ color: activeProvider.color }}>
                {activeProvider.label}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Modello</span>
              <span className="text-gray-400">{activeProvider.model}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Chiave</span>
              <span className="text-gray-400">
                {(settings.provider === "anthropic" ? settings.anthropicKey : settings.openaiKey)
                  ? "● PERSONALIZZATA"
                  : "● ENV SERVER"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t" style={{ borderColor: "#2a2a2a" }}>
          <button
            onClick={onClose}
            className="w-full py-2 rounded border text-xs font-bold tracking-widest transition-all"
            style={{ borderColor: activeProvider.color, color: activeProvider.color }}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = `${activeProvider.color}15`)}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = "transparent")}
          >
            CONFERMA
          </button>
        </div>
      </div>
    </div>
  );
}
