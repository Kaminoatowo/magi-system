export type Lang = "en" | "it";

const EN = {
  nav: { langToggle: "IT" },
  market: {
    subtitle: "Select the system configuration to activate.",
    active: "● ACTIVE",
    systemActive: "● SYSTEM ACTIVE",
    activate: "ACTIVATE SYSTEM",
  },
  archive: {
    subtitle: (n: number) =>
      n > 0 ? `${n} session${n === 1 ? "" : "s"} recorded.` : "No sessions recorded.",
    empty: "Sessions will appear here after the first query.",
    reopen: "REOPEN",
    dateLocale: "en-US",
  },
  custom: {
    header: "CUSTOMIZE",
    subtitle: "Define a custom triplet",
    toggleLabel: "CUSTOM TRIPLET",
    toggleActive: "Active — custom prompts replace the standard system prompts",
    toggleInactive: "Inactive — MAGI units use default prompts",
    toggleAriaLabel: "Enable custom triplet",
    fallbackName: "Custom",
    unitName: "UNIT NAME",
    scope: "SCOPE",
    behavior: "BEHAVIOR",
    requiredNote: "* Required fields to activate the custom triplet.",
    saveBtn: "SAVE CONFIGURATION",
    incompleteWarning: "⚠ Fill in scope and behavior for all three units",
    savedOk: "✓ CONFIGURATION SAVED",
    units: [
      {
        label: "UNIT I",
        hint: "E.g. Quantitative analyst, legal expert, technical reviewer…",
        hintScope: "E.g. Statistical analysis and risk modeling",
        hintBehavior:
          "You reason through data and probabilities. You are precise, concise and distrust arguments without empirical evidence.",
      },
      {
        label: "UNIT II",
        hint: "E.g. Ethics officer, welfare manager, social consultant…",
        hintScope: "E.g. Human impact and ethical considerations",
        hintBehavior:
          "You evaluate every decision from the perspective of the people involved and long-term community consequences.",
      },
      {
        label: "UNIT III",
        hint: "E.g. Creative, strategist, devil's advocate…",
        hintScope: "E.g. Strategic vision and lateral thinking",
        hintBehavior:
          "You bring an unconventional perspective. You can contradict the other units based on intuition or subjective experience.",
      },
    ],
  },
  settings: {
    active: "● ACTIVE",
    inactive: "○ INACTIVE",
  },
  chat: {
    awaitingTitle: "OPERATING SYSTEM — AWAITING INPUT",
    awaitingSubtitle: "Enter a query to start the deliberative process",
    operator: "OPERATOR",
    deliberating: "UNITS IN DELIBERATION — awaiting synthesis...",
    deliberatingShort: "DELIBERATION IN PROGRESS...",
    placeholder: "Enter query...",
    send: "SEND",
    systemError: "SYSTEM ERROR — connection to MAGI units lost.",
    unitSubs: ["SCIENTIST", "MOTHER", "WOMAN"] as [string, string, string],
    quotaExceeded: "Free request limit reached.",
    quotaAddKey: "Add your API key in ⚙ CONFIG to continue.",
    freeRemaining: (n: number) => `FREE — ${n} / 3`,
  },
  nodePanel: {
    processing: "PROCESSING...",
    awaiting: "AWAITING INPUT",
  },
  report: {
    query: "QUERY",
    status: "STATUS",
    verdict: "VERDICT",
    note: "NOTE",
    print: "⎙ PRINT",
    unitSubs: { melchior: "SCIENTIST", balthasar: "MOTHER", casper: "WOMAN" } as Record<string, string>,
    stato: {
      CONSENSUS: "██ CONSENSUS REACHED",
      MAJORITY: "▓▓ MAJORITY 2/3",
      DEADLOCK: "░░ DEADLOCK — HUMAN REFERRAL",
    } as Record<string, string>,
  },
};

const IT: typeof EN = {
  nav: { langToggle: "EN" },
  market: {
    subtitle: "Seleziona la configurazione di sistema da attivare.",
    active: "● ATTIVO",
    systemActive: "● SISTEMA ATTIVO",
    activate: "ATTIVA SISTEMA",
  },
  archive: {
    subtitle: (n: number) =>
      n > 0
        ? `${n} session${n === 1 ? "e" : "i"} registrat${n === 1 ? "a" : "e"}.`
        : "Nessuna sessione registrata.",
    empty: "Le sessioni appariranno qui dopo la prima query.",
    reopen: "RIAPRI",
    dateLocale: "it-IT",
  },
  custom: {
    header: "PERSONALIZZA",
    subtitle: "Definisci una tripletta personalizzata",
    toggleLabel: "TRIPLETTA PERSONALIZZATA",
    toggleActive: "Attiva — i prompt personalizzati sostituiscono i system prompt standard",
    toggleInactive: "Inattiva — le unità MAGI usano i prompt predefiniti",
    toggleAriaLabel: "Attiva tripletta personalizzata",
    fallbackName: "Personalizzata",
    unitName: "NOME UNITÀ",
    scope: "AMBITO",
    behavior: "COMPORTAMENTO",
    requiredNote: "* Campi obbligatori per attivare la tripletta personalizzata.",
    saveBtn: "SALVA CONFIGURAZIONE",
    incompleteWarning: "⚠ Compila ambito e comportamento per tutte e tre le unità",
    savedOk: "✓ CONFIGURAZIONE SALVATA",
    units: [
      {
        label: "UNITÀ I",
        hint: "Es. Analista quantitativo, esperto legale, revisore tecnico…",
        hintScope: "Es. Analisi statistica e modellazione del rischio",
        hintBehavior:
          "Ragioni per dati e probabilità. Sei preciso, conciso e diffidi delle argomentazioni prive di evidenza empirica.",
      },
      {
        label: "UNITÀ II",
        hint: "Es. Responsabile etico, welfare manager, consulente sociale…",
        hintScope: "Es. Impatto umano e considerazioni etiche",
        hintBehavior:
          "Valuti ogni decisione dal punto di vista delle persone coinvolte e delle conseguenze a lungo termine per la comunità.",
      },
      {
        label: "UNITÀ III",
        hint: "Es. Creativo, stratega, avvocato del diavolo…",
        hintScope: "Es. Visione strategica e pensiero laterale",
        hintBehavior:
          "Porti una prospettiva non convenzionale. Puoi contraddire le altre unità sulla base di intuizione o esperienza soggettiva.",
      },
    ],
  },
  settings: {
    active: "● ATTIVA",
    inactive: "○ INATTIVA",
  },
  chat: {
    awaitingTitle: "SISTEMA OPERATIVO — IN ATTESA DI INPUT",
    awaitingSubtitle: "Inserisci una query per avviare il processo deliberativo",
    operator: "OPERATORE",
    deliberating: "UNITÀ IN DELIBERAZIONE — in attesa di sintesi...",
    deliberatingShort: "DELIBERAZIONE IN CORSO...",
    placeholder: "Inserisci query...",
    send: "INVIA",
    systemError: "ERRORE DI SISTEMA — connessione alle unità MAGI persa.",
    unitSubs: ["SCIENZIATA", "MADRE", "DONNA"] as [string, string, string],
    quotaExceeded: "Limite di richieste gratuite raggiunto.",
    quotaAddKey: "Aggiungi la tua API key in ⚙ CONFIG per continuare.",
    freeRemaining: (n: number) => `GRATUITO — ${n} / 3`,
  },
  nodePanel: {
    processing: "ELABORAZIONE...",
    awaiting: "IN ATTESA DI INPUT",
  },
  report: {
    query: "QUERY",
    status: "STATO",
    verdict: "VERDETTO",
    note: "NOTA",
    print: "⎙ STAMPA",
    unitSubs: { melchior: "SCIENZIATA", balthasar: "MADRE", casper: "DONNA" } as Record<string, string>,
    stato: {
      CONSENSUS: "██ CONSENSO RAGGIUNTO",
      MAJORITY: "▓▓ MAGGIORANZA 2/3",
      DEADLOCK: "░░ STALLO — RINVIO UMANO",
    } as Record<string, string>,
  },
};

export const STRINGS: Record<Lang, typeof EN> = { en: EN, it: IT };
