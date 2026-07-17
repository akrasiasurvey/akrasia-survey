import {
  DIMENSIONS,
  PERFORMATIVE_NARRATIVES,
  PROTECTIVE_NARRATIVES,
  type ContinuumEntry,
  type Context,
  type IPosition,
  type ScenarioEntry,
  type ScenarioId,
} from "@/store/research";

export interface Profile {
  participantId: string;
  context: Context;
  contextCustom?: string;
  startedAt: number;
  endedAt?: number;
  positions: IPosition[];
  continuum: Record<string, ContinuumEntry>;
  narrativeColonization: Record<string, string[]>;
  scenarios: Record<ScenarioId, ScenarioEntry>;
  demo?: boolean;
}

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
      [N_PROT[0]]: ["p1b", "p1d"],
      [N_PROT[1]]: ["p1b", "p1c"],
      [N_PROT[2]]: ["p1b", "p1c", "p1f"],
      [N_PROT[3]]: ["p1d", "p1f"],
    },
    scenarios: {
      s1: {
        openResponse:
          "Sinceramente credo che stringerei i denti e mi collegherei. Ho sempre pensato che chi guida un team debba dare l'esempio proprio nei momenti di difficoltà, anche se so che il mio corpo mi sta chiedendo di fermarmi.",
        locked: true,
        choice: "C",
        winningVoiceIds: ["p1a", "p1e"],
        losingVoiceIds: ["p1b", "p1d"],
      },
      s2: {
        openResponse:
          "Onestamente cercherei di non farmi coinvolgere troppo. Gli darei qualche consiglio ma continuerei a spingere sui miei obiettivi: se non prendo la promozione io la prende qualcun altro, non è una scelta.",
        locked: true,
        choice: "B",
        winningVoiceIds: ["p1a", "p1e"],
        losingVoiceIds: ["p1f", "p1c"],
      },
      s3: {
        openResponse:
          "Applicherei le clausole. È il mio lavoro, e i KPI di fine mese non si negoziano. Al massimo proverei a offrirgli qualche facilitazione in un secondo momento.",
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
      [N_PROT[0]]: ["p2b", "p2c", "p2h"],
      [N_PROT[1]]: ["p2b", "p2c", "p2h"],
      [N_PROT[2]]: ["p2b", "p2e"],
      [N_PROT[3]]: ["p2e", "p2f", "p2g"],
    },
    scenarios: {
      s1: {
        openResponse:
          "Delegherei senza pensarci due volte. Ho imparato a mie spese che ignorare i segnali del corpo si paga sempre, e nessuna riunione vale un crollo. Chiamerei il mio secondo, spiegherei la situazione e mi rimetterei a letto.",
        locked: true,
        choice: "A",
        winningVoiceIds: ["p2b", "p2c", "p2e"],
        losingVoiceIds: ["p2a", "p2d"],
      },
      s2: {
        openResponse:
          "Non riuscirei a lavorare tranquilla sapendo che un amico sta affondando accanto a me. Rallenterei, parlerei con lui e cercheremmo di capire insieme una strategia. La promozione può aspettare, la relazione no.",
        locked: true,
        choice: "A",
        winningVoiceIds: ["p2c", "p2e", "p2h"],
        losingVoiceIds: ["p2a", "p2d"],
      },
      s3: {
        openResponse:
          "Rinegozierei. Non riesco proprio a pensare di scaricare un surplus del 30% su una realtà no-profit che si occupa di persone fragili. Parlerei con il mio capo cercando di far capire che questa scelta ci qualifica come azienda.",
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
      [N_PROT[0]]: ["p3f"],
      [N_PROT[1]]: ["p3d", "p3e"],
      [N_PROT[2]]: [],
      [N_PROT[3]]: ["p3f"],
    },
    scenarios: {
      s1: {
        openResponse:
          "Prendo antidolorifico e vado. Non c'è alternativa: un founder che si assenta il giorno prima di un lancio manda un messaggio devastante al team e agli investitori. Il mio corpo mi seguirà.",
        locked: true,
        choice: "B",
        winningVoiceIds: ["p3a", "p3b"],
        losingVoiceIds: ["p3f", "p3d"],
      },
      s2: {
        openResponse:
          "Se non regge il ritmo è un suo problema, non posso caricarmelo. La competizione è quella cosa che ti fa capire chi sei davvero. Al massimo gli offrirei un caffè per parlarne dopo il trimestre.",
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
