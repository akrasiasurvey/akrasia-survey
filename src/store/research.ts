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

export type Context = "home" | "workplace" | "workplace_common";

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

export interface ContinuumEntry {
  value: number; // 0..100
  narratives: string[];
}

interface ResearchState {
  consent: boolean;
  participantId: string;
  context: Context | "";
  startedAt: number | null;
  positions: IPosition[];
  continuum: Record<string, ContinuumEntry>;
  setConsent: (v: boolean) => void;
  setParticipantId: (v: string) => void;
  setContext: (v: Context) => void;
  startSession: () => void;
  addPosition: (p: Omit<IPosition, "id">) => void;
  removePosition: (id: string) => void;
  setContinuumValue: (id: string, value: number) => void;
  toggleNarrative: (id: string, narrative: string) => void;
}

export const useResearchStore = create<ResearchState>((set) => ({
  consent: false,
  participantId: "",
  context: "",
  startedAt: null,
  positions: [],
  continuum: {},
  setConsent: (v) => set({ consent: v }),
  setParticipantId: (v) => set({ participantId: v }),
  setContext: (v) => set({ context: v }),
  startSession: () => set((s) => ({ startedAt: s.startedAt ?? Date.now() })),
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
      return {
        positions: s.positions.filter((x) => x.id !== id),
        continuum: rest,
      };
    }),
  setContinuumValue: (id, value) =>
    set((s) => ({
      continuum: {
        ...s.continuum,
        [id]: {
          value,
          narratives: s.continuum[id]?.narratives ?? [],
        },
      },
    })),
  toggleNarrative: (id, narrative) =>
    set((s) => {
      const entry = s.continuum[id] ?? { value: 50, narratives: [] };
      const has = entry.narratives.includes(narrative);
      return {
        continuum: {
          ...s.continuum,
          [id]: {
            value: entry.value,
            narratives: has
              ? entry.narratives.filter((n) => n !== narrative)
              : [...entry.narratives, narrative],
          },
        },
      };
    }),
}));
