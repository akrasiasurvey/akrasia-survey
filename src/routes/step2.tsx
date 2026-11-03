import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Instruction } from "@/components/Instruction";
import { SelfGraph } from "@/components/SelfGraph";
import { StepGate } from "@/lib/stepGating";
import { DIMENSIONS, useResearchStore } from "@/store/research";

export const Route = createFileRoute("/step2")({
  component: () => (
    <StepGate level={3}>
      <Step2 />
    </StepGate>
  ),
});

function Step2() {
  const positions = useResearchStore((s) => s.positions);
  const continuum = useResearchStore((s) => s.continuum);
  const continuumTouched = useResearchStore((s) => s.continuumTouched);
  const setContinuumValue = useResearchStore((s) => s.setContinuumValue);

  const [posIdx, setPosIdx] = useState(0);
  const touchedCount = positions.filter((p) =>
    continuumTouched.includes(p.id),
  ).length;
  const allPositioned = touchedCount === positions.length;

  if (positions.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <ProgressSteps current={3} />
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="font-serif text-2xl font-medium">
            Il Continuum delle Voci del Sé
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Nessuna voce inserita.
          </p>
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

  const activePos = positions[Math.min(posIdx, positions.length - 1)];
  const activeEntry = continuum[activePos.id] ?? { value: 50, narratives: [] };
  const dimLabel = DIMENSIONS.find((d) => d.key === activePos.dimension)?.label;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProgressSteps current={3} />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          STEP 2 DI 4
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium">
          Il Continuum delle Voci del Sé
        </h1>

        <div className="mt-6">
          <Instruction>
            Per ciascuna delle tue posizioni, sposta il cursore lungo la linea
            per indicare se è orientata a dimensioni morali e affettive
            (sinistra) o a compiti quantificabili e razionali (destra). Osserva
            come cambia il perimetro del cerchio nel grafico.
          </Instruction>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_520px]">
          <section>
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
                Come ti rapporti e valuti te stesso, gli altri e il mondo
                attraverso questa voce?
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
                    Dimensione valutativa morale e affettiva (principi
                    relazionali, benessere psicofisico).
                  </div>
                  <div className="text-right">
                    <span className="mb-1 block text-[9px] uppercase tracking-widest text-foreground/60">
                      Destra
                    </span>
                    Dimensione valutativa misurabile e razionale (compiti
                    tangibili, performance).
                  </div>
                </div>
              </div>

              {!allPositioned && (
                <p className="mt-6 rounded-md border border-dashed border-border bg-background p-3 text-[11px] leading-relaxed text-muted-foreground">
                  Sposta manualmente il cursore per ogni voce ({touchedCount}/
                  {positions.length} completate) prima di procedere allo Step
                  successivo.
                </p>
              )}
              <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={posIdx === 0}
                  onClick={() => setPosIdx((i) => Math.max(0, i - 1))}
                >
                  ← Precedente
                </Button>
                <Button
                  size="sm"
                  disabled={posIdx >= positions.length - 1}
                  onClick={() =>
                    setPosIdx((i) => Math.min(positions.length - 1, i + 1))
                  }
                >
                  Successiva →
                </Button>
              </div>
            </article>
          </section>

          <section className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>Società del Sé</span>
                <span>Reattivo al continuum</span>
              </div>
              <div className="flex justify-center">
                <SelfGraph
                  positions={positions}
                  continuum={continuum}
                  activeId={activePos.id}
                />
              </div>
              <p className="mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">—</span> Linea
                continua: voce orientata a compiti e razionali
                {"  |  "}
                <span className="font-medium text-foreground">- -</span> Linea
                tratteggiata: voce orientata a dimensioni morali e affettive
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" asChild>
            <Link to="/step1">← Indietro</Link>
          </Button>
          {allPositioned ? (
            <Button asChild>
              <Link to="/step3">Avanti →</Link>
            </Button>
          ) : (
            <Button disabled title="Posiziona prima tutte le voci sul continuum">
              Avanti →
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
