"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MAGI_TRIPLETS, COLOR_MAP, DOMAIN_LABEL } from "@/lib/triplets";
import { MagiSettings } from "@/lib/types";
import { useLanguage } from "@/lib/language-context";

const DEFAULT_ACTIVE = "evangelion-classic";

function loadActiveId(): string {
  if (typeof window === "undefined") return DEFAULT_ACTIVE;
  try {
    const raw = localStorage.getItem("magi-settings");
    if (!raw) return DEFAULT_ACTIVE;
    const s: MagiSettings = JSON.parse(raw);
    return s.activeTripletId ?? DEFAULT_ACTIVE;
  } catch {
    return DEFAULT_ACTIVE;
  }
}

function setActiveId(id: string) {
  const raw = localStorage.getItem("magi-settings");
  const existing: Partial<MagiSettings> = raw ? JSON.parse(raw) : {};
  localStorage.setItem("magi-settings", JSON.stringify({ ...existing, activeTripletId: id }));
}

const DOMAIN_COLOR: Record<string, string> = {
  general: "#3B8BEB",
  science: "#1DB87E",
  law: "#E89020",
  daily: "#a78bfa",
};

export default function MarketPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeId, setActiveIdState] = useState(DEFAULT_ACTIVE);

  useEffect(() => {
    setActiveIdState(loadActiveId());
  }, []);

  function activate(id: string) {
    setActiveId(id);
    setActiveIdState(id);
    router.push("/");
  }

  return (
    <div className="h-full overflow-y-auto font-mono" style={{ background: "#0a0a0a", color: "#E0E0D0" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-sm font-bold tracking-widest text-gray-200">MARKET</h1>
          <p className="text-xs text-gray-600">{t.market.subtitle}</p>
        </div>

        {/* Triplet grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MAGI_TRIPLETS.map((triplet) => {
            const isActive = activeId === triplet.id;
            const domainColor = DOMAIN_COLOR[triplet.domain] ?? "#9ca3af";
            return (
              <div
                key={triplet.id}
                className="border rounded p-5 flex flex-col gap-4 transition-all"
                style={{
                  borderColor: isActive ? "#3B8BEB" : "#2a2a2a",
                  background: isActive ? "#0d1a2e" : "#111111",
                  boxShadow: isActive ? "0 0 20px #3B8BEB20" : "none",
                }}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="text-base font-bold tracking-widest text-gray-100 truncate">
                      {triplet.name}
                    </div>
                    <div className="text-xs text-gray-500 leading-relaxed">{triplet.description}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className="text-xs font-bold tracking-widest px-2 py-0.5 rounded border"
                      style={{ borderColor: `${domainColor}50`, color: domainColor, background: `${domainColor}10` }}
                    >
                      {DOMAIN_LABEL[triplet.domain]}
                    </span>
                    {isActive && (
                      <span className="text-xs font-bold tracking-widest" style={{ color: "#3B8BEB" }}>
                        {t.market.active}
                      </span>
                    )}
                  </div>
                </div>

                {/* Unit badges */}
                <div className="flex flex-col gap-1.5">
                  {triplet.units.map((unit) => {
                    const accent = COLOR_MAP[unit.color];
                    return (
                      <div
                        key={unit.id}
                        className="flex items-center gap-2 rounded px-2.5 py-1.5 text-xs"
                        style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}
                      >
                        <span className="font-bold tracking-widest shrink-0" style={{ color: accent }}>
                          {unit.name}
                        </span>
                        <span className="text-gray-600">·</span>
                        <span className="text-gray-400 truncate">{unit.role}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Action */}
                <button
                  onClick={() => activate(triplet.id)}
                  disabled={isActive}
                  className="mt-auto w-full py-2 rounded border text-xs font-bold tracking-widest transition-all disabled:opacity-40 disabled:cursor-default"
                  style={{
                    borderColor: isActive ? "#3B8BEB" : "#2a2a2a",
                    color: isActive ? "#3B8BEB" : "#9ca3af",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "#3B8BEB50";
                      e.currentTarget.style.color = "#E0E0D0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "#2a2a2a";
                      e.currentTarget.style.color = "#9ca3af";
                    }
                  }}
                >
                  {isActive ? t.market.systemActive : t.market.activate}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
