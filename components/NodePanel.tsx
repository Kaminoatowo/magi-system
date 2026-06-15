"use client";

import { UnitResponse, MagiVerdict } from "@/lib/types";
import { useLanguage } from "@/lib/language-context";

interface NodePanelProps {
  name: string;
  subtitle: string;
  accent: string;
  data: UnitResponse | null;
  loading: boolean;
  isExpanded: boolean;
  onExpand: () => void;
}

const verdictColor: Record<MagiVerdict, string> = {
  APPROVE: "text-green-400",
  REJECT: "text-red-400",
  CAUTION: "text-yellow-400",
};

const verdictBg: Record<MagiVerdict, string> = {
  APPROVE: "bg-green-400/10 border-green-400/30",
  REJECT: "bg-red-400/10 border-red-400/30",
  CAUTION: "bg-yellow-400/10 border-yellow-400/30",
};

export default function NodePanel({ name, subtitle, accent, data, loading, isExpanded, onExpand }: NodePanelProps) {
  const { t } = useLanguage();

  const canExpand = !loading && !!data;

  return (
    <div
      className={`border rounded transition-all duration-300 relative overflow-hidden ${
        isExpanded
          ? "flex-1 min-w-0 flex flex-col"
          : "min-w-0 shrink-0 sm:flex-1"
      }`}
      style={{
        borderColor: loading ? accent : isExpanded ? `${accent}60` : "#2a2a2a",
        background: "#111111",
        boxShadow: loading ? `0 0 16px ${accent}40, inset 0 0 16px ${accent}08` : "none",
      }}
    >
      {loading && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}30, transparent)`,
            animation: "pulse-scan 1.5s linear infinite",
          }}
        />
      )}

      {/* Mobile compact row */}
      <div
        className={`flex items-center gap-2 p-3 sm:hidden ${canExpand ? "cursor-pointer select-none" : ""}`}
        onClick={() => canExpand && onExpand()}
      >
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            backgroundColor: loading ? accent : data ? accent : "#2a2a2a",
            boxShadow: loading ? `0 0 8px ${accent}` : "none",
            animation: loading ? "blink 1s step-end infinite" : "none",
          }}
        />
        <span className="text-xs font-bold tracking-widest flex-1 truncate" style={{ color: accent }}>
          {name}
        </span>
        {loading && (
          <span className="text-xs text-gray-500 animate-pulse">...</span>
        )}
        {data && !loading && (
          <>
            <div
              className={`border rounded px-2 py-0.5 text-xs font-bold tracking-widest shrink-0 ${verdictColor[data.verdetto]} ${verdictBg[data.verdetto]}`}
            >
              {data.verdetto}
            </div>
            <span className="text-gray-600 text-xs shrink-0">{isExpanded ? "▲" : "▼"}</span>
          </>
        )}
      </div>

      {/* Mobile expanded content */}
      {isExpanded && data && (
        <div className="sm:hidden flex-1 overflow-y-auto px-3 pb-3 border-t" style={{ borderColor: "#1e1e1e" }}>
          <p className="text-xs text-gray-300 leading-relaxed mt-2">{data.sintesi}</p>
        </div>
      )}

      {/* Desktop full view */}
      <div className="hidden sm:flex sm:flex-col gap-3 p-4">
        <div className="flex items-center gap-2 justify-between shrink-0">
          <div className="min-w-0">
            <span className="text-xs font-bold tracking-widest block truncate" style={{ color: accent }}>
              {name}
            </span>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <div
            className="w-2 h-2 rounded-full shrink-0 transition-all duration-300"
            style={{
              backgroundColor: loading ? accent : data ? accent : "#2a2a2a",
              boxShadow: loading ? `0 0 8px ${accent}` : "none",
              animation: loading ? "blink 1s step-end infinite" : "none",
            }}
          />
        </div>

        <div className="flex-1 min-h-[60px] flex flex-col justify-center gap-2">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span style={{ color: accent }}>▋</span>
              <span className="animate-pulse">{t.nodePanel.processing}</span>
            </div>
          )}
          {!loading && data && (
            <p className="text-sm text-gray-300 leading-relaxed">{data.sintesi}</p>
          )}
          {!loading && !data && (
            <p className="text-xs text-gray-600 italic">{t.nodePanel.awaiting}</p>
          )}
          {data && !loading && (
            <div
              className={`border rounded px-3 py-1.5 text-center text-xs font-bold tracking-widest w-full ${verdictColor[data.verdetto]} ${verdictBg[data.verdetto]}`}
            >
              {data.verdetto}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
