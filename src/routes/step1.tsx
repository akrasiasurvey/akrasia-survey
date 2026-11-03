import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Lightbulb, Plus, X } from "lucide-react";

export const Route = createFileRoute("/step1")({
  head: () => ({ meta: [{"title": "Mappa delle Voci — AKRASIA"}, {"name": "description", "content": "Mappatura delle voci interne ed esterne e valutazione della loro importanza nelle scelte quotidiane."}, {"property": "og:title", "content": "Mappa delle Voci — AKRASIA"}, {"property": "og:description", "content": "Mappatura delle voci interne ed esterne e valutazione della loro importanza nelle scelte quotidiane."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: () => (
    <StepGate level={2}>
      <Step1 />
    </StepGate>
  ),
});

const INTERNAL_SUGGESTIONS = [
  "Lavoratore",
  "Sotto stress",
  "Tempo libero",
  "Perfezionista",
  "Genitore",
] as const;

const EXTERNAL_SUGGESTIONS = [
  "Capo",
  "Famiglia",
  "Azienda",
  "Società",
  "Colleghi",
] as const;

interface VoiceColumnProps {
  belonging: Belonging;
  title: string;
  instruction: string;
  suggestions: readonly string[];
  placeholder: string;
  addLabel: string;
  positions: IPosition[];
  onAdd: (label: string, belonging: Belonging, dimension: DimensionKey) => void;
  onRemove: (id: string) => void;
  onDimensionChange: (id: string, dimension: DimensionKey) => void;
}

function VoiceColumn({
  belonging,
  title,
  instruction,
  suggestions,
  placeholder,
  addLabel,
  positions,
  onAdd,
  onRemove,
  onDimensionChange,
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

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Gli esempi selezionabili di seguito sono solo alcune delle possibili
        opzioni. Ti invitiamo a inserire e scrivere liberamente le voci più
        personali che pensi ti guidino.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {available.map((s) => (
          <Button
            key={s}
            type="button"
            variant="outline"
            onClick={() => setCustom(s)}
            className="h-auto whitespace-normal rounded-full px-3 py-1.5 text-left text-xs"
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
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && canAdd && addCustom()}
          aria-label={placeholder}
        />
        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            Imposta l'importanza prima di aggiungere
          </p>
          <Select
            value={dimension}
            onValueChange={(v) => setDimension(v as DimensionKey)}
          >
            <SelectTrigger className="h-9 text-xs" aria-label="Importanza">
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
          <Plus className="mr-1 h-3.5 w-3.5" />
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
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {p.label}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(p.id)}
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Elimina ${p.label}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Importanza
                  </span>
                  <Select
                    value={p.dimension}
                    onValueChange={(v) =>
                      onDimensionChange(p.id, v as DimensionKey)
                    }
                  >
                    <SelectTrigger className="h-8 flex-1 text-xs">
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
  const positions = useResearchStore((s) => s.positions);
  const addPosition = useResearchStore((s) => s.addPosition);
  const removePosition = useResearchStore((s) => s.removePosition);
  const updatePositionDimension = useResearchStore(
    (s) => s.updatePositionDimension,
  );

  const internal = positions.filter((p) => p.belonging === "internal");
  const external = positions.filter((p) => p.belonging === "external");
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
        <h1 className="mt-3 font-serif text-3xl font-medium">
          Step 1: Mappa le tue Voci
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground"></p>

        <div className="mt-6 rounded-md border border-border bg-muted/40 px-5 py-4">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Consegna
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            Gli uomini non sono macchine che si comportano sempre allo stesso
            modo, ognuno di noi ha molte sfaccettature: ci comportiamo in modo
            diverso a seconda che siamo al lavoro, in famiglia, stanchi o
            arrabbiati. Siamo tutti influenzati da persone importanti o da
            contesti esterni che ci guidano quando dobbiamo prendere una
            decisione. In questo primo passaggio, crea la tua mappa personale,
            scegliendo o scrivendo i ruoli interni che senti di interpretare e
            le persone/ambienti esterni che contano di più per te. Per ogni
            "voce" che aggiungi stabilisci quanto la senti importante per te
            sull'apposita scala.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <VoiceColumn
            belonging="internal"
            title="Le tue Voci Interne (Chi sei tu nei diversi momenti)"
            instruction="Seleziona o scrivi i diversi aspetti che descrivono come ti percepisci o ti comporti."
            suggestions={INTERNAL_SUGGESTIONS}
            placeholder="Scrivi una tua voce personalizzata…"
            addLabel="Aggiungi"
            positions={internal}
            onAdd={handleAdd}
            onRemove={removePosition}
            onDimensionChange={updatePositionDimension}
          />
          <VoiceColumn
            belonging="external"
            title="Le Voci Esterne e i Contesti (Chi o cosa ti influenza da fuori)"
            instruction="Seleziona o scrivi le persone o gli ambienti che hanno influenza sulle tue scelte."
            suggestions={EXTERNAL_SUGGESTIONS}
            placeholder="Scrivi una figura o un contesto…"
            addLabel="Aggiungi"
            positions={external}
            onAdd={handleAdd}
            onRemove={removePosition}
            onDimensionChange={updatePositionDimension}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>La tua mappa delle voci</span>
              <span>Visualizzazione automatica</span>
            </div>
            <div className="flex justify-center">
              <SelfGraph
                positions={positions}
                emptyMessage="Aggiungi una voce per iniziare"
              />
            </div>
          </section>

          <aside className="rounded-lg border border-border bg-muted/40 p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
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
