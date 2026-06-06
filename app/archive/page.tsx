"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagiSession } from "@/lib/types";
import { DOMAIN_LABEL } from "@/lib/triplets";
import { MAGI_TRIPLETS } from "@/lib/triplets";

const DOMAIN_COLOR: Record<string, string> = {
  general: "#3B8BEB",
  science: "#1DB87E",
  law: "#E89020",
  daily: "#a78bfa",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function ArchivePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<MagiSession[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("magi-sessions");
      if (raw) setSessions(JSON.parse(raw));
    } catch {}
  }, []);

  function reopen(session: MagiSession) {
    localStorage.setItem("magi-pending-session", JSON.stringify(session));
    router.push("/");
  }

  function getDomain(tripletId: string): string {
    return MAGI_TRIPLETS.find((t) => t.id === tripletId)?.domain ?? "general";
  }

  return (
    <div className="h-full overflow-y-auto font-mono" style={{ background: "#0a0a0a", color: "#E0E0D0" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-sm font-bold tracking-widest text-gray-200">ARCHIVE</h1>
          <p className="text-xs text-gray-600">
            {sessions.length > 0
              ? `${sessions.length} session${sessions.length === 1 ? "e" : "i"} registrat${sessions.length === 1 ? "a" : "e"}.`
              : "Nessuna sessione registrata."}
          </p>
        </div>

        {sessions.length === 0 && (
          <div
            className="rounded border px-6 py-12 text-center"
            style={{ borderColor: "#2a2a2a", background: "#111111" }}
          >
            <div className="text-2xl tracking-widest text-gray-700 mb-3">⬡</div>
            <div className="text-xs text-gray-600">
              Le sessioni appariranno qui dopo la prima query.
            </div>
          </div>
        )}

        {/* Session list */}
        <div className="space-y-3">
          {sessions.map((session) => {
            const domain = getDomain(session.tripletId);
            const domainColor = DOMAIN_COLOR[domain] ?? "#9ca3af";
            return (
              <div
                key={session.id}
                className="border rounded p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all"
                style={{ borderColor: "#2a2a2a", background: "#111111" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3a3a3a")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
              >
                {/* Session info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold tracking-widest text-gray-200">
                      {session.tripletName}
                    </span>
                    <span
                      className="text-xs font-bold tracking-widest px-1.5 py-0.5 rounded border"
                      style={{
                        borderColor: `${domainColor}40`,
                        color: domainColor,
                        background: `${domainColor}10`,
                      }}
                    >
                      {DOMAIN_LABEL[domain] ?? domain.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {truncate(session.lastQuery, 80)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>{formatDate(session.startedAt)}</span>
                    <span>·</span>
                    <span>
                      {session.queries} quer{session.queries === 1 ? "y" : "ies"}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => reopen(session)}
                  className="shrink-0 px-4 py-2 rounded border text-xs font-bold tracking-widest transition-all self-start sm:self-center"
                  style={{ borderColor: "#2a2a2a", color: "#9ca3af", background: "transparent" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#3B8BEB50";
                    e.currentTarget.style.color = "#E0E0D0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#2a2a2a";
                    e.currentTarget.style.color = "#9ca3af";
                  }}
                >
                  RIAPRI
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
