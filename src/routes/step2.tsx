import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Instruction } from "@/components/Instruction";
import { SelfGraph } from "@/components/SelfGraph";
import {
  DIMENSIONS,
  NARRATIVES_SHUFFLED,
  useResearchStore,
} from "@/store/research";

export const Route = createFileRoute("/step2")({
  component: Step2,
});

type Phase = "A" | "B";

function Step2() {
  const positions = useResearchStore((s) => s.positions);
  const continuum = useResearchStore((s) => s.continuum);
  const setContinuumValue = useResearchStore((s) => s.setContinuumValue);
  const narrativeColonization = useResearchStore(
    (s) => s.narrativeColonization,
  );
  const toggleColonization = useResearchStore((s) => s.toggleColonization);

  const [phase, setPhase] = useState<Phase>("A");
  const [posIdx, setPosIdx] = useState(0);
  const [narrIdx, setNarrIdx] = useState(0);

  if (positions.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <ProgressSteps current={3} />
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="font-serif text-2xl font-medium">
            Nessuna I-Position dichiarata
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Torna allo Step 1 per dichiarare almeno una posizione identitaria
            prima di procedere.
          </p>
          <Button asChild className="mt-6">
            <Link to="/step1">← Torna allo Step 1</Link>
          </Button>
        </div>
      </main>
    );
  }

  const activePos = positions[Math.min(posIdx, positions.length - 1)];
  const activeEntry = continuum[activePos.id] ?? { value: 50, narratives: [] };
  const activeNarrative = NARRATIVES_SHUFFLED[narrIdx];
  const colonizedIds = narrativeColonization[activeNarrative] ?? [];
  const dimLabel = DIMENSIONS.find((d) => d.key === activePos.dimension)?.label;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProgressSteps current={3} />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Step 2 di 3
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium">
          Il Continuum della Commisurazione e le Narrazioni
        </h1>

        {/* Phase tabs */}
        <div className="mt-6 inline-flex rounded-md border border-border bg-card p-1 text-xs">
          <button
            onClick={() => setPhase("A")}
            className={`rounded px-3 py-1.5 uppercase tracking-widest transition-colors ${
              phase === "A"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Fase A · Continuum
          </button>
          <button
            onClick={() => setPhase("B")}
            className={`rounded px-3 py-1.5 uppercase tracking-widest transition-colors ${
              phase === "B"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Fase B · Colonizzazione
          </button>
        </div>

        <div className="mt-6">
          {phase === "A" ? (
            <Instruction>
              Per ciascuna delle tue posizioni, sposta il cursore lungo la linea
              per indicare se è orientata a dimensioni interiori e morali
              (sinistra) o a compiti quantificabili e scadenze (destra). Osserva
              come cambia il perimetro del cerchio nel grafico.
            </Instruction>
          ) : (
            <Instruction>
              Leggi la spinta culturale presentata a sinistra. Seleziona
              direttamente sul grafico a destra quali delle tue posizioni senti
              influenzate, pressate o colonizzate da questa specifica
              affermazione.
            </Instruction>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_520px]">
          {/* LEFT panel */}
          <section>
            {phase === "A" ? (
              <article className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>
                    Posizione {posIdx + 1} di {positions.length}
                  </span>
                  <span>
                    {activePos.belonging === "internal"
                      ? "Sé Interno"
                      : "Sé Esterno"}{" "}
                    · {dimLabel}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-medium">
                  {activePos.label}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Come solitamente valuti questa voce?
                </p>

                <div className="mt-10">
                  <Slider
                    value={[activeEntry.value]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(v) =>
                      setContinuumValue(activePos.id, v[0] ?? 50)
                    }
                    aria-label={`Continuum per ${activePos.label}`}
                  />
                  <div className="mt-4 grid grid-cols-2 gap-6 text-[11px] leading-snug text-muted-foreground">
                    <div className="text-left">
                      <span className="mb-1 block text-[9px] uppercase tracking-widest text-foreground/60">
                        Sinistra
                      </span>
                      Dimensione valutativa interiore e morale (principi
                      relazionali, benessere psicofisico).
                    </div>
                    <div className="text-right">
                      <span className="mb-1 block text-[9px] uppercase tracking-widest text-foreground/60">
                        Destra
                      </span>
                      Dimensione valutativa misurabile e razionale (compiti
                      tangibili, performance, scadenze).
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={posIdx === 0}
                    onClick={() => setPosIdx((i) => Math.max(0, i - 1))}
                  >
                    ← Precedente
                  </Button>
                  {posIdx < positions.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        setPosIdx((i) => Math.min(positions.length - 1, i + 1))
                      }
                    >
                      Successiva →
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setPhase("B")}>
                      Vai a Fase B →
                    </Button>
                  )}
                </div>
              </article>
            ) : (
              <article className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>
                    Spinta {narrIdx + 1} di {NARRATIVES_SHUFFLED.length}
                  </span>
                  <span>Spinta culturale</span>
                </div>
                <blockquote className="border-l-2 border-foreground/40 pl-4 font-serif text-xl leading-snug">
                  «{activeNarrative}»
                </blockquote>
                <p className="mt-6 text-sm text-muted-foreground">
                  Clicca sui cerchi nel grafico per indicare quali posizioni
                  senti influenzate da questa spinta. Puoi selezionarne più di
                  una.
                </p>
                {colonizedIds.length > 0 && (
                  <div className="mt-4 rounded-md border border-border bg-background p-3 text-xs">
                    <span className="mb-2 block text-[10px] uppercase tracking-widest text-muted-foreground">
                      Posizioni influenzate
                    </span>
                    <ul className="flex flex-wrap gap-1.5">
                      {colonizedIds.map((id) => {
                        const p = positions.find((x) => x.id === id);
                        if (!p) return null;
                        return (
                          <li
                            key={id}
                            className="rounded-full border border-border bg-muted px-2 py-0.5"
                          >
                            {p.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={narrIdx === 0}
                    onClick={() => setNarrIdx((i) => Math.max(0, i - 1))}
                  >
                    ← Spinta Precedente
                  </Button>
                  <Button
                    size="sm"
                    disabled={narrIdx >= NARRATIVES_SHUFFLED.length - 1}
                    onClick={() =>
                      setNarrIdx((i) =>
                        Math.min(NARRATIVES_SHUFFLED.length - 1, i + 1),
                      )
                    }
                  >
                    Spinta Successiva →
                  </Button>
                </div>
              </article>
            )}
          </section>

          {/* RIGHT graph */}
          <section className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>Società del Sé</span>
                <span>
                  {phase === "A"
                    ? "Reattivo al continuum"
                    : "Clicca per associare"}
                </span>
              </div>
              <div className="flex justify-center">
                <SelfGraph
                  positions={positions}
                  continuum={continuum}
                  activeId={phase === "A" ? activePos.id : null}
                  selectedIds={phase === "B" ? colonizedIds : []}
                  onSelect={
                    phase === "B"
                      ? (id) => toggleColonization(activeNarrative, id)
                      : undefined
                  }
                />
              </div>
              <p className="mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">—</span> Linea
                continua: voce orientata a compiti e scadenze
                {"  |  "}
                <span className="font-medium text-foreground">- -</span> Linea
                tratteggiata: voce orientata a dimensioni interiori e
                relazionali
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" asChild>
            <Link to="/step1">← Indietro</Link>
          </Button>
          <Button asChild>
            <Link to="/step3">Avanti →</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
