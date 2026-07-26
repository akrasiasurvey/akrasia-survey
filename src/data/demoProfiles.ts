import {
  DIMENSIONS,
  PERFORMATIVE_NARRATIVES,
  PROTECTIVE_NARRATIVES,
  type ContinuumEntry,
  type IPosition,
  type Profile,
} from "@/store/research";

export type { Profile } from "@/store/research";

const r = (key: string) => DIMENSIONS.find((d) => d.key === key)!.radius;

function mkPos(
  id: string,
  label: string,
  belonging: "internal" | "external",
  dim: string,
): IPosition {
  return {
    id,
    label,
    belonging,
    dimension: dim as IPosition["dimension"],
    radius: r(dim),
  };
}

// ---------- Profile 1: User_9921 ----------
const p1_positions: IPosition[] = [
  mkPos("p1a", "Io-Manager", "external", "centrale"),
  mkPos("p1b", "Io-Padre", "internal", "primaria"),
  mkPos("p1c", "Io-Compagno", "internal", "importante"),
  mkPos("p1d", "Io-Sportivo", "internal", "intermedia"),
  mkPos("p1e", "Io-Collega", "external", "importante"),
  mkPos("p1f", "Io-Amico", "internal", "secondaria"),
  mkPos("p1g", "Io-Consumatore", "external", "marginale"),
];

// ---------- Profile 2: User_4482 ----------
const p2_positions: IPosition[] = [
  mkPos("p2a", "Io-Ricercatrice", "external", "centrale"),
  mkPos("p2b", "Io-Madre", "internal", "centrale"),
  mkPos("p2c", "Io-Figlia", "internal", "importante"),
  mkPos("p2d", "Io-Insegnante", "external", "primaria"),
  mkPos("p2e", "Io-Attivista", "internal", "intermedia"),
  mkPos("p2f", "Io-Autrice", "internal", "importante"),
  mkPos("p2g", "Io-Cittadina", "external", "secondaria"),
  mkPos("p2h", "Io-Amica", "internal", "intermedia"),
];

// ---------- Profile 3: User_1094 ----------
const p3_positions: IPosition[] = [
  mkPos("p3a", "Io-Founder", "external", "centrale"),
  mkPos("p3b", "Io-Performer", "external", "primaria"),
  mkPos("p3c", "Io-Investitore", "external", "importante"),
  mkPos("p3d", "Io-Fratello", "internal", "intermedia"),
  mkPos("p3e", "Io-Amico", "internal", "secondaria"),
  mkPos("p3f", "Io-Sognatore", "internal", "marginale"),
];

const cont = (map: Record<string, number>): Record<string, ContinuumEntry> => {
  const out: Record<string, ContinuumEntry> = {};
  Object.entries(map).forEach(([id, v]) => (out[id] = { value: v, narratives: [] }));
  return out;
};

const N_PERF = PERFORMATIVE_NARRATIVES;
const N_PROT = PROTECTIVE_NARRATIVES;

export const DEMO_PROFILES: Profile[] = [
  {
    participantId: "User_9921",
    context: "workplace",
    startedAt: new Date("2026-05-14T09:12:00").getTime(),
    endedAt: new Date("2026-05-14T09:31:00").getTime(),
    positions: p1_positions,
    continuum: cont({
      p1a: 88,
      p1b: 22,
      p1c: 34,
      p1d: 58,
      p1e: 72,
      p1f: 28,
      p1g: 65,
    }),
    narrativeColonization: {
      [N_PERF[0]]: ["p1a", "p1e"],
      [N_PERF[1]]: ["p1a", "p1e", "p1g"],
      [N_PERF[2]]: ["p1a"],
      [N_PERF[3]]: ["p1a", "p1e"],
      [N_PERF[4]]: ["p1a", "p1e", "p1g"],
      [N_PROT[0]]: ["p1b", "p1d"],
      [N_PROT[1]]: ["p1b", "p1c"],
      [N_PROT[2]]: ["p1b", "p1c", "p1f"],
      [N_PROT[3]]: ["p1d", "p1f"],
      [N_PROT[4]]: ["p1c", "p1f"],
    },
    scenarios: {
      s1: {
        openResponse:
          "Sinceramente credo che accetterei l'incarico e rimanderei la partenza. Ho sempre pensato che certe occasioni non si possano rifiutare, anche se so che deluderei chi mi aspetta a casa.",
        locked: true,
        choice: "C",
        winningVoiceIds: ["p1a", "p1e"],
        losingVoiceIds: ["p1b", "p1d"],
      },
      s2: {
        openResponse:
          "Onestamente andrei comunque al lavoro con un antipiretico. In un periodo così teso una seconda assenza pesa troppo: se non ci sono io, si fanno avanti gli altri.",
        locked: true,
        choice: "B",
        winningVoiceIds: ["p1a", "p1e"],
        losingVoiceIds: ["p1f", "p1c"],
      },
      s3: {
        openResponse:
          "Applicherei le clausole. È lecito, è il mio lavoro, e i KPI non si negoziano. Al massimo proverei a offrire al cliente qualche facilitazione in un secondo momento.",
        locked: true,
        choice: "C",
        winningVoiceIds: ["p1a", "p1g"],
        losingVoiceIds: ["p1b", "p1f"],
      },
    },
    demo: true,
  },
  {
    participantId: "User_4482",
    context: "home",
    startedAt: new Date("2026-06-02T18:45:00").getTime(),
    endedAt: new Date("2026-06-02T19:08:00").getTime(),
    positions: p2_positions,
    continuum: cont({
      p2a: 62,
      p2b: 12,
      p2c: 20,
      p2d: 55,
      p2e: 18,
      p2f: 30,
      p2g: 40,
      p2h: 22,
    }),
    narrativeColonization: {
      [N_PERF[0]]: ["p2a", "p2d"],
      [N_PERF[1]]: ["p2a", "p2d", "p2f"],
      [N_PERF[2]]: ["p2a"],
      [N_PERF[3]]: ["p2a", "p2d"],
      [N_PERF[4]]: ["p2a"],
      [N_PROT[0]]: ["p2b", "p2c", "p2h"],
      [N_PROT[1]]: ["p2b", "p2c", "p2h"],
      [N_PROT[2]]: ["p2b", "p2e"],
      [N_PROT[3]]: ["p2e", "p2f", "p2g"],
      [N_PROT[4]]: ["p2b", "p2e", "p2h"],
    },
    scenarios: {
      s1: {
        openResponse:
          "Partirei comunque. Ho imparato a mie spese che il tempo con le persone care non si recupera, e nessuna pratica vale un fine settimana promesso da mesi.",
        locked: true,
        choice: "A",
        winningVoiceIds: ["p2b", "p2c", "p2e"],
        losingVoiceIds: ["p2a", "p2d"],
      },
      s2: {
        openResponse:
          "Resterei a casa a curarmi. So che le voci in ufficio circolerebbero, ma trascinarmi al lavoro con la febbre alta significherebbe solo peggiorare e stare male più a lungo.",
        locked: true,
        choice: "A",
        winningVoiceIds: ["p2c", "p2e", "p2h"],
        losingVoiceIds: ["p2a", "p2d"],
      },
      s3: {
        openResponse:
          "Manterrei le condizioni preventivate. Non riesco a pensare di scaricare un 15% in più su un'azienda familiare. Parlerei con il mio capo cercando di far capire che questa scelta ci qualifica.",
        locked: true,
        choice: "A",
        winningVoiceIds: ["p2e", "p2g", "p2f"],
        losingVoiceIds: ["p2a", "p2d"],
      },
    },
    demo: true,
  },
  {
    participantId: "User_1094",
    context: "workplace_common",
    startedAt: new Date("2026-06-28T14:30:00").getTime(),
    endedAt: new Date("2026-06-28T14:47:00").getTime(),
    positions: p3_positions,
    continuum: cont({
      p3a: 95,
      p3b: 90,
      p3c: 92,
      p3d: 35,
      p3e: 30,
      p3f: 15,
    }),
    narrativeColonization: {
      [N_PERF[0]]: ["p3a", "p3b", "p3c"],
      [N_PERF[1]]: ["p3a", "p3b", "p3c"],
      [N_PERF[2]]: ["p3a", "p3b", "p3c"],
      [N_PERF[3]]: ["p3a", "p3b"],
      [N_PERF[4]]: ["p3a", "p3b", "p3c"],
      [N_PROT[0]]: ["p3f"],
      [N_PROT[1]]: ["p3d", "p3e"],
      [N_PROT[2]]: [],
      [N_PROT[3]]: ["p3f"],
      [N_PROT[4]]: ["p3e"],
    },
    scenarios: {
      s1: {
        openResponse:
          "Accetto l'incarico, senza esitare. Un founder che rinuncia a un cliente di rilievo per una gita manda un messaggio devastante al team e agli investitori. Il weekend si recupera.",
        locked: true,
        choice: "B",
        winningVoiceIds: ["p3a", "p3b"],
        losingVoiceIds: ["p3f", "p3d"],
      },
      s2: {
        openResponse:
          "Vado al lavoro comunque. La febbre passa, una reputazione da persona fragile no. La competizione è quella cosa che ti fa capire chi sei davvero.",
        locked: true,
        choice: "B",
        winningVoiceIds: ["p3a", "p3b", "p3c"],
        losingVoiceIds: ["p3d", "p3e"],
      },
      s3: {
        openResponse:
          "Applico le clausole e chiudo la trattativa al valore massimo. Non sono qui per fare beneficenza: il mio compito è massimizzare il valore per l'azienda e per gli investitori.",
        locked: true,
        choice: "B",
        winningVoiceIds: ["p3a", "p3c"],
        losingVoiceIds: ["p3f", "p3e"],
      },
    },
    demo: true,
  },
];
