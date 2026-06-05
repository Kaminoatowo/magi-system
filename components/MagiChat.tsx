"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { ChatMessage, MagiFullResponse, UnitResponse, ModeratorResponse, MagiSettings } from "@/lib/types";
import NodePanel from "./NodePanel";
import MagiReport from "./MagiReport";
import SettingsPanel from "./SettingsPanel";

const UNITS = [
  { key: "melchior" as const, name: "MELCHIOR-1", subtitle: "SCIENZIATA", accent: "#3B8BEB", endpoint: "/api/melchior" },
  { key: "balthasar" as const, name: "BALTHASAR-2", subtitle: "MADRE", accent: "#1DB87E", endpoint: "/api/balthasar" },
  { key: "casper" as const, name: "CASPER-3", subtitle: "DONNA", accent: "#E89020", endpoint: "/api/casper" },
];

const DEFAULT_SETTINGS: MagiSettings = {
  provider: "anthropic",
  anthropicKey: "",
  openaiKey: "",
};

function loadSettings(): MagiSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem("magi-settings");
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const PROVIDER_LABEL: Record<string, { label: string; color: string }> = {
  anthropic: { label: "ANTHROPIC", color: "#E89020" },
  openai: { label: "OPENAI", color: "#1DB87E" },
};

export default function MagiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<MagiSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [liveUnits, setLiveUnits] = useState<{
    melchior: UnitResponse | null;
    balthasar: UnitResponse | null;
    casper: UnitResponse | null;
  }>({ melchior: null, balthasar: null, casper: null });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    localStorage.setItem("magi-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getApiKey() {
    return settings.provider === "anthropic" ? settings.anthropicKey : settings.openaiKey;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    setInput("");
    setLoading(true);
    setLiveUnits({ melchior: null, balthasar: null, casper: null });

    const userMsg: ChatMessage = { role: "user", content: query, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);

    const payload = { query, provider: settings.provider, apiKey: getApiKey() || undefined };

    try {
      const [melchior, balthasar, casper] = await Promise.all(
        UNITS.map((unit) =>
          fetch(unit.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => r.json() as Promise<UnitResponse>)
        )
      );

      setLiveUnits({ melchior, balthasar, casper });

      const modRes = await fetch("/api/moderator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, melchior, balthasar, casper }),
      });
      const moderator: ModeratorResponse = await modRes.json();

      const full: MagiFullResponse = { query, melchior, balthasar, casper, moderator };
      const magiMsg: ChatMessage = { role: "magi", content: full, timestamp: new Date() };
      setMessages((prev) => [...prev, magiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        role: "magi",
        content: "ERRORE DI SISTEMA — connessione alle unità MAGI interrotta.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  const lastMagi = [...messages].reverse().find((m) => m.role === "magi" && typeof m.content !== "string");
  const displayUnits =
    loading
      ? liveUnits
      : lastMagi
      ? {
          melchior: (lastMagi.content as MagiFullResponse).melchior,
          balthasar: (lastMagi.content as MagiFullResponse).balthasar,
          casper: (lastMagi.content as MagiFullResponse).casper,
        }
      : { melchior: null, balthasar: null, casper: null };

  const providerMeta = PROVIDER_LABEL[settings.provider];

  return (
    <div className="flex flex-col h-screen" style={{ background: "#0a0a0a", color: "#E0E0D0" }}>
      {/* Header */}
      <div className="border-b px-6 py-3 flex items-center justify-between shrink-0" style={{ borderColor: "#2a2a2a", background: "#0d0d0d" }}>
        <div className="font-mono">
          <span className="text-sm font-bold tracking-widest text-gray-200">MAGI SYSTEM</span>
          <span className="text-xs text-gray-600 ml-3">NERV CENTRAL DOGMA — SUPERCOMPUTER ARRAY</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Provider badge */}
          <div
            className="text-xs font-mono font-bold tracking-widest px-2 py-1 rounded border"
            style={{ borderColor: `${providerMeta.color}50`, color: providerMeta.color, background: `${providerMeta.color}10` }}
          >
            {providerMeta.label}
          </div>
          <div className="text-xs font-mono text-gray-600">
            {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
          </div>
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-600 hover:text-gray-300 text-xs font-mono tracking-widest transition-colors border rounded px-2 py-1"
            style={{ borderColor: "#2a2a2a" }}
          >
            ⚙ CONFIG
          </button>
        </div>
      </div>

      {/* Unit Panels */}
      <div className="flex gap-3 px-6 py-4 shrink-0 border-b" style={{ borderColor: "#2a2a2a" }}>
        {UNITS.map((unit) => (
          <NodePanel
            key={unit.key}
            name={unit.name}
            subtitle={unit.subtitle}
            accent={unit.accent}
            data={displayUnits[unit.key]}
            loading={loading}
          />
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 font-mono text-sm">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-xs mt-12 space-y-2">
            <div className="text-2xl tracking-widest">⬡ MAGI ⬡</div>
            <div>SISTEMA OPERATIVO — IN ATTESA DI INPUT</div>
            <div className="text-gray-700">Inserisci una query per avviare il processo deliberativo</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" ? (
              <div
                className="max-w-2xl rounded px-4 py-2 text-sm"
                style={{ background: "#1a1a2e", border: "1px solid #3B8BEB30", color: "#E0E0D0" }}
              >
                <span className="text-xs text-blue-500 block mb-1">OPERATORE</span>
                {msg.content as string}
              </div>
            ) : typeof msg.content === "string" ? (
              <div
                className="max-w-2xl rounded px-4 py-2 text-xs"
                style={{ background: "#1a0a0a", border: "1px solid #E8902030", color: "#E89020" }}
              >
                ⚠ {msg.content}
              </div>
            ) : (
              <div className="w-full max-w-4xl">
                <MagiReport data={msg.content as MagiFullResponse} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="text-xs font-mono text-gray-500 flex items-center gap-2">
              <span className="text-green-400 animate-pulse">▋</span>
              UNITÀ IN DELIBERAZIONE — attendere sintesi...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="shrink-0 px-6 py-4 border-t" style={{ borderColor: "#2a2a2a", background: "#0d0d0d" }}>
        <div className="flex gap-3 items-center">
          <span className="text-green-400 font-mono text-sm shrink-0">MAGI:~$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Inserisci query per il sistema MAGI..."
            className="flex-1 bg-transparent border-b font-mono text-sm outline-none placeholder-gray-700 transition-colors"
            style={{
              borderColor: loading ? "#2a2a2a" : "#3B8BEB60",
              color: "#E0E0D0",
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-1.5 rounded font-mono text-xs font-bold tracking-widest transition-all border disabled:opacity-30"
            style={{ borderColor: "#3B8BEB", color: "#3B8BEB", background: "transparent" }}
            onMouseEnter={(e) => {
              if (!loading && input.trim()) (e.target as HTMLButtonElement).style.background = "#3B8BEB20";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = "transparent";
            }}
          >
            INVIA
          </button>
        </div>
      </form>

      {/* Settings overlay */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
