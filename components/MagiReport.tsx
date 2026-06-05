"use client";

import { useEffect, useState } from "react";
import { MagiFullResponse, MagiStato } from "@/lib/types";

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

const lines = (data: MagiFullResponse): string[] => [
  "╔══════════════════════════════════════════════════════╗",
  "║           S I S T E M A   M A G I   —   R E P O R T           ║",
  "╚══════════════════════════════════════════════════════╝",
  "",
  `QUERY: ${data.query}`,
  "",
  "═══════════════════════════════════════════════════════",
  "",
  `[MELCHIOR-1 / SCIENZIATA]  →  ${data.melchior.verdetto}`,
  `  ${data.melchior.sintesi}`,
  "",
  `[BALTHASAR-2 / MADRE]      →  ${data.balthasar.verdetto}`,
  `  ${data.balthasar.sintesi}`,
  "",
  `[CASPER-3 / DONNA]         →  ${data.casper.verdetto}`,
  `  ${data.casper.sintesi}`,
  "",
  "═══════════════════════════════════════════════════════",
  "",
  `STATO: ${data.moderator.stato}`,
  `VERDETTO FINALE: ${data.moderator.verdetto_finale}`,
  ...(data.moderator.nota ? ["", `NOTA: ${data.moderator.nota}`] : []),
  "",
  "═══════════════════════════════════════════════════════",
];

export default function MagiReport({ data }: MagiReportProps) {
  const allLines = lines(data);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= allLines.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [data]);

  const stato = data.moderator.stato;
  const color = statoColor[stato];

  return (
    <div className="rounded border p-4 font-mono text-xs leading-6" style={{ borderColor: "#2a2a2a", background: "#0d0d0d" }}>
      {allLines.slice(0, visibleCount).map((line, i) => {
        const isMelchior = line.startsWith("[MELCHIOR");
        const isBalthasar = line.startsWith("[BALTHASAR");
        const isCasper = line.startsWith("[CASPER");
        const isStato = line.startsWith("STATO:");
        const isVerdetto = line.startsWith("VERDETTO FINALE:");
        const isHeader = line.startsWith("╔") || line.startsWith("║") || line.startsWith("╚");
        const isSep = line.startsWith("═══");

        let lineColor = "#9ca3af";
        if (isMelchior) lineColor = "#3B8BEB";
        if (isBalthasar) lineColor = "#1DB87E";
        if (isCasper) lineColor = "#E89020";
        if (isStato || isVerdetto) lineColor = color;
        if (isHeader || isSep) lineColor = "#4b5563";

        return (
          <div key={i} style={{ color: lineColor }}>
            {line || " "}
          </div>
        );
      })}

      {visibleCount >= allLines.length && (
        <div className="mt-3 text-center font-bold tracking-widest text-sm" style={{ color }}>
          {statoLabel[stato]}
        </div>
      )}
    </div>
  );
}
