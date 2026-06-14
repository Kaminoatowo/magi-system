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
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-end" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div
        ref={panelRef}
        /* Full-width sheet on mobile, side panel on sm+ */
        className="w-full sm:w-80 sm:h-full flex flex-col border-t sm:border-t-0 sm:border-l rounded-t-xl sm:rounded-none"
        style={{ background: "#0d0d0d", borderColor: "#2a2a2a", maxHeight: "90dvh" }}
      >
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "#3a3a3a" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 sm:py-4 border-b" style={{ borderColor: "#2a2a2a" }}>
          <span className="text-xs font-bold tracking-widest text-gray-300">⚙ SYSTEM CONFIGURATION</span>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-300 text-lg leading-none transition-colors p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
          {/* Provider selection */}
          <div className="space-y-3">
            <label className="text-xs tracking-widest text-gray-500 block">PROVIDER LLM</label>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
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
                        <span className="text-xs font-bold" style={{ color: p.color }}>●</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 truncate">{p.model}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API keys */}
          <div className="space-y-4">
            <label className="text-xs tracking-widest text-gray-500 block">API KEYS</label>
            <p className="text-xs text-gray-600 leading-relaxed">
              Optional — if empty, uses server environment variables.
            </p>

            {[
              { key: "anthropicKey" as const, label: "ANTHROPIC_API_KEY", placeholder: "sk-ant-...", provider: "anthropic", color: "#E89020" },
              { key: "openaiKey" as const, label: "OPENAI_API_KEY", placeholder: "sk-...", provider: "openai", color: "#1DB87E" },
            ].map(({ key, label, placeholder, provider, color }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-gray-500 tracking-widest">{label}</label>
                <input
                  type="password"
                  value={settings[key]}
                  onChange={(e) => onChange({ ...settings, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full bg-transparent border rounded px-3 py-2 text-xs font-mono outline-none transition-colors placeholder-gray-700"
                  style={{
                    borderColor: settings.provider === provider ? `${color}aa` : "#2a2a2a",
                    color: "#E0E0D0",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="rounded border px-4 py-3 space-y-1.5" style={{ borderColor: "#2a2a2a", background: "#111111" }}>
            <div className="text-xs tracking-widest text-gray-500 mb-2">CURRENT STATUS</div>
            {[
              { label: "Provider", value: activeProvider.label, color: activeProvider.color },
              { label: "Model", value: activeProvider.model, color: "#9ca3af" },
              {
                label: "Key",
                value: (settings.provider === "anthropic" ? settings.anthropicKey : settings.openaiKey) ? "● CUSTOM" : "● ENV SERVER",
                color: "#9ca3af",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between text-xs gap-2">
                <span className="text-gray-600 shrink-0">{label}</span>
                <span className="font-bold text-right truncate" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-t" style={{ borderColor: "#2a2a2a" }}>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded border text-xs font-bold tracking-widest transition-all"
            style={{ borderColor: activeProvider.color, color: activeProvider.color }}
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}
