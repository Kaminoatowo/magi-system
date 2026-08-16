"use client";

import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { ChatMessage, MagiFullResponse, UnitResponse, ModeratorResponse, MagiSettings, MagiSession } from "@/lib/types";
import { buildCustomPrompt } from "@/lib/prompts";
import { MAGI_TRIPLETS, COLOR_MAP } from "@/lib/triplets";
import { useLanguage } from "@/lib/language-context";
import { useTheme } from "@/lib/theme-context";
import NodePanel from "./NodePanel";
import MagiReport from "./MagiReport";
import MagiClassicDisplay from "./MagiClassicDisplay";
import SettingsPanel from "./SettingsPanel";

const UNIT_ENDPOINTS = ["/api/melchior", "/api/balthasar", "/api/casper"];
const UNIT_KEYS = ["melchior", "balthasar", "casper"] as const;

const DEFAULT_SETTINGS: MagiSettings = {
  provider: "anthropic",
  anthropicKey: "",
  openaiKey: "",
  customBaseUrl: "",
  customModel: "",
  customKey: "",
  activeTripletId: "evangelion-classic",
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

function saveSession(session: MagiSession) {
  try {
    const raw = localStorage.getItem("magi-sessions");
    const sessions: MagiSession[] = raw ? JSON.parse(raw) : [];
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) sessions[idx] = session;
    else sessions.unshift(session);
    localStorage.setItem("magi-sessions", JSON.stringify(sessions.slice(0, 50)));
  } catch {}
}

const PROVIDER_LABEL: Record<string, { label: string; color: string }> = {
  anthropic: { label: "ANTHROPIC", color: "#E89020" },
  openai: { label: "OPENAI", color: "#1DB87E" },
  custom: { label: "OPENAI-COMPAT", color: "#3B8BEB" },
};

export default function MagiChat() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const nerv = theme === "nerv";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<MagiSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState<number | null>(null);
  const [isFreeTierLimited, setIsFreeTierLimited] = useState(false);
  const [liveUnits, setLiveUnits] = useState<{
    melchior: UnitResponse | null;
    balthasar: UnitResponse | null;
    casper: UnitResponse | null;
  }>({ melchior: null, balthasar: null, casper: null });
  const [expandedUnit, setExpandedUnit] = useState<"melchior" | "balthasar" | "casper" | null>(null);
  const sessionIdRef = useRef<string>(
    typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now())
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);

    // Check for pending session to restore
    const pending = localStorage.getItem("magi-pending-session");
    if (pending) {
      try {
        const session: MagiSession = JSON.parse(pending);
        const restored = session.messages.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp as unknown as string),
        }));
        setMessages(restored);
        sessionIdRef.current = session.id;
        setSettings((s) => ({ ...s, ...loaded, activeTripletId: session.tripletId }));
        localStorage.removeItem("magi-pending-session");
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("magi-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    // Custom endpoints (self-hosted OpenAI-compatible) bypass the server free tier.
    const key =
      settings.provider === "custom"
        ? "custom"
        : settings.provider === "anthropic"
        ? settings.anthropicKey
        : settings.openaiKey;
    if (key) {
      setFreeRemaining(null);
      setIsFreeTierLimited(false);
      return;
    }
    fetch("/api/quota")
      .then((r) => r.json())
      .then((d) => {
        setFreeRemaining(d.remaining ?? null);
        setIsFreeTierLimited(d.limited ?? false);
      })
      .catch(() => {
        setFreeRemaining(null);
        setIsFreeTierLimited(false);
      });
  }, [settings.anthropicKey, settings.openaiKey, settings.customBaseUrl, settings.provider]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getApiKey() {
    if (settings.provider === "custom") return settings.customKey || "local";
    return settings.provider === "anthropic" ? settings.anthropicKey : settings.openaiKey;
  }

  function resolvePrompts(): (string | undefined)[] {
    if (settings.activeTripletId === "custom" && settings.triplet?.attiva) {
      return [
        buildCustomPrompt(settings.triplet.melchior),
        buildCustomPrompt(settings.triplet.balthasar),
        buildCustomPrompt(settings.triplet.casper),
      ];
    }
    const triplet =
      MAGI_TRIPLETS.find((t) => t.id === settings.activeTripletId) ?? MAGI_TRIPLETS[0];
    return triplet.units.map((u) => u.systemPrompt);
  }

  const updateSession = useCallback(
    (msgs: ChatMessage[], lastQuery: string) => {
      const activeTriplet =
        MAGI_TRIPLETS.find((t) => t.id === settings.activeTripletId) ?? MAGI_TRIPLETS[0];
      const userMessages = msgs.filter((m) => m.role === "user");
      const session: MagiSession = {
        id: sessionIdRef.current,
        tripletId: settings.activeTripletId,
        tripletName:
          settings.activeTripletId === "custom"
            ? settings.triplet?.melchior?.nome || t.custom.fallbackName
            : activeTriplet.name,
        startedAt: msgs[0]?.timestamp?.toISOString() ?? new Date().toISOString(),
        queries: userMessages.length,
        lastQuery,
        messages: msgs,
      };
      saveSession(session);
    },
    [settings]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    setInput("");
    setLoading(true);
    setLiveUnits({ melchior: null, balthasar: null, casper: null });
    setExpandedUnit(null);

    const userMsg: ChatMessage = { role: "user", content: query, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);

    // Test mode
    if (query === "/test") {
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
      const magiMsg: ChatMessage = { role: "magi", content: testResponse, timestamp: new Date() };
      // Simulate deliberation: keep the blinking frame on for 1s, then resolve.
      setTimeout(() => {
        setLiveUnits({ melchior: testResponse.melchior, balthasar: testResponse.balthasar, casper: testResponse.casper });
        setMessages((prev) => {
          const next = [...prev, magiMsg];
          updateSession(next, query);
          return next;
        });
        setLoading(false);
      }, 1000);
      return;
    }

    const apiKey = getApiKey() || undefined;
    const basePayload = {
      query,
      provider: settings.provider,
      apiKey,
      ...(settings.provider === "custom"
        ? { baseUrl: settings.customBaseUrl || undefined, model: settings.customModel || undefined }
        : {}),
    };
    const prompts = resolvePrompts();

    // Pre-check quota before wasting unit calls
    if (!apiKey && freeRemaining !== null && freeRemaining <= 0) {
      setMessages((prev) => [
        ...prev,
        { role: "magi", content: "quota_exceeded", timestamp: new Date() },
      ]);
      setLoading(false);
      return;
    }

    try {
      const [melchior, balthasar, casper] = await Promise.all(
        UNIT_ENDPOINTS.map((endpoint, i) =>
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...basePayload, customPrompt: prompts[i] }),
          }).then((r) => r.json() as Promise<UnitResponse>)
        )
      );

      setLiveUnits({ melchior, balthasar, casper });

      const modRes = await fetch("/api/moderator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...basePayload, melchior, balthasar, casper }),
      });

      if (modRes.status === 429) {
        setFreeRemaining(0);
        setMessages((prev) => [
          ...prev,
          { role: "magi", content: "quota_exceeded", timestamp: new Date() },
        ]);
        setLoading(false);
        return;
      }

      const moderator: ModeratorResponse = await modRes.json();

      if (!apiKey) setFreeRemaining((r) => (r !== null ? Math.max(0, r - 1) : null));

      const full: MagiFullResponse = { query, melchior, balthasar, casper, moderator };
      const magiMsg: ChatMessage = { role: "magi", content: full, timestamp: new Date() };
      setMessages((prev) => {
        const next = [...prev, magiMsg];
        updateSession(next, query);
        return next;
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "magi", content: t.chat.systemError, timestamp: new Date() },
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

  const lastQuery =
    lastMagi && typeof lastMagi.content !== "string"
      ? (lastMagi.content as MagiFullResponse).query
      : ([...messages].reverse().find((m) => m.role === "user")?.content as string) ?? "";

  const lastModerator =
    lastMagi && typeof lastMagi.content !== "string"
      ? (lastMagi.content as MagiFullResponse).moderator
      : null;

  const providerMeta = PROVIDER_LABEL[settings.provider];

  const activeTriplet =
    settings.activeTripletId === "custom"
      ? null
      : (MAGI_TRIPLETS.find((t) => t.id === settings.activeTripletId) ?? MAGI_TRIPLETS[0]);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#0a0a0a", color: "#E0E0D0" }}>
      {/* Header */}
      <div
        className="border-b px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between shrink-0 gap-2"
        style={{ borderColor: "#2a2a2a", background: "#0d0d0d" }}
      >
        <div className="font-mono min-w-0 flex items-center gap-3">
          <span className="text-sm font-bold tracking-widest text-gray-200 shrink-0">MAGI SYSTEM</span>
          <Link
            href="/market"
            className="hidden sm:inline-flex items-center gap-1 text-xs tracking-widest transition-colors hover:text-gray-300 truncate"
            style={{ color: "#4a4a4a" }}
          >
            ⬡ {activeTriplet?.name ?? (settings.triplet?.melchior?.nome || t.custom.fallbackName)}
          </Link>
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

      {/* Unit Panels */}
      {nerv ? (
        <div className="flex-1 min-h-0 border-b" style={{ borderColor: "#1a1a1a", background: "#0a0a0a" }}>
          <MagiClassicDisplay units={displayUnits} moderator={lastModerator} query={lastQuery} loading={loading} />
        </div>
      ) : (
      <div
        className={`flex flex-col sm:flex-row gap-2 px-3 sm:px-6 py-3 border-b transition-all ${
          expandedUnit ? "flex-1 min-h-0" : "shrink-0"
        }`}
        style={{ borderColor: "#2a2a2a" }}
      >
        {UNIT_KEYS.map((key, i) => {
          const unit = activeTriplet?.units[i];
          const customUnit = settings.activeTripletId === "custom" && settings.triplet?.attiva
            ? settings.triplet[key]
            : null;
          const name = unit?.name ?? customUnit?.nome?.trim() ?? ["MELCHIOR-1", "BALTHASAR-2", "CASPER-3"][i];
          const subtitle = unit?.role ?? customUnit?.ambito?.trim() ?? t.chat.unitSubs[i];
          const accent = unit ? COLOR_MAP[unit.color] : ["#3B8BEB", "#1DB87E", "#E89020"][i];
          return (
            <NodePanel
              key={key}
              name={name}
              subtitle={subtitle}
              accent={accent}
              data={displayUnits[key]}
              loading={loading}
              isExpanded={expandedUnit === key}
              onExpand={() => setExpandedUnit(expandedUnit === key ? null : key)}
            />
          );
        })}
      </div>
      )}

      {/* Chat Area */}
      <div className={`flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 font-mono text-sm min-h-0 ${
        nerv ? "hidden" : ""
      } ${
        expandedUnit ? "hidden sm:flex sm:flex-col" : ""
      }`}>
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-xs mt-8 sm:mt-12 space-y-2">
            <div className="text-xl sm:text-2xl tracking-widest">⬡ MAGI ⬡</div>
            <div>{t.chat.awaitingTitle}</div>
            <div className="text-gray-700 text-xs px-4">{t.chat.awaitingSubtitle}</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" ? (
              <div
                className="max-w-[85%] sm:max-w-2xl rounded px-3 sm:px-4 py-2 text-sm break-words"
                style={{ background: "#1a1a2e", border: "1px solid #3B8BEB30", color: "#E0E0D0" }}
              >
                <span className="text-xs text-blue-500 block mb-1">{t.chat.operator}</span>
                {msg.content as string}
              </div>
            ) : typeof msg.content === "string" ? (
              msg.content === "quota_exceeded" ? (
                <div
                  className="max-w-[85%] sm:max-w-2xl rounded px-3 sm:px-4 py-3 text-xs break-words space-y-1"
                  style={{ background: "#1a0a0a", border: "1px solid #E8902030", color: "#E89020" }}
                >
                  <div>⚠ {t.chat.quotaExceeded}</div>
                  <div>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                    >
                      {t.chat.quotaAddKey}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="max-w-[85%] sm:max-w-2xl rounded px-3 sm:px-4 py-2 text-xs break-words"
                  style={{ background: "#1a0a0a", border: "1px solid #E8902030", color: "#E89020" }}
                >
                  ⚠ {msg.content}
                </div>
              )
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
              <span className="hidden sm:inline">{t.chat.deliberating}</span>
              <span className="sm:hidden">{t.chat.deliberatingShort}</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Free tier remaining badge */}
      {isFreeTierLimited && freeRemaining !== null && (
        <div
          className="shrink-0 px-3 sm:px-6 py-1 flex items-center justify-end gap-1.5 border-t font-mono"
          style={{ borderColor: "#2a2a2a", background: "#0d0d0d" }}
        >
          {freeRemaining > 0 ? (
            <span className="text-xs tracking-widest" style={{ color: "#4a4a4a" }}>
              {t.chat.freeRemaining(freeRemaining)}
            </span>
          ) : (
            <button
              onClick={() => setShowSettings(true)}
              className="text-xs tracking-widest underline underline-offset-2 hover:opacity-70 transition-opacity"
              style={{ color: "#E89020" }}
            >
              {t.chat.quotaAddKey}
            </button>
          )}
        </div>
      )}

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
            placeholder={t.chat.placeholder}
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
            {t.chat.send}
          </button>
        </div>
      </form>

      {showSettings && (
        <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
