"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { ChatMessage, MagiFullResponse, UnitResponse, ModeratorResponse, MagiSettings } from "@/lib/types";
import NodePanel from "./NodePanel";
import MagiReport from "./MagiReport";
import SettingsPanel from "./SettingsPanel";

const UNITS = [
  { key: "melchior" as const, name: "MELCHIOR-1", subtitle: "SCIENTIST", accent: "#3B8BEB", endpoint: "/api/melchior" },
  { key: "balthasar" as const, name: "BALTHASAR-2", subtitle: "MOTHER", accent: "#1DB87E", endpoint: "/api/balthasar" },
  { key: "casper" as const, name: "CASPER-3", subtitle: "WOMAN", accent: "#E89020", endpoint: "/api/casper" },
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

  useEffect(() => { setSettings(loadSettings()); }, []);
  useEffect(() => { localStorage.setItem("magi-settings", JSON.stringify(settings)); }, [settings]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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
    setMessages((prev) => [...prev, { role: "user", content: query, timestamp: new Date() }]);

    // Test mode: /test bypasses all LLM calls
    if (query.trim() === "/test") {
      const testResponse: MagiFullResponse = {
        query: "[TEST] Evaluate the global adoption of Project E.",
        melchior: {
          sintesi: "Statistical analysis of available data indicates a 73% probability of operational success. Risk variables fall within acceptable parameters. I recommend approval with continuous monitoring of key indicators.",
          verdetto: "APPROVE",
        },
        balthasar: {
          sintesi: "The implications for the well-being of affected populations are significant but manageable if accompanied by adequate support measures. The short-term human cost is justified by long-term protection. I express conditional approval.",
          verdetto: "APPROVE",
        },
        casper: {
          sintesi: "Something about this plan disturbs me at a level I cannot formalize. The numbers can say whatever they want — my answer is no. Some thresholds should not be crossed even with the best intentions.",
          verdetto: "REJECT",
        },
        moderator: {
          stato: "MAJORITY",
          verdetto_finale: "2/3 majority in favor of project adoption. Casper-3's dissent signals a subjective reservation that cannot be formalized — it is recommended to take this into account.",
          nota: "Casper-3 expressed instinctive dissent. Human review is advised before final execution.",
        },
      };
      setLiveUnits({ melchior: testResponse.melchior, balthasar: testResponse.balthasar, casper: testResponse.casper });
      setMessages((prev) => [...prev, { role: "magi", content: testResponse, timestamp: new Date() }]);
      setLoading(false);
      return;
    }

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
      setMessages((prev) => [...prev, { role: "magi", content: full, timestamp: new Date() }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "magi", content: "SYSTEM ERROR — connection to MAGI units lost.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const lastMagi = [...messages].reverse().find((m) => m.role === "magi" && typeof m.content !== "string");
  const displayUnits = loading
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
    <div className="flex flex-col h-[100dvh]" style={{ background: "#0a0a0a", color: "#E0E0D0" }}>
      {/* Header */}
      <div
        className="border-b px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between shrink-0 gap-2"
        style={{ borderColor: "#2a2a2a", background: "#0d0d0d" }}
      >
        <div className="font-mono min-w-0">
          <span className="text-sm font-bold tracking-widest text-gray-200">MAGI SYSTEM</span>
          <span className="hidden sm:inline text-xs text-gray-600 ml-3">NERV CENTRAL DOGMA</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="text-xs font-mono font-bold tracking-widest px-2 py-1 rounded border"
            style={{ borderColor: `${providerMeta.color}50`, color: providerMeta.color, background: `${providerMeta.color}10` }}
          >
            {providerMeta.label}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-600 hover:text-gray-300 text-xs font-mono tracking-widest transition-colors border rounded px-2 py-1"
            style={{ borderColor: "#2a2a2a" }}
            aria-label="Settings"
          >
            <span className="hidden sm:inline">⚙ CONFIG</span>
            <span className="sm:hidden">⚙</span>
          </button>
        </div>
      </div>

      {/* Unit Panels — side by side on sm+, stacked on xs */}
      <div
        className="flex flex-col sm:flex-row gap-2 px-3 sm:px-6 py-3 shrink-0 border-b"
        style={{ borderColor: "#2a2a2a" }}
      >
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
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 font-mono text-sm min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-xs mt-8 sm:mt-12 space-y-2">
            <div className="text-xl sm:text-2xl tracking-widest">⬡ MAGI ⬡</div>
            <div>OPERATING SYSTEM — AWAITING INPUT</div>
            <div className="text-gray-700 text-xs px-4">Enter a query to start the deliberative process</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" ? (
              <div
                className="max-w-[85%] sm:max-w-2xl rounded px-3 sm:px-4 py-2 text-sm break-words"
                style={{ background: "#1a1a2e", border: "1px solid #3B8BEB30", color: "#E0E0D0" }}
              >
                <span className="text-xs text-blue-500 block mb-1">OPERATOR</span>
                {msg.content as string}
              </div>
            ) : typeof msg.content === "string" ? (
              <div
                className="max-w-[85%] sm:max-w-2xl rounded px-3 sm:px-4 py-2 text-xs break-words"
                style={{ background: "#1a0a0a", border: "1px solid #E8902030", color: "#E89020" }}
              >
                ⚠ {msg.content}
              </div>
            ) : (
              <div className="w-full">
                <MagiReport data={msg.content as MagiFullResponse} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="text-xs font-mono text-gray-500 flex items-center gap-2">
              <span className="text-green-400 animate-pulse">▋</span>
              <span className="hidden sm:inline">UNITS IN DELIBERATION — awaiting synthesis...</span>
              <span className="sm:hidden">DELIBERATION IN PROGRESS...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 px-3 sm:px-6 py-3 sm:py-4 border-t"
        style={{ borderColor: "#2a2a2a", background: "#0d0d0d" }}
      >
        <div className="flex gap-2 sm:gap-3 items-center">
          <span className="text-green-400 font-mono text-xs sm:text-sm shrink-0">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Enter query..."
            className="flex-1 bg-transparent border-b font-mono text-sm outline-none placeholder-gray-700 transition-colors min-w-0"
            style={{ borderColor: loading ? "#2a2a2a" : "#3B8BEB60", color: "#E0E0D0" }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-3 sm:px-4 py-1.5 rounded font-mono text-xs font-bold tracking-widest transition-all border disabled:opacity-30 shrink-0"
            style={{ borderColor: "#3B8BEB", color: "#3B8BEB", background: "transparent" }}
            onMouseEnter={(e) => {
              if (!loading && input.trim()) (e.target as HTMLButtonElement).style.background = "#3B8BEB20";
            }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "transparent"; }}
          >
            SEND
          </button>
        </div>
      </form>

      {showSettings && (
        <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
