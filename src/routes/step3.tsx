import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Instruction } from "@/components/Instruction";
import { SelfGraph } from "@/components/SelfGraph";
import { StepGate } from "@/lib/stepGating";
import { ALL_NARRATIVES, useResearchStore } from "@/store/research";

export const Route = createFileRoute("/step3")({
  head: () => ({ meta: [{"title": "Valutazione delle Narrazioni — AKRASIA"}, {"name": "description", "content": "Valutazione delle dieci affermazioni culturali e della loro influenza sulle voci del Sé."}, {"property": "og:title", "content": "Valutazione delle Narrazioni — AKRASIA"}, {"property": "og:description", "content": "Valutazione delle dieci affermazioni culturali e della loro influenza sulle voci del Sé."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: () => (
    <StepGate level={4}>
      <Step3 />
    </StepGate>
  ),
});

function Step3() {
  const positions = useResearchStore((s) => s.positions);
  const continuum = useResearchStore((s) => s.continuum);
  const narrativeColonization = useResearchStore(
    (s) => s.narrativeColonization,
  );
  const toggleColonization = useResearchStore((s) => s.toggleColonization);
  const narrativesSeen = useResearchStore((s) => s.narrativesSeen ?? 0);
  const markNarrativeSeen = useResearchStore((s) => s.markNarrativeSeen);
  const narrativeOrder = useResearchStore((s) => s.narrativeOrder);
  const ensureNarrativeOrder = useResearchStore((s) => s.ensureNarrativeOrder);

  const [narrIdx, setNarrIdx] = useState(0);
  const [warn, setWarn] = useState(false);

  useEffect(() => {
    ensureNarrativeOrder();
  }, [ensureNarrativeOrder]);

  const order =
    narrativeOrder && narrativeOrder.length === ALL_NARRATIVES.length
      ? narrativeOrder
      : ALL_NARRATIVES;

  useEffect(() => {
    markNarrativeSeen(narrIdx);
  }, [narrIdx, markNarrativeSeen]);

  const allSeen = narrativesSeen >= ALL_NARRATIVES.length - 1;

  const activeNarrative = order[narrIdx];
  const colonizedIds = narrativeColonization[activeNarrative] ?? [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProgressSteps current={4} />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          STEP 3 DI 4
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium">
          Valutazione delle Narrazioni
        </h1>

        <div className="mt-6">
          <Instruction>
            Leggi l'affermazione che rappresenta una narrazione culturalmente
            diffusa presentata a sinistra. Seleziona direttamente sul grafico a
            destra quali delle tue posizioni senti influenzate, pressate o
            abitate da questa dichiarazione.
          </Instruction>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_520px]">
          <section>
            <article className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>
                  Affermazione {narrIdx + 1} di {order.length}
                </span>
                <span>Narrazione culturale</span>
              </div>
              <blockquote className="border-l-2 border-foreground/40 pl-4 font-serif text-xl leading-snug">
                «{activeNarrative}»
              </blockquote>
              <p className="mt-6 text-sm text-muted-foreground">
                Clicca sui cerchi nel grafico per indicare quali posizioni
                senti influenzate da questa narrazione. Puoi selezionarne più
                di una.
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
                  ← Affermazione Precedente
                </Button>
                <Button
                  size="sm"
                  disabled={narrIdx >= order.length - 1}
                  onClick={() =>
                    setNarrIdx((i) => Math.min(order.length - 1, i + 1))
                  }
                >
                  Affermazione Successiva →
                </Button>
              </div>
            </article>
          </section>

          <section className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>Società del Sé</span>
                <span>Clicca per associare</span>
              </div>
              <div className="flex justify-center">
                <SelfGraph
                  positions={positions}
                  continuum={continuum}
                  selectedIds={colonizedIds}
                  onSelect={(id) => toggleColonization(activeNarrative, id)}
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
            <Link to="/step2">← Indietro</Link>
          </Button>
          <div className="flex flex-col items-end gap-2">
            {allSeen ? (
              <Button asChild>
                <Link to="/step4">Avanti →</Link>
              </Button>
            ) : (
              <Button
                aria-disabled="true"
                className="opacity-50"
                onClick={() => setWarn(true)}
              >
                Avanti →
              </Button>
            )}
            {warn && !allSeen && (
              <p className="text-xs text-muted-foreground">
                Scorri tutte le affermazioni prima di proseguire.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}