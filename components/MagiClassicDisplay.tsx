"use client";

import { UnitResponse, MagiVerdict, ModeratorResponse } from "@/lib/types";
import { VERDICT_KANJI, tallyVotes, resultCode } from "@/lib/votes";
import { useLanguage } from "@/lib/language-context";

type Lang = "it" | "en";

// kanji → spoken-language label (under each verdict / global result)
const VERDICT_LABEL: Record<MagiVerdict, Record<Lang, string>> = {
  APPROVE: { it: "Approvazione", en: "Approval" },
  REJECT: { it: "Opposizione", en: "Opposition" },
  CAUTION: { it: "Riserva", en: "Reservation" },
};
const RESULT_LABEL: Record<string, Record<Lang, string>> = {
  可決: { it: "Approvato", en: "Approved" },
  否決: { it: "Respinto", en: "Rejected" },
  判断保留: { it: "In sospeso", en: "Held" },
};
const UI_LABEL = {
  query: { it: "QUESITO", en: "QUERY" },
  verdict: { it: "VERDETTO", en: "VERDICT" },
};

// NERV-classic MAGI display (ref: the 起動 / startup screen).
// Black ground, teal panels with orange edges, orange connector web, MAGI core.
// Balthasar top, Casper bottom-left, Melchior bottom-right.

const GREEN = "#7BE6C4";
const ORANGE = "#F5A800";
const BLACK = "#0a0a0a";
// a unit that opposes turns red — same brightness/flat style as the teal, redder hue
const RED_PANEL = "#F26B6B";
// final-decision colour ramp by result code: net approve → green … net reject → red
const FINAL_COLOR: Record<number, string> = {
  200: "#5FE3A1", // net positive — verdino
  250: "#A8E063", // majority positive
  350: "#F59E3C", // majority negative
  400: "#EF4444", // net negative — red
};

const SANS = "Arial, Helvetica, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

type UnitId = "balthasar" | "casper" | "melchior";

interface Props {
  units: {
    melchior: UnitResponse | null;
    balthasar: UnitResponse | null;
    casper: UnitResponse | null;
  };
  moderator: ModeratorResponse | null;
  query: string;
  loading: boolean;
}

// Stable pseudo CODE from the query, like the original's "CODE : 001".
function codeFromQuery(q: string): string {
  let h = 0;
  for (let i = 0; i < q.length; i++) h = (h * 31 + q.charCodeAt(i)) | 0;
  return String(Math.abs(h) % 1000).padStart(3, "0");
}

const POS: Record<UnitId, { left: string; width: string; top: string; height: string }> = {
  balthasar: { left: "35%", width: "30%", top: "0%", height: "55%" },
  casper: { left: "6%", width: "32%", top: "55%", height: "44%" },
  melchior: { left: "62%", width: "32%", top: "55%", height: "44%" },
};

// chamfer facing the centre core
const CLIP: Record<UnitId, string> = {
  balthasar: "polygon(0 0, 100% 0, 100% 68%, 72% 100%, 28% 100%, 0 68%)",
  casper: "polygon(0 0, 76% 0, 100% 34%, 100% 100%, 0 100%)",
  melchior: "polygon(24% 0, 100% 0, 100% 100%, 0 100%, 0 34%)",
};

function Panel({ id, name, n, data, lang }: { id: UnitId; name: string; n: number; data: UnitResponse | null; lang: Lang }) {
  const p = POS[id];
  const v: MagiVerdict | null = data?.verdetto ?? null;
  return (
    <div className="absolute" style={{ ...p, clipPath: CLIP[id], background: ORANGE }}>
      <div
        className="absolute inset-[2px] flex flex-col items-center justify-center text-center px-2"
        style={{ clipPath: CLIP[id], background: v === "REJECT" ? RED_PANEL : GREEN, color: BLACK }}
      >
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: "clamp(11px, 2.1vw, 20px)", letterSpacing: "0.02em" }}>
          {name} · {n}
        </div>
        {v && (
          <>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: "clamp(12px, 2.4vw, 22px)", marginTop: 4 }}>
              {VERDICT_KANJI[v]}
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: "clamp(8px, 1.4vw, 12px)", marginTop: 1, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {VERDICT_LABEL[v][lang]}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Kido() {
  return (
    <div className="flex flex-col" style={{ color: ORANGE }}>
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: "clamp(16px, 3.6vw, 38px)", lineHeight: 1 }}>起動</span>
      <span style={{ height: 3, background: ORANGE, marginTop: 5 }} />
      <span style={{ height: 3, background: ORANGE, marginTop: 3 }} />
    </div>
  );
}

export default function MagiClassicDisplay({ units, moderator, query, loading }: Props) {
  const { lang } = useLanguage();
  const verdicts = [units.melchior, units.balthasar, units.casper]
    .filter((u): u is UnitResponse => !!u)
    .map((u) => u.verdetto);
  const tally = tallyVotes(verdicts);
  const complete = verdicts.length === 3;
  const rcode = complete ? resultCode(tally) : null;
  const code = rcode ?? codeFromQuery(query || "MAGI");
  const finalColor = (rcode && FINAL_COLOR[rcode]) || GREEN;

  const statusTop = loading ? "DELIBERATING" : complete ? "COMPLETED" : "STANDBY";
  const statusBot = loading ? "ANALYSIS RUNNING..." : complete ? "DELIBERATION COMPLETE" : "STARTUP INITIATING...";

  return (
    <div className="relative w-full h-full flex items-center justify-center px-3 py-2" style={{ background: BLACK }}>
      {/* RESPONSE — far-left column: verdict + motivation */}
      {complete && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex flex-col justify-center gap-1 px-2 sm:px-3" style={{ width: "max(64px, calc((100% - 1040px) / 2))" }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: "clamp(8px, 1.4vw, 12px)", letterSpacing: "0.12em", color: ORANGE }}>
            {UI_LABEL.verdict[lang]}{moderator ? ` · ${moderator.stato}` : ""}
          </div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(18px, 3.2vw, 34px)", lineHeight: 1.1, color: finalColor }}>
            {tally.resultKanji}
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: "clamp(9px, 1.6vw, 15px)", textTransform: "uppercase", letterSpacing: "0.04em", color: finalColor }}>
            {RESULT_LABEL[tally.resultKanji]?.[lang]}
          </div>
          {moderator?.verdetto_finale && (
            <div style={{ fontFamily: SANS, fontSize: "clamp(8px, 1.1vw, 12px)", lineHeight: 1.35, marginTop: 6, color: "#CFFAEA", wordBreak: "break-word", overflowY: "auto", maxHeight: "55%" }}>
              {moderator.verdetto_finale}
            </div>
          )}
        </div>
      )}

      {/* QUERY — far-right column */}
      {query && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex flex-col justify-center gap-1 px-2 sm:px-3 text-right" style={{ width: "max(64px, calc((100% - 1040px) / 2))" }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: "clamp(8px, 1.4vw, 12px)", letterSpacing: "0.12em", color: ORANGE }}>
            {UI_LABEL.query[lang]}
          </div>
          <div style={{ fontFamily: SANS, fontSize: "clamp(10px, 1.6vw, 16px)", lineHeight: 1.3, color: GREEN, wordBreak: "break-word" }}>
            {query}
          </div>
        </div>
      )}

      <div className="relative w-full h-full" style={{ maxWidth: 1000, maxHeight: 560 }}>
        {/* orange connector frame around the central gap (behind panels) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[
            "44,54 35,93",
            "56,54 65,93",
            "35,93 65,93",
          ].map((points, i) => (
            <polyline
              key={i}
              points={points}
              stroke={ORANGE}
              strokeWidth={11}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* startup headers */}
        <div className="absolute" style={{ left: "8%", top: "5%" }}>
          <Kido />
        </div>
        <div className="absolute" style={{ right: "8%", top: "5%" }}>
          <Kido />
        </div>

        {/* code block */}
        <div className="absolute" style={{ left: "5%", top: "20%", color: ORANGE }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(12px, 2.4vw, 24px)" }}>
            CODE : {code}
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: "clamp(7px, 1.3vw, 11px)", marginTop: 4, lineHeight: 1.3, letterSpacing: "0.05em" }}>
            <div>{statusTop}</div>
            {!complete && <div>{statusBot}</div>}
          </div>
        </div>

        {/* panels */}
        <Panel id="balthasar" name="BALTHASAR" n={2} data={units.balthasar} lang={lang} />
        <Panel id="casper" name="CASPER" n={3} data={units.casper} lang={lang} />
        <Panel id="melchior" name="MELCHIOR" n={1} data={units.melchior} lang={lang} />

        {/* MAGI core text */}
        <div
          className="absolute text-center"
          style={{ left: "50%", top: "72%", transform: "translate(-50%, -50%)", color: ORANGE, zIndex: 20 }}
        >
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(18px, 4.4vw, 46px)", lineHeight: 1 }}>MAGI</div>
        </div>

        {/* deliberation frame — blinks while the MAGI deliberate */}
        {loading && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: "3%",
              right: "3%",
              top: "0%",
              bottom: "1%",
              border: `3px solid ${ORANGE}`,
              animation: "blink 1s step-end infinite",
              zIndex: 30,
            }}
          />
        )}
      </div>
    </div>
  );
}
