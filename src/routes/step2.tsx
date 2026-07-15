import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressSteps } from "@/components/ProgressSteps";
import {
  DIMENSIONS,
  PERFORMATIVE_NARRATIVES,
  PROTECTIVE_NARRATIVES,
  useResearchStore,
  type IPosition,
} from "@/store/research";

export const Route = createFileRoute("/step2")({
  component: Step2,
});

const SVG_SIZE = 620;
const CENTER = SVG_SIZE / 2;
const INNER_RADIUS = 170;
const OUTER_RADIUS = 290;

function computeLayout(positions: IPosition[]) {
  const internal = positions.filter((p) => p.belonging === "internal");
  const external = positions.filter((p) => p.belonging === "external");

  const place = (list: IPosition[], isInternal: boolean) => {
    const n = list.length;
    return list.map((p, i) => {
      const angle = (i / Math.max(n, 1)) * Math.PI * 2 - Math.PI / 2;
      let r: number;
      if (isInternal) {
        if (n === 1) {
          r = 0;
        } else {
          const maxR = Math.max(INNER_RADIUS - p.radius - 10, 0);
          const ring = i % 2 === 0 ? 0.45 : 0.85;
          r = maxR * ring;
        }
      } else {
        const min = INNER_RADIUS + p.radius + 12;
        const max = OUTER_RADIUS - p.radius - 8;
        const width = Math.max(max - min, 0);
        const ring = (i % 3) / 2;
        r = min + width * ring;
      }
      return {
        ...p,
        x: CENTER + Math.cos(angle) * r,
        y: CENTER + Math.sin(angle) * r,
      };
    });
  };

  return [...place(internal, true), ...place(external, false)];
}

/**
 * Map continuum value 0..100 to an SVG stroke-dasharray string.
 * 0   -> very sparse dashes (1,8)   -> evanescent
 * 100 -> solid line (no dashes)
 */
function dasharrayFor(value: number): string | undefined {
  if (value >= 98) return undefined; // solid
  const t = value / 100; // 0..1
  // dash length grows, gap shrinks
  const dash = 1 + t * 20; // 1 -> 21
  const gap = 8 - t * 7.5; // 8 -> 0.5
  return `${dash.toFixed(2)} ${gap.toFixed(2)}`;
}

function strokeWidthFor(value: number) {
  return 1 + (value / 100) * 1.5;
}

function Step2() {
  const positions = useResearchStore((s) => s.positions);
  const continuum = useResearchStore((s) => s.continuum);
  const setContinuumValue = useResearchStore((s) => s.setContinuumValue);
  const toggleNarrative = useResearchStore((s) => s.toggleNarrative);

  const laidOut = useMemo(() => computeLayout(positions), [positions]);

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
            prima di procedere al Continuum.
          </p>
          <Button asChild className="mt-6">
            <Link to="/step1">← Torna allo Step 1</Link>
          </Button>
        </div>
      </main>
    );
  }

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
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Per ciascuna I-Position, colloca la voce lungo il continuum secondo
          la modalità con cui solitamente la valuti, e indica quali narrazioni
          culturali percepisci esercitare pressione su di essa.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_520px]">
          {/* LEFT: continua per ogni I-Position */}
          <section className="space-y-6">
            {positions.map((p) => {
              const entry = continuum[p.id] ?? { value: 50, narratives: [] };
              const dimLabel = DIMENSIONS.find(
                (d) => d.key === p.dimension,
              )?.label;
              return (
                <article
                  key={p.id}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <header className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-serif text-xl font-medium">
                      {p.label}
                    </h2>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {p.belonging === "internal" ? "Sé Interno" : "Sé Esterno"}{" "}
                      · {dimLabel}
                    </div>
                  </header>

                  <p className="mt-3 text-sm text-muted-foreground">
                    Come solitamente valuti questa voce?
                  </p>

                  <div className="mt-6">
                    <Slider
                      value={[entry.value]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(v) => setContinuumValue(p.id, v[0] ?? 50)}
                      aria-label={`Continuum per ${p.label}`}
                    />
                    <div className="mt-3 grid grid-cols-2 gap-6 text-[11px] leading-snug text-muted-foreground">
                      <div className="text-left">
                        <span className="mb-1 block text-[9px] uppercase tracking-widest text-foreground/60">
                          Sinistra
                        </span>
                        Dimensione valutativa interiore: basata su principi
                        relazionali, morali, di benessere psicofisico.
                      </div>
                      <div className="text-right">
                        <span className="mb-1 block text-[9px] uppercase tracking-widest text-foreground/60">
                          Destra
                        </span>
                        Dimensione valutativa misurabile e razionale (orientata
                        a compiti tangibili, performance, gestione del tempo).
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 border-t border-border pt-5 md:grid-cols-2">
                    <NarrativeGroup
                      title="Narrazioni Performative"
                      subtitle="Spinte neoliberiste"
                      accent="destructive"
                      items={PERFORMATIVE_NARRATIVES}
                      selected={entry.narratives}
                      onToggle={(n) => toggleNarrative(p.id, n)}
                      positionId={p.id}
                    />
                    <NarrativeGroup
                      title="Contro-Narrazioni del Benessere"
                      subtitle="Spinte protettive"
                      accent="primary"
                      items={PROTECTIVE_NARRATIVES}
                      selected={entry.narratives}
                      onToggle={(n) => toggleNarrative(p.id, n)}
                      positionId={p.id}
                    />
                  </div>
                </article>
              );
            })}
          </section>

          {/* RIGHT: grafico reattivo */}
          <section className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>Società del Sé</span>
                <span>Reattivo al continuum</span>
              </div>
              <div className="flex justify-center">
                <svg
                  viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                  className="w-full max-w-[520px]"
                  role="img"
                  aria-label="Grafico del Sé reattivo"
                >
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={OUTER_RADIUS}
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth={1}
                  />
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={INNER_RADIUS}
                    fill="var(--color-muted)"
                    stroke="var(--color-border)"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                  <text
                    x={CENTER}
                    y={CENTER - INNER_RADIUS - 8}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    style={{
                      fontSize: 10,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    Spazio Interno
                  </text>
                  <text
                    x={CENTER}
                    y={CENTER - OUTER_RADIUS - 8}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    style={{ fontSize: 10, letterSpacing: 2 }}
                  >
                    SPAZIO ESTERNO
                  </text>

                  {laidOut.map((p) => {
                    const v = continuum[p.id]?.value ?? 50;
                    const dash = dasharrayFor(v);
                    const sw = strokeWidthFor(v);
                    const showInside = p.radius >= 22;
                    return (
                      <g key={p.id}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={p.radius}
                          fill="oklch(0.55 0.05 240)"
                          fillOpacity={0.15}
                          stroke="oklch(0.35 0.05 240)"
                          strokeOpacity={0.9}
                          strokeWidth={sw}
                          strokeDasharray={dash}
                          style={{ transition: "stroke-dasharray 200ms, stroke-width 200ms" }}
                        />
                        {showInside ? (
                          <text
                            x={p.x}
                            y={p.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="pointer-events-none fill-foreground"
                            style={{
                              fontSize: Math.max(9, Math.min(12, p.radius / 3.5)),
                              fontWeight: 500,
                            }}
                          >
                            {p.label}
                          </text>
                        ) : (
                          <text
                            x={p.x}
                            y={p.y + p.radius + 10}
                            textAnchor="middle"
                            className="pointer-events-none fill-foreground"
                            style={{ fontSize: 10, fontWeight: 500 }}
                          >
                            {p.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
              <p className="mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">—</span> Linea
                continua: Voce orientata a compiti e scadenze
                {"  |  "}
                <span className="font-medium text-foreground">- -</span> Linea
                tratteggiata: Voce orientata a dimensioni interiori e
                relazionali
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" asChild>
            <Link to="/step1">← Indietro</Link>
          </Button>
          <Button disabled>Avanti →</Button>
        </div>
      </div>
    </main>
  );
}

function NarrativeGroup({
  title,
  subtitle,
  items,
  selected,
  onToggle,
  positionId,
}: {
  title: string;
  subtitle: string;
  accent: "destructive" | "primary";
  items: readonly string[];
  selected: string[];
  onToggle: (n: string) => void;
  positionId: string;
}) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {subtitle}
        </p>
      </div>
      <ul className="space-y-2">
        {items.map((item) => {
          const id = `${positionId}-${item.slice(0, 20)}`;
          const checked = selected.includes(item);
          return (
            <li key={item}>
              <label
                htmlFor={id}
                className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs leading-relaxed transition-colors hover:border-foreground/40 has-[[data-state=checked]]:border-foreground has-[[data-state=checked]]:bg-muted"
              >
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={() => onToggle(item)}
                  className="mt-0.5"
                />
                <span>{item}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
