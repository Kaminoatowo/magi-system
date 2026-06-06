import { MagiFullResponse, MagiVerdict, MagiStato } from "./types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function refNumber() {
  return String(Math.floor(Math.random() * 99999)).padStart(6, "0");
}

function timestamp() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} · ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function statoScore(stato: MagiStato) {
  if (stato === "CONSENSUS") return "3 / 3 unità · accordo raggiunto";
  if (stato === "MAJORITY") return "2 / 3 unità · maggioranza";
  return "0 / 3 unità · stallo";
}

function statoClass(stato: MagiStato) {
  return `stato-${stato.toLowerCase()}`;
}

// Determine which units are aligned with the majority verdict
function alignedBars(data: MagiFullResponse): [string, string, string] {
  const { stato } = data.moderator;
  if (stato === "CONSENSUS") return ["lit", "lit", "lit"];
  if (stato === "DEADLOCK") return ["", "", ""];

  // MAJORITY: find the verdict shared by 2 units
  const verdicts: MagiVerdict[] = [
    data.melchior.verdetto,
    data.balthasar.verdetto,
    data.casper.verdetto,
  ];
  const counts = verdicts.reduce<Record<string, number>>((acc, v) => {
    acc[v] = (acc[v] ?? 0) + 1;
    return acc;
  }, {});
  const majority = (Object.entries(counts).find(([, c]) => c >= 2)?.[0] ?? "") as MagiVerdict;
  return [
    data.melchior.verdetto === majority ? "lit" : "",
    data.balthasar.verdetto === majority ? "lit" : "",
    data.casper.verdetto === majority ? "lit" : "",
  ];
}

export function buildPrintHtml(data: MagiFullResponse): string {
  const [barM, barB, barC] = alignedBars(data);

  const notaBlock = data.moderator.nota
    ? `<div class="verdict-nota">${escHtml(data.moderator.nota)}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MAGI SYSTEM — HOLOGRAPHIC OUTPUT</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;600&family=Orbitron:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #060a10;
    --surface: #080d14;
    --grid: rgba(32,160,220,0.06);
    --border: rgba(32,160,220,0.18);
    --border-bright: rgba(32,160,220,0.45);
    --ink: #a8cce0;
    --ink-dim: #4a7a96;
    --ink-bright: #d8eef8;
    --glow: rgba(32,160,220,0.12);

    --m-color: #38a8f8;
    --m-glow: rgba(56,168,248,0.15);
    --b-color: #28d898;
    --b-glow: rgba(40,216,152,0.15);
    --c-color: #f8a830;
    --c-glow: rgba(248,168,48,0.15);

    --approve: #28d898;
    --reject: #f84848;
    --caution: #f8a830;
    --consensus: #28d898;
    --majority: #38a8f8;
    --deadlock: #f84848;

    --font-ui: 'Rajdhani', sans-serif;
    --font-display: 'Orbitron', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #03060a;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 3rem 1rem;
    font-family: var(--font-ui);
  }

  .sheet {
    width: 720px;
    max-width: 100%;
    background: var(--surface);
    position: relative;
    padding: 2.8rem 2.6rem 2.4rem;
    background-image:
      linear-gradient(var(--grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid) 1px, transparent 1px);
    background-size: 32px 32px;
    border: 1px solid var(--border);
    clip-path: polygon(
      0 18px, 18px 0,
      calc(100% - 18px) 0, 100% 18px,
      100% calc(100% - 18px), calc(100% - 18px) 100%,
      18px 100%, 0 calc(100% - 18px)
    );
  }

  .sheet-outer {
    position: relative;
    width: 720px;
    max-width: 100%;
    filter: drop-shadow(0 0 18px rgba(32,160,220,0.10)) drop-shadow(0 0 40px rgba(32,160,220,0.05));
  }

  .sheet::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg,
      transparent 18px,
      var(--border-bright) 18px,
      var(--border-bright) 40%,
      rgba(32,160,220,0.6) 50%,
      var(--border-bright) 60%,
      var(--border-bright) calc(100% - 18px),
      transparent calc(100% - 18px)
    );
  }

  .corner { position: absolute; width: 28px; height: 28px; }
  .corner::before, .corner::after { content: ''; position: absolute; background: var(--m-color); }
  .corner::before { width: 100%; height: 1px; top: 0; }
  .corner::after  { width: 1px; height: 100%; left: 0; }
  .corner.tl { top: 0; left: 0; }
  .corner.tr { top: 0; right: 0; transform: scaleX(-1); }
  .corner.bl { bottom: 0; left: 0; transform: scaleY(-1); }
  .corner.br { bottom: 0; right: 0; transform: scale(-1,-1); }

  .hdr-eyebrow {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    letter-spacing: 0.22em;
    color: var(--ink-dim);
    font-weight: 300;
    margin-bottom: 14px;
    text-transform: uppercase;
  }

  .hdr-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.35em;
    color: var(--ink-bright);
    text-align: center;
    margin-bottom: 4px;
    text-shadow: 0 0 30px rgba(32,160,220,0.4);
  }

  .hdr-sub {
    font-size: 10px;
    letter-spacing: 0.28em;
    color: var(--ink-dim);
    text-align: center;
    font-weight: 300;
    margin-bottom: 18px;
    text-transform: uppercase;
  }

  .hdr-divider { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
  .hdr-divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--border-bright), transparent); }
  .hdr-divider-diamond { width: 6px; height: 6px; border: 1px solid var(--border-bright); transform: rotate(45deg); flex-shrink: 0; }

  .meta-row {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    letter-spacing: 0.14em;
    color: var(--ink-dim);
    margin-bottom: 20px;
    font-weight: 300;
  }
  .meta-row span { display: flex; align-items: center; gap: 5px; }
  .meta-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--consensus); box-shadow: 0 0 6px var(--consensus); flex-shrink: 0; }

  .section { margin-bottom: 20px; }
  .section-label {
    font-size: 8px;
    letter-spacing: 0.28em;
    color: var(--ink-dim);
    text-transform: uppercase;
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .query-box {
    border: 1px solid var(--border);
    background: rgba(32,160,220,0.03);
    padding: 12px 16px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--ink-bright);
    font-weight: 400;
    position: relative;
  }
  .query-box::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, var(--m-color), var(--b-color), var(--c-color));
    opacity: 0.6;
  }

  .units { display: flex; flex-direction: column; gap: 1px; }

  .unit {
    display: grid;
    grid-template-columns: 15rem 1fr;
    border: 1px solid var(--border);
    background: rgba(8,13,20,0.8);
    position: relative;
    overflow: hidden;
  }

  .unit::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 1px; }
  .unit-m::before { background: var(--m-color); box-shadow: 0 0 8px var(--m-color); opacity: 0.7; }
  .unit-b::before { background: var(--b-color); box-shadow: 0 0 8px var(--b-color); opacity: 0.7; }
  .unit-c::before { background: var(--c-color); box-shadow: 0 0 8px var(--c-color); opacity: 0.7; }

  .unit-left {
    padding: 12px 14px 12px 18px;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .unit-m .unit-left { background: var(--m-glow); }
  .unit-b .unit-left { background: var(--b-glow); }
  .unit-c .unit-left { background: var(--c-glow); }

  .unit-id { font-family: var(--font-display); font-size: 12px; font-weight: 700; letter-spacing: 0.1em; line-height: 1.2; }
  .unit-m .unit-id { color: var(--m-color); }
  .unit-b .unit-id { color: var(--b-color); }
  .unit-c .unit-id { color: var(--c-color); }

  .unit-role { font-size: 8px; letter-spacing: 0.22em; color: var(--ink-dim); font-weight: 300; margin-top: 2px; margin-bottom: 10px; text-transform: uppercase; }

  .unit-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-display);
    font-size: 9px;
    letter-spacing: 0.14em;
    padding: 3px 8px;
    border: 1px solid;
    font-weight: 400;
    width: fit-content;
  }
  .unit-badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .badge-approve { color: var(--approve); border-color: var(--approve); }
  .badge-approve::before { background: var(--approve); box-shadow: 0 0 5px var(--approve); }
  .badge-reject  { color: var(--reject);  border-color: var(--reject); }
  .badge-reject::before  { background: var(--reject);  box-shadow: 0 0 5px var(--reject); }
  .badge-caution { color: var(--caution); border-color: var(--caution); }
  .badge-caution::before { background: var(--caution); box-shadow: 0 0 5px var(--caution); }

  .unit-right { padding: 12px 16px; font-size: 12px; line-height: 1.7; color: var(--ink); font-weight: 400; }

  .verdict-outer {
    border: 1px solid var(--border-bright);
    background: rgba(32,160,220,0.04);
    padding: 16px 18px;
    position: relative;
    clip-path: polygon(0 10px, 10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px));
  }

  .verdict-header { display: flex; align-items: baseline; gap: 14px; margin-bottom: 10px; }
  .verdict-stato { font-family: var(--font-display); font-size: 16px; font-weight: 700; letter-spacing: 0.2em; }
  .stato-consensus { color: var(--consensus); text-shadow: 0 0 16px var(--consensus); }
  .stato-majority  { color: var(--majority);  text-shadow: 0 0 16px var(--majority); }
  .stato-deadlock  { color: var(--deadlock);  text-shadow: 0 0 16px var(--deadlock); }

  .verdict-score { font-size: 10px; letter-spacing: 0.16em; color: var(--ink-dim); font-weight: 300; }
  .verdict-divider { height: 1px; background: linear-gradient(90deg, var(--border-bright), transparent); margin-bottom: 10px; }
  .verdict-text { font-size: 13px; line-height: 1.7; color: var(--ink-bright); font-weight: 400; margin-bottom: 8px; }
  .verdict-nota { font-size: 10px; color: var(--ink-dim); font-weight: 300; line-height: 1.6; padding-top: 8px; border-top: 1px solid var(--border); letter-spacing: 0.02em; }

  .unit-bars { display: flex; gap: 4px; margin-top: 10px; }
  .unit-bar { flex: 1; height: 3px; opacity: 0.5; }
  .unit-bar.lit { opacity: 1; }
  .bar-m { background: var(--m-color); box-shadow: 0 0 6px var(--m-color); }
  .bar-b { background: var(--b-color); box-shadow: 0 0 6px var(--b-color); }
  .bar-c { background: var(--c-color); box-shadow: 0 0 6px var(--c-color); }

  .footer {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    font-size: 8px;
    letter-spacing: 0.16em;
    color: var(--ink-dim);
    font-weight: 300;
    text-transform: uppercase;
  }

  .scanlines {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px);
    pointer-events: none;
    z-index: 9999;
  }

  @media print {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;

    .scanlines { display: none; }
    body { background: white !important; padding: 0; }
    .sheet-outer { filter: none; width: 100%; }
    .sheet {
      background: white !important;
      background-image:
        linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px) !important;
      background-size: 32px 32px;
      border: 1px solid #bbb !important;
      width: 100%;
      padding: 1.2cm 1.6cm;
      clip-path: none;
    }
    .sheet::before { display: none; }
    .corner { display: none; }

    /* ── Explicit color overrides (CSS vars don't reliably update in @media print) ── */

    /* Text content */
    .unit-right        { color: #1a1a1a !important; }
    .query-box         { color: #1a1a1a !important; background: #f9f9f9 !important; border-color: #ccc !important; }
    .verdict-text      { color: #1a1a1a !important; }
    .verdict-nota      { color: #555 !important; border-top-color: #ddd !important; }
    .verdict-score     { color: #555 !important; }
    .hdr-eyebrow       { color: #888 !important; }
    .hdr-sub           { color: #888 !important; }
    .meta-row          { color: #888 !important; }
    .section-label     { color: #888 !important; }
    .footer            { color: #888 !important; }
    .unit-role         { color: #888 !important; }
    .hdr-title         { color: #111 !important; text-shadow: none !important; }

    /* Unit backgrounds */
    .unit              { background: #fff !important; border-color: #ddd !important; }
    .unit-left         { background: transparent !important; border-right-color: #ddd !important; }
    .unit-m .unit-left { background: rgba(16,85,187,0.04) !important; }
    .unit-b .unit-left { background: rgba(10,122,69,0.04)  !important; }
    .unit-c .unit-left { background: rgba(149,96,16,0.04)  !important; }

    /* Unit accent colors (IDs + left borders) */
    .unit-m .unit-id   { color: #1055bb !important; }
    .unit-b .unit-id   { color: #0a7a45 !important; }
    .unit-c .unit-id   { color: #956010 !important; }
    .unit-m::before    { background: #1055bb !important; box-shadow: none !important; }
    .unit-b::before    { background: #0a7a45 !important; box-shadow: none !important; }
    .unit-c::before    { background: #956010 !important; box-shadow: none !important; }

    /* Verdict badges */
    .badge-approve { color: #0a7a45 !important; border-color: #0a7a45 !important; background: rgba(10,122,69,0.06) !important; }
    .badge-reject  { color: #bb1010 !important; border-color: #bb1010 !important; background: rgba(187,16,16,0.06) !important; }
    .badge-caution { color: #956010 !important; border-color: #956010 !important; background: rgba(149,96,16,0.06) !important; }
    .badge-approve::before { background: #0a7a45 !important; box-shadow: none !important; }
    .badge-reject::before  { background: #bb1010 !important; box-shadow: none !important; }
    .badge-caution::before { background: #956010 !important; box-shadow: none !important; }

    /* Verdict stato */
    .stato-consensus { color: #0a7a45 !important; text-shadow: none !important; }
    .stato-majority  { color: #1055bb !important; text-shadow: none !important; }
    .stato-deadlock  { color: #bb1010 !important; text-shadow: none !important; }
    .verdict-outer   { clip-path: none !important; border: 1px solid #bbb !important; background: #f9f9f9 !important; }
    .verdict-divider { background: #ddd !important; }

    /* Misc */
    .unit-bar        { box-shadow: none !important; }
    .bar-m           { background: #1055bb !important; }
    .bar-b           { background: #0a7a45 !important; }
    .bar-c           { background: #956010 !important; }
    .hdr-divider-line      { background: #ddd !important; }
    .hdr-divider-diamond   { border-color: #bbb !important; }
    .section-label::after  { background: #ddd !important; }
    .meta-dot              { background: #0a7a45 !important; box-shadow: none !important; }
    .query-box::before     { opacity: 1 !important; }
  }
</style>
</head>
<body>
<div class="scanlines"></div>
<div class="sheet-outer">
<div class="sheet">
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>

  <div class="hdr-eyebrow">
    <span>NERV HQ / CENTRAL DOGMA</span>
    <span>SYNTHETIC COGNITION ARRAY</span>
    <span>HOLOGRAPHIC OUTPUT</span>
  </div>
  <div class="hdr-title">MAGI&nbsp;&nbsp;SYSTEM</div>
  <div class="hdr-sub">Melchior&#8209;1 &nbsp;/&nbsp; Balthasar&#8209;2 &nbsp;/&nbsp; Casper&#8209;3</div>
  <div class="hdr-divider">
    <div class="hdr-divider-line"></div>
    <div class="hdr-divider-diamond"></div>
    <div class="hdr-divider-line"></div>
  </div>

  <div class="meta-row">
    <span><span class="meta-dot"></span>SYS ONLINE</span>
    <span>REF&nbsp;MAGI&#8209;${refNumber()}</span>
    <span>${timestamp()}</span>
    <span>CLASSIFICAZIONE: INTERNO</span>
  </div>

  <div class="section">
    <div class="section-label">Query ricevuta</div>
    <div class="query-box">${escHtml(data.query)}</div>
  </div>

  <div class="section">
    <div class="section-label">Responso unità cognitive</div>
    <div class="units">

      <div class="unit unit-m">
        <div class="unit-left">
          <div>
            <div class="unit-id">MELCHIOR&#8209;1</div>
            <div class="unit-role">Scienziata</div>
          </div>
          <div class="unit-badge badge-${data.melchior.verdetto.toLowerCase()}">${data.melchior.verdetto}</div>
        </div>
        <div class="unit-right">${escHtml(data.melchior.sintesi)}</div>
      </div>

      <div class="unit unit-b">
        <div class="unit-left">
          <div>
            <div class="unit-id">BALTHASAR&#8209;2</div>
            <div class="unit-role">Madre</div>
          </div>
          <div class="unit-badge badge-${data.balthasar.verdetto.toLowerCase()}">${data.balthasar.verdetto}</div>
        </div>
        <div class="unit-right">${escHtml(data.balthasar.sintesi)}</div>
      </div>

      <div class="unit unit-c">
        <div class="unit-left">
          <div>
            <div class="unit-id">CASPER&#8209;3</div>
            <div class="unit-role">Donna</div>
          </div>
          <div class="unit-badge badge-${data.casper.verdetto.toLowerCase()}">${data.casper.verdetto}</div>
        </div>
        <div class="unit-right">${escHtml(data.casper.sintesi)}</div>
      </div>

    </div>
  </div>

  <div class="section">
    <div class="section-label">Sintesi e verdetto</div>
    <div class="verdict-outer">
      <div class="verdict-header">
        <div class="verdict-stato ${statoClass(data.moderator.stato)}">${data.moderator.stato}</div>
        <div class="verdict-score">${statoScore(data.moderator.stato)}</div>
      </div>
      <div class="verdict-divider"></div>
      <div class="verdict-text">${escHtml(data.moderator.verdetto_finale)}</div>
      ${notaBlock}
      <div class="unit-bars">
        <div class="unit-bar bar-m ${barM}"></div>
        <div class="unit-bar bar-b ${barB}"></div>
        <div class="unit-bar bar-c ${barC}"></div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>MAGI SYS v3.0</span>
    <span>Naoko Akagi Architecture</span>
    <span>NERV / Gehirn Scientific Dept.</span>
  </div>

</div>
</div>
</body>
</html>`;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
