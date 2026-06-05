"use client";

import { useEffect, useState } from "react";
import { MagiFullResponse, MagiStato, MagiVerdict } from "@/lib/types";

interface MagiReportProps {
  data: MagiFullResponse;
}

const statoColor: Record<MagiStato, string> = {
  CONSENSUS: "#1DB87E",
  MAJORITY: "#3B8BEB",
  DEADLOCK: "#E89020",
};

const statoLabel: Record<MagiStato, string> = {
  CONSENSUS: "██ CONSENSUS RAGGIUNTO",
  MAJORITY: "▓▓ MAGGIORANZA 2/3",
  DEADLOCK: "░░ DEADLOCK — RINVIO UMANO",
};

const verdictColor: Record<MagiVerdict, string> = {
  APPROVE: "#4ade80",
  REJECT: "#f87171",
  CAUTION: "#fbbf24",
};

const unitAccent: Record<string, string> = {
  melchior: "#3B8BEB",
  balthasar: "#1DB87E",
  casper: "#E89020",
};

export default function MagiReport({ data }: MagiReportProps) {
  const stato = data.moderator.stato;
  const color = statoColor[stato];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, [data]);

  const units = [
    { key: "melchior", label: "MELCHIOR-1", sub: "SCIENZIATA", resp: data.melchior },
    { key: "balthasar", label: "BALTHASAR-2", sub: "MADRE", resp: data.balthasar },
    { key: "casper", label: "CASPER-3", sub: "DONNA", resp: data.casper },
  ] as const;

  return (
    <div
      className={`rounded border font-mono text-xs leading-relaxed transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ borderColor: "#2a2a2a", background: "#0d0d0d" }}
    >
      {/* Header */}
      <div
        className="px-3 sm:px-4 py-2 border-b text-center tracking-widest text-gray-500"
        style={{ borderColor: "#2a2a2a" }}
      >
        S I S T E M A &nbsp; M A G I &nbsp; — &nbsp; R E P O R T
      </div>

      {/* Query */}
      <div className="px-3 sm:px-4 py-2 border-b" style={{ borderColor: "#1a1a1a" }}>
        <span className="text-gray-600">QUERY: </span>
        <span className="text-gray-300 break-words">{data.query}</span>
      </div>

      {/* Unit rows */}
      <div className="divide-y" style={{ borderColor: "#1a1a1a" }}>
        {units.map(({ key, label, sub, resp }) => (
          <div key={key} className="px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
            <div className="flex items-center gap-2 sm:w-44 shrink-0">
              <span className="font-bold tracking-wider" style={{ color: unitAccent[key] }}>
                {label}
              </span>
              <span className="text-gray-600 hidden sm:inline">/ {sub}</span>
              <span
                className="ml-auto sm:ml-0 text-xs font-bold px-1.5 py-0.5 rounded border"
                style={{ color: verdictColor[resp.verdetto], borderColor: `${verdictColor[resp.verdetto]}40`, background: `${verdictColor[resp.verdetto]}10` }}
              >
                {resp.verdetto}
              </span>
            </div>
            <p className="text-gray-400 break-words flex-1">{resp.sintesi}</p>
          </div>
        ))}
      </div>

      {/* Verdict */}
      <div
        className="px-3 sm:px-4 py-3 border-t space-y-1"
        style={{ borderColor: "#2a2a2a", background: `${color}08` }}
      >
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="text-gray-600">STATO:</span>
          <span className="font-bold tracking-widest" style={{ color }}>{stato}</span>
        </div>
        <div>
          <span className="text-gray-600">VERDETTO: </span>
          <span className="break-words" style={{ color }}>{data.moderator.verdetto_finale}</span>
        </div>
        {data.moderator.nota && (
          <div>
            <span className="text-gray-600">NOTA: </span>
            <span className="text-gray-400 break-words">{data.moderator.nota}</span>
          </div>
        )}
      </div>

      {/* Footer badge */}
      <div className="px-3 sm:px-4 py-2 border-t text-center font-bold tracking-widest text-sm" style={{ borderColor: "#2a2a2a", color }}>
        {statoLabel[stato]}
      </div>
    </div>
  );
}
