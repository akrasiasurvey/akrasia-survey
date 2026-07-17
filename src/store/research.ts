import { create } from "zustand";

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
  "Devi essere sempre reperibile e pronto a rispondere",
  "La produttività e l'efficienza definiscono il tuo valore",
  "Fermarsi significa perdere opportunità e rimanere indietro",
  "Devi ottimizzare costantemente la gestione del tuo tempo",
] as const;

export const PROTECTIVE_NARRATIVES = [
  "La salute psicofisica e il riposo sono prioritari",
  "Le relazioni affettive e familiari vengono prima della performance",
  "È fondamentale porre limiti sani tra vita privata e lavoro",
  "Il valore di un'esperienza non si misura dai risultati quantificabili",
] as const;

export const NARRATIVES_SHUFFLED: readonly string[] = [
  PERFORMATIVE_NARRATIVES[1],
  PROTECTIVE_NARRATIVES[2],
  PERFORMATIVE_NARRATIVES[3],
  PROTECTIVE_NARRATIVES[0],
  PERFORMATIVE_NARRATIVES[0],
  PROTECTIVE_NARRATIVES[3],
  PERFORMATIVE_NARRATIVES[2],
  PROTECTIVE_NARRATIVES[1],
];

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
    title: "Scenario 1 — La Soglia del Limite",
    theme: "Abnegazione psicofisica, controllo emotivo, lavoro-identità",
    text:
      "Da settimane sei il responsabile di un lancio di prodotto cruciale. Lavori 14 ore al giorno, dormi pochissimo e il tuo corpo inizia a inviarti segnali d'allarme netti: tachicardia costante e attacchi d'ansia prima di entrare in riunione. Sai che mostrare questa fragilità comprometterebbe la tua immagine di leader imperturbabile e solido, una reputazione che coincide interamente con l'idea che hai di te stesso. Sabato mattina, il giorno prima del lancio, ti svegli con una forte emicrania che ti impedisce quasi di tenere gli occhi aperti, ma c'è un'ultima riunione di allineamento non obbligatoria ma strategicamente importante per fare pressione sul team.",
    optionA:
      "Decido di delegare la riunione al mio secondo. Riconosco il limite del mio corpo, accetto la vulnerabilità emotiva e scelgo di riposare per preservare la mia salute, anche se questo potrebbe essere percepito come un momento di cedimento.",
    optionB:
      "Prendo un forte antidolorifico, reprimo l'ansia e mi presento in riunione mostrando massima energia. Ritengo che l'abnegazione e il controllo emotivo di fronte alle difficoltà siano l'unico modo lodevole di dimostrare chi sono veramente.",
    optionC:
      "Cerco una via di mezzo: decido di non andare fisicamente alla riunione, ma mi collego da remoto con la videocamera spenta mentre sono a letto, provando a riposare ma senza disconnettermi del tutto per non perdere il controllo della situazione.",
  },
  {
    id: "s2",
    title: "Scenario 2 — Il Prezzo del Successo",
    theme:
      "Competitività come sviluppo, impegno unico fattore, giudizio morale del fallimento",
    text:
      "Un tuo collega e amico storico all'interno dell'azienda sta attraversando un momento di grave difficoltà personale che si sta riflettendo sulle sue performance lavorative. La direzione ha fatto capire che nel prossimo trimestre ci sarà spazio per promuovere solo uno di voi due, e che chi non otterrà la promozione rischia il ridimensionamento o il licenziamento. Sai che se lo aiutassi attivamente a coprire le sue mancanze divideresti le tue energie, rischiando di non raggiungere i tuoi obiettivi iper-competitivi e di essere etichettato come un professionista che 'non si impegna abbastanza' o che sta fallendo.",
    optionA:
      "Decido di rallentare i miei ritmi lavorativi per affiancare e supportare il mio collega. Accetto di mettere momentaneamente a rischio la mia promozione, ritenendo che la solidarietà e la relazione umana abbiano più valore della competizione selvaggia.",
    optionB:
      "Mi concentro esclusivamente sui miei obiettivi, spingendo al massimo per assicurarmi la promozione. Penso che la competitività sia il motore della crescita professionale e che se il mio collega non riesce a tenere il passo sia indice di una sua temporanea mancanza di dedizione, della quale non posso farmi carico.",
    optionC:
      "Cerco di bilanciare le due cose: dedico il minimo tempo indispensabile ad aiutare il mio collega fuori dall'orario di lavoro per non intaccare i miei KPI personali, sperando che riesca a farcela senza che io debba sacrificare la mia performance.",
  },
  {
    id: "s3",
    title: "Scenario 3 — La Metrica del Valore",
    theme: "Interesse economico, produttività come scopo supremo",
    text:
      "Stai gestendo una trattativa per un importante contratto di consulenza. Ti rendi conto che, applicando in modo estremamente rigido le clausole contrattuali, potresti far fatturare alla tua azienda un surplus del 30% a spese di un cliente (un'associazione no-profit locale che si occupa di assistenza sociale), la quale subirebbe un danno relazionale ed economico enorme. Il tuo capo ti ricorda che l'unico scopo dell'azione aziendale è la massimizzazione del profitto e che i tuoi KPI di produttività personale per questo mese dipendono strettamente dal valore totale di questo contratto.",
    optionA:
      "Propongo una rinegoziazione etica del contratto per non gravare sulla no-profit, accettando di non raggiungere il massimo dei miei KPI mensili. Credo che la responsabilità sociale e l'etica relazionale debbano prevalere sull'interesse puramente economico.",
    optionB:
      "Applico rigidamente le clausole per massimizzare la fatturazione e garantire i miei standard di produttività. Ritengo che nel business l'interesse economico debba prevalere su considerazioni di tipo etico o relazionale, e che l'efficienza produttiva sia lo scopo ultimo del mio lavoro.",
    optionC:
      "Provo a mediare: applico le clausole rigide per ottenere il 30% in più come richiesto dal capo, ma propongo informalmente alla no-profit di compensare il danno dilazionando i pagamenti o promettendo loro uno sconto futuro su altri servizi.",
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
  setConsent: (v: boolean) => void;
  setParticipantId: (v: string) => void;
  setContext: (v: Context) => void;
  setContextCustom: (v: string) => void;
  startSession: () => void;
  endSession: () => void;
  addPosition: (p: Omit<IPosition, "id">) => void;
  removePosition: (id: string) => void;
  setContinuumValue: (id: string, value: number) => void;
  toggleColonization: (narrative: string, positionId: string) => void;
  setScenarioResponse: (id: ScenarioId, text: string) => void;
  lockScenarioResponse: (id: ScenarioId) => void;
  setScenarioChoice: (id: ScenarioId, choice: ScenarioChoice) => void;
  toggleScenarioVoice: (
    id: ScenarioId,
    kind: "winning" | "losing",
    positionId: string,
  ) => void;
}

const emptyScenario = (): ScenarioEntry => ({
  openResponse: "",
  locked: false,
  choice: null,
  winningVoiceIds: [],
  losingVoiceIds: [],
});

export const useResearchStore = create<ResearchState>((set) => ({
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
  setConsent: (v) => set({ consent: v }),
  setParticipantId: (v) => set({ participantId: v }),
  setContext: (v) => set({ context: v }),
  setContextCustom: (v) => set({ contextCustom: v }),
  startSession: () => set((s) => ({ startedAt: s.startedAt ?? Date.now() })),
  endSession: () => set((s) => ({ endedAt: s.endedAt ?? Date.now() })),
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
      };
    }),
  setContinuumValue: (id, value) =>
    set((s) => ({
      continuum: {
        ...s.continuum,
        [id]: { value, narratives: s.continuum[id]?.narratives ?? [] },
      },
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
}));
