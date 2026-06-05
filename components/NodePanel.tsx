"use client";

import { UnitResponse, MagiVerdict } from "@/lib/types";

interface NodePanelProps {
  name: string;
  subtitle: string;
  accent: string;
  data: UnitResponse | null;
  loading: boolean;
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

export default function NodePanel({ name, subtitle, accent, data, loading }: NodePanelProps) {
  return (
    <div
      className="flex-1 min-w-0 border rounded p-4 flex flex-col gap-3 transition-all duration-300 relative overflow-hidden"
      style={{
        borderColor: loading ? accent : "#2a2a2a",
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

      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold tracking-widest" style={{ color: accent }}>
            {name}
          </span>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <div
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{
            backgroundColor: loading ? accent : data ? accent : "#2a2a2a",
            boxShadow: loading ? `0 0 8px ${accent}` : "none",
            animation: loading ? "blink 1s step-end infinite" : "none",
          }}
        />
      </div>

      <div className="flex-1 min-h-[60px]">
        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span style={{ color: accent }}>▋</span>
            <span className="animate-pulse">ELABORAZIONE IN CORSO...</span>
          </div>
        )}
        {!loading && data && (
          <p className="text-sm text-gray-300 leading-relaxed">{data.sintesi}</p>
        )}
        {!loading && !data && (
          <p className="text-xs text-gray-600 italic">IN ATTESA DI INPUT</p>
        )}
      </div>

      {data && !loading && (
        <div
          className={`border rounded px-3 py-1.5 text-center text-xs font-bold tracking-widest ${verdictColor[data.verdetto]} ${verdictBg[data.verdetto]}`}
        >
          {data.verdetto}
        </div>
      )}
    </div>
  );
}
