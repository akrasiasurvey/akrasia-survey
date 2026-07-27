import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Belonging = "internal" | "external";

export const DIMENSIONS = [
  { key: "minima", label: "Minima", radius: 6 },
  { key: "marginale", label: "Marginale", radius: 10 },
  { key: "secondaria", label: "Secondaria", radius: 16 },
  { key: "intermedia", label: "Intermedia", radius: 22 },
  { key: "importante", label: "Importante", radius: 28 },
  { key: "primaria", label: "Primaria", radius: 34 },
  { key: "centrale", label: "Centrale", radius: 42 },
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number]["key"];

export interface IPosition {
  id: string;
  label: string;
  belonging: Belonging;
  dimension: DimensionKey;
  radius: number;
}

export type Context =
  | "home"
  | "workplace"
  | "workplace_common"
  | "other";

export const CONTEXT_LABEL: Record<Context, string> = {
  home: "Casa",
  workplace: "Ufficio",
  workplace_common: "Spazio comune",
  other: "Altro / Personalizzato",
};

/**
 * Restituisce l'etichetta del contesto ecologico da mostrare nella dashboard.
 * Per il tipo "other" utilizza il testo libero digitato dal partecipante.
 */
export function contextLabel(c: Context | "", custom?: string): string {
  if (!c) return "—";
  if (c === "other") return (custom && custom.trim()) || CONTEXT_LABEL.other;
  return CONTEXT_LABEL[c];
}

export const PERFORMATIVE_NARRATIVES = [
  "La produttività, l’efficienza e i risultati misurabili definiscono il tuo valore.",
  "Devi ottimizzare costantemente la gestione del tuo tempo e delle tue energie.",
  "Fermarsi o fallire significa rimanere indietro per colpa propria.",
  "Devi dimostrare costante resilienza e controllo delle emozioni.",
  "La competizione e la spinta individuale sono il motore della crescita.",
] as const;

export const PROTECTIVE_NARRATIVES = [
  "Il valore di un'esperienza non si misura dai risultati quantificabili.",
  "La salute psicofisica e il riposo sono prioritari rispetto alla performance.",
  "Lo status o l'insuccesso professionale non definisce chi sei.",
  "È fondamentale accettare la vulnerabilità e porre limiti tra vita privata e lavoro.",
  "Le relazioni e il benessere collettivo contano più del successo individuale.",
] as const;

/**
 * Elenco canonico delle 10 affermazioni (ordine stabile, usato per calcoli,
 * mappa delle narrazioni e dashboard). L'ordine di presentazione allo Step 3
 * viene invece randomizzato per ogni sessione.
 */
export const ALL_NARRATIVES: readonly string[] = [
  ...PERFORMATIVE_NARRATIVES,
  ...PROTECTIVE_NARRATIVES,
];

/** @deprecated usa ALL_NARRATIVES (ordine canonico) o narrativeOrder (ordine mostrato). */
export const NARRATIVES_SHUFFLED: readonly string[] = ALL_NARRATIVES;

/** Fisher-Yates: ordine di presentazione casuale, diverso per ogni partecipante. */
export function shuffleNarratives(): string[] {
  const arr = [...ALL_NARRATIVES];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function narrativeDomain(
  n: string,
): "performative" | "protective" | "unknown" {
  if ((PERFORMATIVE_NARRATIVES as readonly string[]).includes(n))
    return "performative";
  if ((PROTECTIVE_NARRATIVES as readonly string[]).includes(n))
    return "protective";
  return "unknown";
}

export interface ContinuumEntry {
  value: number;
  narratives: string[];
}

export type ScenarioId = "s1" | "s2" | "s3";
export type ScenarioChoice = "A" | "B" | "C";

export const CHOICE_POLARITY: Record<ScenarioChoice, string> = {
  A: "Autotutela",
  B: "Iper-performance",
  C: "Compromesso",
};

export interface ScenarioEntry {
  openResponse: string;
  locked: boolean;
  choice: ScenarioChoice | null;
  winningVoiceIds: string[];
  losingVoiceIds: string[];
}

export interface ScenarioDef {
  id: ScenarioId;
  title: string;
  theme: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
}

export const SCENARIOS: readonly ScenarioDef[] = [
  {
    id: "s1",
    title: "Scenario 1 — Il fine settimana",
    theme: "Tempo relazionale vs. dedizione lavorativa, riconoscimento professionale",
    text:
      "Dopo settimane di lavoro molto intenso, in cui non hai avuto modo di trascorrere molto tempo in famiglia, finalmente arriva venerdì e la sera stessa partirai per il fine settimana fuori porta che avevi promesso al tuo partner. Ne parlate da tempo e siete entrambi felici di avere un momento di tranquillità in cui non dover pensare agli impegni della settimana. Appena prima di lasciare l’ufficio, però, ricevi una comunicazione dal tuo capo: ti offre la possibilità di occuparti delle pratiche per un cliente di rilievo, un compito importante ma che deve essere portato a termine tassativamente entro lunedì. Sai che accettare la proposta ti richiederebbe qualche ora di lavoro extra, straordinari pagati che ti farebbero comodo, e ti permetterebbe di dimostrare il tuo valore, ma sei consapevole che ciò significherebbe rimandare la gita tanto attesa.",
    optionA:
      "Declino la proposta e parto come previsto. Ritengo che il tempo promesso al mio partner e alla mia vita affettiva non sia negoziabile in cambio di un riconoscimento professionale.",
    optionB:
      "Accetto l'incarico e rimando la partenza. Un'occasione così per dimostrare il proprio valore, con in più gli straordinari pagati, non si può lasciar passare: la famiglia capirà.",
    optionC:
      "Cerco un compromesso: parto comunque, ma porto con me il lavoro e mi ritaglio qualche ora durante il fine settimana per completare le pratiche entro lunedì.",
  },
  {
    id: "s2",
    title: "Scenario 2 — La malattia",
    theme: "Abnegazione psicofisica, competitività, immagine di produttività",
    text:
      "Sul posto di lavoro è un periodo molto teso a causa di possibili ridimensionamenti e promozioni nel prossimo trimestre. Sei tornato sul posto di lavoro da appena qualche giorno dopo quasi una settimana di assenza per malattia a causa di un virus influenzale che ti ha costretto a letto. Una mattina, ti svegli con una forte sensazione di malessere; hai la febbre alta ed una forte emicrania. Sembra essere una ricaduta che dovresti contenere per evitare di stare peggio. In ufficio, però, c’è aria di competizione per ottenere la promozione ed evitare il ridimensionamento e temi che la tua seconda richiesta di malattia nel giro di poche settimane possa alimentare voci tra i colleghi circa il tuo impegno e la tua produttività ed influenzare la decisione.",
    optionA:
      "Resto a casa e mi curo. Riconosco il limite del mio corpo e accetto il rischio che questa assenza venga letta come scarsa dedizione: la salute viene prima della reputazione.",
    optionB:
      "Prendo un antipiretico e vado comunque al lavoro. In un momento così delicato mostrare presenza e resistenza è l'unico modo per non compromettere la mia posizione.",
    optionC:
      "Cerco una via di mezzo: avviso che lavorerò da casa, così evito l'assenza formale pur restando a letto, senza però potermi davvero riposare.",
  },
  {
    id: "s3",
    title: "Scenario 3 — Le clausole",
    theme: "Interesse economico, produttività come scopo supremo, etica relazionale",
    text:
      "Sei incaricato di gestire la trattativa per un importante contratto di consulenza. Ti accorgi che, applicando in modo estremamente rigido ma lecito e legale le clausole, potresti far guadagnare alla tua azienda il 15% in più di quanto preventivato, a spese però del cliente, un’azienda a gestione familiare per la quale costituirebbe un danno economico considerevole. Cerchi un confronto con il tuo capo, il quale ti ricorda quali sono gli obiettivi dell’azienda. Inoltre, sei consapevole che i tuoi KPI di produttività personale dipendono in larga misura dal valore di questo contratto.",
    optionA:
      "Non applico le clausole in modo rigido e mantengo le condizioni preventivate, accettando di non massimizzare i miei KPI: la correttezza verso il cliente viene prima del guadagno.",
    optionB:
      "Applico rigidamente le clausole e porto a casa il 15% in più. È lecito, è ciò che l'azienda chiede e i miei risultati personali ne beneficiano.",
    optionC:
      "Provo a mediare: applico le clausole come richiesto dal capo, ma propongo informalmente al cliente una dilazione dei pagamenti o uno sconto futuro per attenuare il danno.",
  },
];

interface ResearchState {
  consent: boolean;
  participantId: string;
  context: Context | "";
  contextCustom: string;
  startedAt: number | null;
  endedAt: number | null;
  positions: IPosition[];
  continuum: Record<string, ContinuumEntry>;
  narrativeColonization: Record<string, string[]>;
  scenarios: Record<ScenarioId, ScenarioEntry>;
  interviews: Record<string, InterviewData>;
  clinicalNotes: Record<string, Partial<Record<ScenarioId, string>>>;
  archivedProfiles: Profile[];
  sessionCompleted: boolean;
  continuumTouched: string[];
  narrativesSeen: number;
  narrativeOrder: string[];
  setConsent: (v: boolean) => void;
  setParticipantId: (v: string) => void;
  setContext: (v: Context) => void;
  setContextCustom: (v: string) => void;
  startSession: () => void;
  endSession: () => void;
  archiveAndComplete: () => void;
  removeArchivedProfile: (participantId: string) => void;
  resetSession: () => void;
  isUsernameTaken: (name: string) => boolean;
  addPosition: (p: Omit<IPosition, "id">) => void;
  removePosition: (id: string) => void;
  setContinuumValue: (id: string, value: number) => void;
  toggleColonization: (narrative: string, positionId: string) => void;
  markNarrativeSeen: (index: number) => void;
  ensureNarrativeOrder: () => void;
  setScenarioResponse: (id: ScenarioId, text: string) => void;
  lockScenarioResponse: (id: ScenarioId) => void;
  setScenarioChoice: (id: ScenarioId, choice: ScenarioChoice) => void;
  toggleScenarioVoice: (
    id: ScenarioId,
    kind: "winning" | "losing",
    positionId: string,
  ) => void;
  setInterviewTranscript: (pid: string, transcript: string) => void;
  addAnnotation: (pid: string, ann: Omit<Annotation, "id">) => void;
  updateAnnotation: (pid: string, annId: string, note: string) => void;
  removeAnnotation: (pid: string, annId: string) => void;
  setClinicalNote: (pid: string, sid: ScenarioId, note: string) => void;
}

export interface Annotation {
  id: string;
  start: number;
  end: number;
  quote: string;
  note: string;
}

export interface InterviewData {
  transcript: string;
  annotations: Annotation[];
}

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

export const NEOLIB_LEXICON: readonly string[] = [
  "performance",
  "performante",
  "performativo",
  "ottimizzazione",
  "ottimizzare",
  "ottimizzato",
  "rendimento",
  "efficienza",
  "efficiente",
  "investimento",
  "investire",
  "tempo perso",
  "produttività",
  "produttivo",
  "capitale",
  "kpi",
  "risultati",
  "target",
  "obiettivi",
  "profitto",
  "competitività",
  "competitivo",
  "mercato",
];

export const RATIONALIST_LEXICON: readonly string[] = [
  "logico",
  "logica",
  "coerente",
  "coerenza",
  "oggettivo",
  "oggettività",
  "pianificato",
  "pianificazione",
  "calcolato",
  "calcolare",
  "giustificato",
  "giustificazione",
  "razionale",
  "razionalità",
  "metodo",
  "metodico",
  "sistematico",
  "analisi",
  "analitico",
];

const emptyScenario = (): ScenarioEntry => ({
  openResponse: "",
  locked: false,
  choice: null,
  winningVoiceIds: [],
  losingVoiceIds: [],
});

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useResearchStore = create<ResearchState>()(
  persist(
    (set, get) => ({
  consent: false,
  participantId: "",
  context: "",
  contextCustom: "",
  startedAt: null,
  endedAt: null,
  positions: [],
  continuum: {},
  narrativeColonization: {},
  scenarios: {
    s1: emptyScenario(),
    s2: emptyScenario(),
    s3: emptyScenario(),
  },
  interviews: {},
  clinicalNotes: {},
  archivedProfiles: [],
  sessionCompleted: false,
  continuumTouched: [],
  narrativesSeen: 0,
  narrativeOrder: [],
  setConsent: (v) => set({ consent: v }),
  setParticipantId: (v) => set({ participantId: v }),
  setContext: (v) => set({ context: v }),
  setContextCustom: (v) => set({ contextCustom: v }),
  startSession: () => set((s) => ({ startedAt: s.startedAt ?? Date.now() })),
  endSession: () => set((s) => ({ endedAt: s.endedAt ?? Date.now() })),
  archiveAndComplete: () =>
    set((s) => {
      if (s.sessionCompleted) return {};
      if (
        !s.participantId ||
        !s.context ||
        s.positions.length === 0
      ) {
        return {};
      }
      const endedAt = s.endedAt ?? Date.now();
      const profile: Profile = {
        participantId: s.participantId,
        context: s.context as Context,
        contextCustom: s.contextCustom,
        startedAt: s.startedAt ?? endedAt,
        endedAt,
        positions: s.positions,
        continuum: s.continuum,
        narrativeColonization: s.narrativeColonization,
        scenarios: s.scenarios,
        demo: false,
      };
      const existingIdx = s.archivedProfiles.findIndex(
        (p) => p.participantId === profile.participantId,
      );
      const nextArchive = [...s.archivedProfiles];
      if (existingIdx >= 0) nextArchive[existingIdx] = profile;
      else nextArchive.unshift(profile);
      return {
        archivedProfiles: nextArchive,
        sessionCompleted: true,
        endedAt,
      };
    }),
  removeArchivedProfile: (participantId) =>
    set((s) => ({
      archivedProfiles: s.archivedProfiles.filter(
        (p) => p.participantId !== participantId,
      ),
    })),
  resetSession: () =>
    set(() => ({
      consent: false,
      participantId: "",
      context: "",
      contextCustom: "",
      startedAt: null,
      endedAt: null,
      positions: [],
      continuum: {},
      narrativeColonization: {},
      scenarios: {
        s1: emptyScenario(),
        s2: emptyScenario(),
        s3: emptyScenario(),
      },
      sessionCompleted: false,
      continuumTouched: [],
      narrativesSeen: 0,
      narrativeOrder: shuffleNarratives(),
    })),
  isUsernameTaken: (name) => {
    const n = name.trim().toLowerCase();
    if (!n) return false;
    return get().archivedProfiles.some(
      (p) => p.participantId.trim().toLowerCase() === n,
    );
  },
  addPosition: (p) =>
    set((s) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      return {
        positions: [...s.positions, { ...p, id }],
        continuum: { ...s.continuum, [id]: { value: 50, narratives: [] } },
      };
    }),
  removePosition: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.continuum;
      const nc: Record<string, string[]> = {};
      for (const [k, arr] of Object.entries(s.narrativeColonization)) {
        nc[k] = arr.filter((x) => x !== id);
      }
      const scenarios = { ...s.scenarios };
      (Object.keys(scenarios) as ScenarioId[]).forEach((sid) => {
        scenarios[sid] = {
          ...scenarios[sid],
          winningVoiceIds: scenarios[sid].winningVoiceIds.filter(
            (x) => x !== id,
          ),
          losingVoiceIds: scenarios[sid].losingVoiceIds.filter(
            (x) => x !== id,
          ),
        };
      });
      return {
        positions: s.positions.filter((x) => x.id !== id),
        continuum: rest,
        narrativeColonization: nc,
        scenarios,
        continuumTouched: s.continuumTouched.filter((x) => x !== id),
      };
    }),
  setContinuumValue: (id, value) =>
    set((s) => ({
      continuum: {
        ...s.continuum,
        [id]: { value, narratives: s.continuum[id]?.narratives ?? [] },
      },
      continuumTouched: s.continuumTouched.includes(id)
        ? s.continuumTouched
        : [...s.continuumTouched, id],
    })),
  toggleColonization: (narrative, positionId) =>
    set((s) => {
      const list = s.narrativeColonization[narrative] ?? [];
      const has = list.includes(positionId);
      return {
        narrativeColonization: {
          ...s.narrativeColonization,
          [narrative]: has
            ? list.filter((x) => x !== positionId)
            : [...list, positionId],
        },
      };
    }),
  markNarrativeSeen: (index) =>
    set((s) => ({
      narrativesSeen: Math.max(s.narrativesSeen ?? 0, index),
    })),
  ensureNarrativeOrder: () =>
    set((s) => {
      const cur = s.narrativeOrder ?? [];
      const valid =
        cur.length === ALL_NARRATIVES.length &&
        ALL_NARRATIVES.every((n) => cur.includes(n));
      return valid ? {} : { narrativeOrder: shuffleNarratives() };
    }),
  setScenarioResponse: (id, text) =>
    set((s) => {
      if (s.scenarios[id].locked) return {};
      return {
        scenarios: {
          ...s.scenarios,
          [id]: { ...s.scenarios[id], openResponse: text },
        },
      };
    }),
  lockScenarioResponse: (id) =>
    set((s) => ({
      scenarios: { ...s.scenarios, [id]: { ...s.scenarios[id], locked: true } },
    })),
  setScenarioChoice: (id, choice) =>
    set((s) => ({
      scenarios: { ...s.scenarios, [id]: { ...s.scenarios[id], choice } },
    })),
  toggleScenarioVoice: (id, kind, positionId) =>
    set((s) => {
      const entry = s.scenarios[id];
      const key = kind === "winning" ? "winningVoiceIds" : "losingVoiceIds";
      const list = entry[key];
      const has = list.includes(positionId);
      return {
        scenarios: {
          ...s.scenarios,
          [id]: {
            ...entry,
            [key]: has
              ? list.filter((x) => x !== positionId)
              : [...list, positionId],
          },
        },
      };
    }),
  setInterviewTranscript: (pid, transcript) =>
    set((s) => {
      const prev = s.interviews[pid] ?? { transcript: "", annotations: [] };
      return {
        interviews: {
          ...s.interviews,
          [pid]: { ...prev, transcript },
        },
      };
    }),
  addAnnotation: (pid, ann) =>
    set((s) => {
      const prev = s.interviews[pid] ?? { transcript: "", annotations: [] };
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      return {
        interviews: {
          ...s.interviews,
          [pid]: {
            ...prev,
            annotations: [...prev.annotations, { ...ann, id }],
          },
        },
      };
    }),
  updateAnnotation: (pid, annId, note) =>
    set((s) => {
      const prev = s.interviews[pid];
      if (!prev) return {};
      return {
        interviews: {
          ...s.interviews,
          [pid]: {
            ...prev,
            annotations: prev.annotations.map((a) =>
              a.id === annId ? { ...a, note } : a,
            ),
          },
        },
      };
    }),
  removeAnnotation: (pid, annId) =>
    set((s) => {
      const prev = s.interviews[pid];
      if (!prev) return {};
      return {
        interviews: {
          ...s.interviews,
          [pid]: {
            ...prev,
            annotations: prev.annotations.filter((a) => a.id !== annId),
          },
        },
      };
    }),
  setClinicalNote: (pid, sid, note) =>
    set((s) => {
      const prev = s.clinicalNotes[pid] ?? {};
      return {
        clinicalNotes: {
          ...s.clinicalNotes,
          [pid]: { ...prev, [sid]: note },
        },
      };
    }),
}),
    {
      name: "akrasia-survey-v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage,
      ),
      version: 2,
      migrate: (persisted) => {
        // Il set di narrazioni è stato sostituito integralmente:
        // azzeriamo le associazioni e il tracciamento dello Step 3.
        const s = (persisted ?? {}) as Record<string, unknown>;
        return { ...s, narrativeColonization: {}, narrativesSeen: 0 } as never;
      },
    },
  ),
);
