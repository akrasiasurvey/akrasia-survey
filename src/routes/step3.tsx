import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Instruction } from "@/components/Instruction";
import { Progress } from "@/components/ui/progress";
import { SelfGraph, SVG_SIZE, computeLayout } from "@/components/SelfGraph";
import { StepGate } from "@/lib/stepGating";
import {
  ALL_NARRATIVES,
  COLONIZATION_BADGE,
  COLONIZATION_OPTIONS,
  useResearchStore,
} from "@/store/research";

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
  const setColonization = useResearchStore((s) => s.setColonization);
  const narrativesSeen = useResearchStore((s) => s.narrativesSeen ?? 0);
  const markNarrativeSeen = useResearchStore((s) => s.markNarrativeSeen);
  const narrativeOrder = useResearchStore((s) => s.narrativeOrder);
  const ensureNarrativeOrder = useResearchStore((s) => s.ensureNarrativeOrder);

  const [narrIdx, setNarrIdx] = useState(0);
  const [warn, setWarn] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    ensureNarrativeOrder();
  }, [ensureNarrativeOrder]);

  const order =
    narrativeOrder && narrativeOrder.length === ALL_NARRATIVES.length
      ? narrativeOrder
      : ALL_NARRATIVES;

  useEffect(() => {
    markNarrativeSeen(narrIdx);
    setMenuFor(null);
  }, [narrIdx, markNarrativeSeen]);

  const allSeen = narrativesSeen >= ALL_NARRATIVES.length - 1;

  const activeNarrative = order[narrIdx];
  const colonized = narrativeColonization[activeNarrative] ?? {};
  const colonizedIds = Object.keys(colonized);
  const menuPosition = menuFor
    ? positions.find((p) => p.id === menuFor)
    : undefined;

  // Posizione del cerchio selezionato nel sistema di coordinate del grafico,
  // per ancorare la finestra di risposta accanto alla voce.
  const laidOut = useMemo(() => computeLayout(positions), [positions]);
  const menuNode = menuFor
    ? laidOut.find((n) => n.id === menuFor)
    : undefined;
  const menuStyle: CSSProperties = {};
  if (menuNode) {
    const xPct = (menuNode.x / SVG_SIZE) * 100;
    const yPct = (menuNode.y / SVG_SIZE) * 100;
    const off = menuNode.radius + 10;
    menuStyle.left =
      menuNode.x <= SVG_SIZE / 2
        ? `min(calc(${xPct}% + ${off}px), calc(100% - 244px))`
        : `max(calc(${xPct}% - ${off + 240}px), 4px)`;
    if (menuNode.y <= SVG_SIZE / 2) {
      menuStyle.top = `calc(${yPct}% + 10px)`;
    } else {
      menuStyle.bottom = `calc(${100 - yPct}% + 10px)`;
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProgressSteps current={4} />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          STEP 3 DI 4
        </p>
        <Progress value={75} aria-label="Avanzamento dei quattro passaggi" className="mt-3 h-1 max-w-sm" />
        <h1 className="mt-3 font-serif text-3xl font-medium">
          Convinzioni Diffuse
        </h1>

        <div className="mt-6">
          <Instruction>
            Nel parlare di lavoro, successo e vita quotidiana circolano diverse idee e aspettative che possono influenzare il modo in cui interpretiamo le nostre esperienze e prendiamo decisioni.

            Leggi le affermazioni che ti verranno presentate una alla volta. Per ciascuna, seleziona direttamente sulla mappa le voci che, secondo la tua esperienza, si rapportano a quell'affermazione.

            Una voce può riconoscere l'affermazione come valida, sentirne la pressione oppure prenderne le distanze.

            Non ci sono risposte giuste o sbagliate: ci interessa comprendere come queste idee si rapportano alle diverse voci che hai individuato.
          </Instruction>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_520px]">
          <section>
            <article className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>
                  Affermazione {narrIdx + 1} di {order.length}
                </span>
                <span></span>
              </div>
              <blockquote className="border-l-2 border-foreground/40 pl-4 font-serif text-xl leading-snug">
                «{activeNarrative}»
              </blockquote>
              <p className="mt-6 text-sm text-muted-foreground">
                Clicca sui cerchi nel grafico e scegli come reagisce ciascuna voce a questa frase. Puoi selezionarne più di una.
              </p>
              {colonizedIds.length > 0 && (
                <div className="mt-4 rounded-md border border-border bg-background p-3 text-xs">
                  <span className="mb-2 block text-[10px] uppercase tracking-widest text-muted-foreground">
                    Voci attivate
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
                          <span className="ml-1 text-muted-foreground">
                            · {COLONIZATION_BADGE[colonized[id]]}
                          </span>
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
                <span>LA TUA MAPPA</span>
                <span>Clicca per associare</span>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-[620px]">
                  <SelfGraph
                    positions={positions}
                    continuum={continuum}
                    selectedIds={colonizedIds}
                    nodeBadges={Object.fromEntries(
                      colonizedIds.map((id) => [
                        id,
                        COLONIZATION_BADGE[colonized[id]],
                      ]),
                    )}
                    onSelect={(id) =>
                      setMenuFor((cur) => (cur === id ? null : id))
                    }
                  />
                  {menuFor && menuPosition && menuNode && (
                    <div
                      className="absolute z-10 w-60 max-w-[calc(100%-0.5rem)] rounded-md border border-border bg-background p-3 shadow-lg"
                      style={menuStyle}
                    >
                      <p className="text-xs text-muted-foreground">
                        Nel modo in cui percepisci la voce{" "}
                        <span className="font-medium text-foreground">
                          {menuPosition.label}
                        </span>
                        , come si rapporta a questa affermazione?
                      </p>
                  <ul className="mt-3 space-y-2">
                    {COLONIZATION_OPTIONS.map((opt) => {
                      const active = colonized[menuFor] === opt.key;
                      return (
                        <li key={opt.key}>
                          <button
                            type="button"
                            onClick={() => {
                              setColonization(activeNarrative, menuFor, opt.key);
                              setMenuFor(null);
                            }}
                            className={
                              active
                                ? "w-full rounded-md border border-foreground bg-muted px-3 py-2 text-left"
                                : "w-full rounded-md border border-border bg-card px-3 py-2 text-left transition-colors hover:border-foreground/40"
                            }
                          >
                            <span className="block text-sm font-medium">
                              {opt.label}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {opt.description}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                      {colonized[menuFor] && (
                        <button
                          type="button"
                          onClick={() => {
                            setColonization(activeNarrative, menuFor, null);
                            setMenuFor(null);
                          }}
                          className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground underline hover:text-foreground"
                        >
                          Rimuovi associazione
                        </button>
                      )}
                    </div>
                  )}
                </div>
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