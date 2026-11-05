import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressSteps } from "@/components/ProgressSteps";
import { SelfGraph } from "@/components/SelfGraph";
import { StepGate } from "@/lib/stepGating";
import {
  DIMENSIONS,
  useResearchStore,
  type Belonging,
  type DimensionKey,
  type IPosition,
} from "@/store/research";

const CENTRALITY_HELP = [
  "ha un ruolo molto limitato nella definizione di chi sono.",
  "è presente, ma incide poco sul mio senso di identità.",
  "è significativa, ma non tra le componenti principali.",
  "contribuisce in modo stabile a definire chi sono.",
  "è una componente rilevante della mia identità.",
  "è una delle componenti principali del mio senso di identità.",
  "è fondamentale per il modo in cui definisco me stesso.",
];

function CentralityHelp() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Informazioni sui sette livelli di centralità" onMouseEnter={() => setOpen(true)}>
          <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground text-xs">?</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)]" align="start">
        <h3 className="mb-3 text-sm font-semibold">Centralità nel Sé</h3>
        <ul className="space-y-2 text-xs leading-relaxed">
          {DIMENSIONS.map((d, i) => <li key={d.key}><strong>{d.label}:</strong> {CENTRALITY_HELP[i]}</li>)}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export const Route = createFileRoute("/step1")({
  head: () => ({ meta: [{"title": "Mappa delle Voci — AKRASIA"}, {"name": "description", "content": "Mappatura delle voci interne ed esterne e valutazione della loro importanza nelle scelte quotidiane."}, {"property": "og:title", "content": "Mappa delle Voci — AKRASIA"}, {"property": "og:description", "content": "Mappatura delle voci interne ed esterne e valutazione della loro importanza nelle scelte quotidiane."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: () => (
    <StepGate level={2}>
      <Step1 />
    </StepGate>
  ),
});

const INTERNAL_SUGGESTIONS = [
  "Io-lavoratore",
  "Io-sotto stress",
  "Io-tempo libero",
  "Io-perfezionista",
  "Io-genitore",
  "Io-partner",
] as const;

const EXTERNAL_SUGGESTIONS = [
  "Capo",
  "Famiglia",
  "Azienda",
  "Società",
  "Colleghi",
  "Università",
  "Amici",
  "Partner",
] as const;

interface VoiceColumnProps {
  belonging: Belonging;
  title: string;
  instruction: string;
  note?: string;
  suggestions: readonly string[];
  placeholder: string;
  addLabel: string;
  positions: IPosition[];
  onAdd: (label: string, belonging: Belonging, dimension: DimensionKey) => void;
  onRemove: (id: string) => void;
  onDimensionChange: (id: string, dimension: DimensionKey) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function VoiceColumn({
  belonging,
  title,
  instruction,
  note,
  suggestions,
  placeholder,
  addLabel,
  positions,
  onAdd,
  onRemove,
  onDimensionChange,
  selectedId,
  onSelect,
}: VoiceColumnProps) {
  const [custom, setCustom] = useState("");
  const [dimension, setDimension] = useState<DimensionKey | "">("");
  const existing = new Set(positions.map((p) => p.label.trim().toLowerCase()));
  const available = suggestions.filter(
    (s) => !existing.has(s.trim().toLowerCase()),
  );
  const canAdd = custom.trim().length > 0 && dimension !== "";

  function addCustom() {
    const trimmed = custom.trim();
    if (!trimmed || !dimension) return;
    onAdd(trimmed, belonging, dimension);
    setCustom("");
    setDimension("");
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {instruction}
      </p>

      {note && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{note}</p>}
      <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">Alcuni esempi</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {available.map((s) => (
          <Button
            key={s}
            type="button"
            variant="outline"
            onClick={() => setCustom(s)}
            className="h-auto min-h-10 whitespace-normal rounded-full px-3 py-1.5 text-left text-xs"
          >
            + {s}
          </Button>
        ))}
        {available.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            Tutti gli esempi sono stati aggiunti.
          </p>
        )}
      </div>

      <div className="mt-4 space-y-3 rounded-md border border-border bg-background p-4">
        <p className="text-xs text-muted-foreground">Oppure aggiungi una tua voce</p>
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && canAdd && addCustom()}
          aria-label={placeholder}
        />
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Centralità nel Sé</p>
            <CentralityHelp />
          </div>
          <p id={`centrality-question-${belonging}`} className="mb-2 text-xs leading-relaxed text-muted-foreground">Quanto è centrale questa voce nel definire chi sei?</p>
          <Select
            value={dimension}
            onValueChange={(v) => setDimension(v as DimensionKey)}
          >
            <SelectTrigger className="h-10 text-xs" aria-label="Centralità nel Sé" aria-describedby={`centrality-question-${belonging}`}>
              <SelectValue placeholder="Seleziona un valore…" />
            </SelectTrigger>
            <SelectContent>
              {DIMENSIONS.map((d) => (
                <SelectItem key={d.key} value={d.key}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          onClick={addCustom}
          disabled={!canAdd}
          className="w-full"
        >
          {addLabel}
        </Button>
      </div>

      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Voci inserite ({positions.length})
        </p>
        {positions.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Nessuna voce inserita.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {positions.map((p) => (
              <li
                key={p.id}
                id={`voice-${p.id}`}
                className={cn("rounded-md border border-border bg-background px-3 py-2", selectedId === p.id && "border-primary bg-accent ring-1 ring-primary")}
              >
                <div className="flex items-center justify-between gap-2">
                  <Button type="button" variant="ghost" onClick={() => onSelect(p.id)} aria-pressed={selectedId === p.id} className="h-auto min-h-10 min-w-0 flex-1 justify-start whitespace-normal break-words px-0 text-left text-sm font-medium">
                    {p.label}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onRemove(p.id)}
                    className="h-10 shrink-0 px-2 text-xs text-muted-foreground hover:text-destructive"
                    aria-label={`Elimina ${p.label}`}
                  >
                    Elimina
                  </Button>
                </div>
                <div className="mt-2 space-y-2">
                  <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">Centralità nel Sé</span>
                  <Select
                    value={p.dimension}
                    onValueChange={(v) =>
                      onDimensionChange(p.id, v as DimensionKey)
                    }
                  >
                    <SelectTrigger className="h-10 text-xs" aria-label={`Centralità di ${p.label}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIMENSIONS.map((d) => (
                        <SelectItem key={d.key} value={d.key}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Step1() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const positions = useResearchStore((s) => s.positions);
  const addPosition = useResearchStore((s) => s.addPosition);
  const removePosition = useResearchStore((s) => s.removePosition);
  const updatePositionDimension = useResearchStore(
    (s) => s.updatePositionDimension,
  );

  const internal = positions.filter((p) => p.belonging === "internal");
  const external = positions.filter((p) => p.belonging === "external");
  const selectVoice = (id: string) => setSelectedId((current) => current === id ? null : id);
  function handleAdd(label: string, belonging: Belonging, dimension: DimensionKey) {
    const dim = DIMENSIONS.find((d) => d.key === dimension);
    if (!dim) return;
    addPosition({ label, belonging, dimension: dim.key, radius: dim.radius });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProgressSteps current={2} />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          STEP 1 DI 4
        </p>
        <Progress value={25} aria-label="Avanzamento dei quattro passaggi" className="mt-3 h-1 max-w-sm" />
        <h1 className="mt-3 font-serif text-3xl font-medium">
          Step 1: Mappa le tue Voci
        </h1>
        <div className="mt-6 rounded-md border border-border bg-muted/40 px-5 py-4">
          <h2 className="mb-2 text-sm font-semibold">La mappa delle tue voci</h2>
          <p className="text-sm leading-relaxed">Ognuno di noi è influenzato da diverse parti di sé, dalle persone che lo circondano e dagli ambienti in cui vive. Queste "voci" possono avere un ruolo importante nel modo in cui pensiamo e prendiamo le decisioni.</p>
          <p className="mt-2 text-sm leading-relaxed">{"In questo primo passaggio costruirai una mappa personale delle voci che senti più significative nella tua vita.\n\n\nPer ogni voce indica quanto la senti importante per la\u00a0"}</p>
          <div className="mt-4 grid gap-4 text-xs leading-relaxed md:grid-cols-3">
            <div><h3 className="mb-1 font-semibold">{"\n"}</h3><p>{"\n"}</p><p className="mt-1 text-muted-foreground">{"\n"}</p></div>
            <div><h3 className="mb-1 font-semibold">{"\n"}</h3><p>{"\n"}</p><p className="mt-1 text-muted-foreground">{"\n"}</p></div>
            <div><h3 className="mb-1 font-semibold">{"\n"}</h3><p>{"\n"}</p></div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Ricorda: Non esistono risposte giuste o sbagliate. Gli esempi sono solo alcune delle possibilità, inserisci le voci che senti più vicine alla tua esperienza.</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <VoiceColumn
            belonging="internal"
            title="Le tue Voci Interne (Chi sei tu nei diversi momenti)"
            instruction="Identifica gli aspetti di te e i ruoli che assumi nei diversi contesti."
            suggestions={INTERNAL_SUGGESTIONS}
            placeholder="Scrivi una tua voce personalizzata…"
            addLabel="Aggiungi"
            positions={internal}
            onAdd={handleAdd}
            onRemove={removePosition}
            onDimensionChange={updatePositionDimension}
            selectedId={selectedId}
            onSelect={selectVoice}
          />
          <VoiceColumn
            belonging="external"
            title="Le Voci Esterne e i Contesti (Chi o cosa ti influenza da fuori)"
            instruction="Identifica le persone, le istituzioni o i contesti le cui aspettative e valutazioni influenzano il tuo modo di pensare e decidere."
            note="Una voce esterna può rappresentare il modo in cui tu percepisci le aspettative di una persona o di un ambiente, non ciò che essi pensano realmente."
            suggestions={EXTERNAL_SUGGESTIONS}
            placeholder="Scrivi una figura o un contesto…"
            addLabel="Aggiungi"
            positions={external}
            onAdd={handleAdd}
            onRemove={removePosition}
            onDimensionChange={updatePositionDimension}
            selectedId={selectedId}
            onSelect={selectVoice}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="rounded-lg border border-border bg-card p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>La tua mappa delle voci</span>
              <span>Visualizzazione automatica</span>
            </div>
            <div className="mb-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
              <p><span className="font-medium">Dimensione del cerchio:</span> rappresenta la centralità che hai attribuito a quella voce.</p>
              <p><span className="font-medium">Posizione nella mappa:</span> distingue le voci interne da quelle esterne.</p>
            </div>
            <div className="flex justify-center">
              <SelfGraph
                positions={positions}
                emptyMessage="Aggiungi una voce per iniziare"
                voiceMap
                selectedIds={selectedId ? [selectedId] : []}
                onSelect={selectVoice}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">La mappa è una rappresentazione personale delle voci che hai individuato.</p>
          </section>

          <aside className="rounded-lg border border-border bg-muted/40 p-5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">
                Come scegliere le voci giuste?
              </h2>
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-relaxed text-foreground/90">
              <li>
                <span className="font-medium">Nessun giudizio:</span> non
                esistono voci "giuste" o "sbagliate". Scegli semplicemente gli
                aspetti più presenti nella tua vita.
              </li>
              <li>
                Pensa alle scelte che fai nel tuo quotidiano: quali parti di te
                o quali persone ti guidano maggiormente quando devi decidere
                come gestire il tuo tempo, le tue energie o la tua salute?
              </li>
            </ul>
          </aside>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <Button variant="ghost" asChild>
            <Link to="/session-info">← Indietro</Link>
          </Button>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs text-muted-foreground">
              Voci inserite e valutate:{" "}
              <span className="font-medium text-foreground">
                {positions.length}
              </span>
            </p>
            {positions.length > 0 ? (
              <Button asChild>
                <Link to="/step2">Salva la mappa e vai allo Step 2 →</Link>
              </Button>
            ) : (
              <Button disabled>Salva la mappa e vai allo Step 2 →</Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
