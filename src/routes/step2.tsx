import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Instruction } from "@/components/Instruction";
import { SelfGraph } from "@/components/SelfGraph";
import { StepGate } from "@/lib/stepGating";
import { useResearchStore } from "@/store/research";

export const Route = createFileRoute("/step2")({
  head: () => ({ meta: [{"title": "La Scala dei Valori — AKRASIA"}, {"name": "description", "content": "Posiziona le tue voci tra Benessere e Relazioni e Produttività e Risultati nella tua Mappa dei Valori."}, {"property": "og:title", "content": "La Scala dei Valori — AKRASIA"}, {"property": "og:description", "content": "Posiziona le tue voci tra Benessere e Relazioni e Produttività e Risultati nella tua Mappa dei Valori."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
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
  const allPositioned = positions.length > 0 && touchedCount === positions.length;

  if (positions.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <ProgressSteps current={3} />
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="font-serif text-2xl font-medium">
            Step 2: La Scala dei Valori
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Nessuna voce inserita.
          </p>
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <Button variant="ghost" asChild>
              <Link to="/step1">← Indietro</Link>
            </Button>
            <Button disabled>Vai allo Step 3 →</Button>
          </div>
        </div>
      </main>
    );
  }

  const activePos = positions[Math.min(posIdx, positions.length - 1)];
  const activeEntry = continuum[activePos.id] ?? { value: 50, narratives: [] };
  const activeLabel = activePos.label.split("/")[0]?.trim() || activePos.label;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProgressSteps current={3} />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          STEP 2 DI 4
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium">
          Step 2: La Scala dei Valori
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {"\n"}
        </p>

        <div className="mt-6">
          <Instruction>
            Ogni ruolo guida le nostre scelte secondo priorità diverse. Per ognuna delle voci che hai elencato, sposta il cursore lungo la linea per indicare da cosa è maggiormente influenzata: da Benessere e Relazioni (a sinistra) o da Produttività e Risultati (a destra). Osserva come cambia la tua mappa a destra.
          </Instruction>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_520px]">
          <section>
            <article className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>
                  Voce {posIdx + 1} di {positions.length}
                </span>
              </div>
              <h2 className="break-words font-serif text-2xl font-medium">
                {activeLabel}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Quando ascolti o interpreti questa voce, cosa viene al primo posto?
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
                  aria-label={`Scala dei valori per ${activeLabel}`}
                />
                <div className="mt-4 grid grid-cols-2 gap-6 text-[11px] leading-snug text-muted-foreground">
                  <div className="text-left">
                    <span className="mb-1 block text-sm font-medium text-foreground">
                      Valori, Relazioni e Benessere
                    </span>
                    Aspetti non quantificabili matematicamente (es. affetti, morale, salute psicofisica).
                  </div>
                  <div className="text-right">
                    <span className="mb-1 block text-sm font-medium text-foreground">
                      Risultati, Numeri e Compiti
                    </span>
                    Aspetti misurabili e quantificabili (es. performance, produttività, obiettivi e guadagno).
                  </div>
                </div>
              </div>

              <p className="mt-6 rounded-md border border-dashed border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground" aria-live="polite">
                Voci posizionate: {touchedCount} su {positions.length}. Sposta il cursore per ciascuna voce per abilitare lo Step successivo.
              </p>
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
              <div className="mb-3">
                <h2 className="font-serif text-lg font-medium">La tua Mappa dei Valori</h2>
                <p className="mt-1 text-xs text-muted-foreground">Visualizzazione delle posizioni</p>
              </div>
              <div className="flex justify-center">
                <SelfGraph
                  positions={positions}
                  continuum={continuum}
                  activeId={activePos.id}
                  compactLabels
                />
              </div>
              <p className="mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">—</span> Linea
                continua: Risultati, Numeri e Compiti
                {"  |  "}
                <span className="font-medium text-foreground">- -</span> Linea
                tratteggiata: Valori, Relazioni e Benessere
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
              <Link to="/step3">Vai allo Step 3 →</Link>
            </Button>
          ) : (
            <Button disabled title="Posiziona prima tutte le voci sul continuum">
              Vai allo Step 3 →
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
