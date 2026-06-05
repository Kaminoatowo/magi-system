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

const verdictPrintClass: Record<MagiVerdict, string> = {
  APPROVE: "print-approve",
  REJECT: "print-reject",
  CAUTION: "print-caution",
};

const unitAccent: Record<string, string> = {
  melchior: "#3B8BEB",
  balthasar: "#1DB87E",
  casper: "#E89020",
};

const unitPrintClass: Record<string, string> = {
  melchior: "print-melchior",
  balthasar: "print-balthasar",
  casper: "print-casper",
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

  function handlePrint() {
    const prev = document.title;
    document.title = `MAGI Report — ${new Date().toISOString().slice(0, 10)}`;
    window.print();
    document.title = prev;
  }

  return (
    <div
      id="magi-print-target"
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
              <span
                className={`font-bold tracking-wider ${unitPrintClass[key]}`}
                style={{ color: unitAccent[key] }}
              >
                {label}
              </span>
              <span className="text-gray-600 hidden sm:inline">/ {sub}</span>
              <span
                className={`ml-auto sm:ml-0 text-xs font-bold px-1.5 py-0.5 rounded border ${verdictPrintClass[resp.verdetto]}`}
                style={{
                  color: verdictColor[resp.verdetto],
                  borderColor: `${verdictColor[resp.verdetto]}40`,
                  background: `${verdictColor[resp.verdetto]}10`,
                }}
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
        className="print-section-bg px-3 sm:px-4 py-3 border-t space-y-1"
        style={{ borderColor: "#2a2a2a", background: `${color}08` }}
      >
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="text-gray-600">STATO:</span>
          <span className={`font-bold tracking-widest print-stato`} style={{ color }}>{stato}</span>
        </div>
        <div>
          <span className="text-gray-600">VERDETTO: </span>
          <span className={`break-words print-stato`} style={{ color }}>{data.moderator.verdetto_finale}</span>
        </div>
        {data.moderator.nota && (
          <div>
            <span className="text-gray-600">NOTA: </span>
            <span className="text-gray-400 break-words">{data.moderator.nota}</span>
          </div>
        )}
      </div>

      {/* Footer: stato badge + print button */}
      <div
        className="px-3 sm:px-4 py-2 border-t flex items-center justify-between gap-3"
        style={{ borderColor: "#2a2a2a" }}
      >
        <span className={`font-bold tracking-widest text-sm print-stato`} style={{ color }}>
          {statoLabel[stato]}
        </span>
        <button
          onClick={handlePrint}
          className="no-print shrink-0 border rounded px-3 py-1 text-xs font-bold tracking-widest transition-colors"
          style={{ borderColor: "#2a2a2a", color: "#6b7280" }}
          onMouseEnter={(e) => {
            (e.currentTarget).style.borderColor = color;
            (e.currentTarget).style.color = color;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget).style.borderColor = "#2a2a2a";
            (e.currentTarget).style.color = "#6b7280";
          }}
          aria-label="Stampa report"
        >
          ⎙ STAMPA
        </button>
      </div>
    </div>
  );
}
