import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SelfGraph, type DiagnosticColor } from "@/components/SelfGraph";
import {
  CHOICE_POLARITY,
  PERFORMATIVE_NARRATIVES,
  PROTECTIVE_NARRATIVES,
  SCENARIOS,
  contextLabel,
  narrativeDomain,
  useResearchStore,
  type ScenarioId,
} from "@/store/research";
import { DEMO_PROFILES, type Profile } from "@/data/demoProfiles";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

export const Route = createFileRoute("/researcher")({
  component: Researcher,
});

function Researcher() {
  const [pw, setPw] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === "ricerca2026") {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (unlocked) return <Dashboard />;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link
          to="/"
          className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          ← Home
        </Link>
        <h1 className="mt-6 font-serif text-2xl font-medium">
          Accesso Ricercatore
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Inserisci la password per accedere alla dashboard.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pw">Password</Label>
            <Input
              id="pw"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
            />
            {error && (
              <p className="text-xs text-destructive">Password non valida.</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Accedi
          </Button>
        </form>
      </div>
    </main>
  );
}

function Dashboard() {
  const store = useResearchStore();

  const liveProfile: Profile | null = useMemo(() => {
    const allScenariosComplete = SCENARIOS.every((s) => {
      const e = store.scenarios[s.id];
      return (
        e.locked &&
        !!e.choice &&
        e.winningVoiceIds.length > 0 &&
        e.losingVoiceIds.length > 0
      );
    });
    if (
      !allScenariosComplete ||
      !store.participantId ||
      !store.context ||
      store.positions.length === 0
    ) {
      return null;
    }
    return {
      participantId: store.participantId,
      context: store.context,
      startedAt: store.startedAt ?? Date.now(),
      positions: store.positions,
      continuum: store.continuum,
      narrativeColonization: store.narrativeColonization,
      scenarios: store.scenarios,
    };
  }, [store]);

  const profiles: Profile[] = useMemo(() => {
    return liveProfile ? [liveProfile, ...DEMO_PROFILES] : DEMO_PROFILES;
  }, [liveProfile]);

  const [selectedId, setSelectedId] = useState<string>(
    profiles[0]?.participantId ?? "",
  );
  const selected =
    profiles.find((p) => p.participantId === selectedId) ?? profiles[0];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Dashboard Ricercatore
            </p>
            <h1 className="font-serif text-xl font-medium">
              Analisi Fenomenologica del Sé Dialogico
            </h1>
          </div>
          <Link
            to="/"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            ← Home
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[280px_1fr]">
        {/* LEFT: participants list */}
        <aside className="space-y-2">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Partecipanti</span>
            <span>{profiles.length}</span>
          </div>
          {profiles.map((p) => {
            const isSel = p.participantId === selected?.participantId;
            const isLive = !p.demo;
            return (
              <button
                key={p.participantId}
                onClick={() => setSelectedId(p.participantId)}
                className={cn(
                  "w-full rounded-md border px-3 py-3 text-left transition-colors",
                  isSel
                    ? "border-foreground bg-muted"
                    : "border-border bg-card hover:border-foreground/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {p.participantId}
                  </span>
                  {isLive ? (
                    <span className="rounded border border-foreground/40 px-1.5 py-0.5 text-[9px] uppercase tracking-widest">
                      Live
                    </span>
                  ) : (
                    <span className="rounded border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
                      Demo
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {CONTEXT_LABEL[p.context]}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {formatDateTime(p.startedAt)}
                </div>
              </button>
            );
          })}
        </aside>

        {/* RIGHT: analysis */}
        <section className="space-y-6">
          {selected ? (
            <ProfileAnalysis profile={selected} />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card p-16 text-center text-sm text-muted-foreground">
              Nessun profilo selezionato.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProfileAnalysis({ profile }: { profile: Profile }) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const hovered = profile.positions.find((p) => p.id === hoverId);
  const hoveredValue =
    hoverId != null ? profile.continuum[hoverId]?.value ?? 50 : null;

  return (
    <>
      {/* Section 1: session info */}
      <Card title="Sezione 1 · Informazioni Sessione">
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <Field label="ID Partecipante" value={profile.participantId} />
          <Field
            label="Contesto Ecologico"
            value={CONTEXT_LABEL[profile.context]}
          />
          <Field
            label="Data & Ora"
            value={formatDateTime(profile.startedAt)}
          />
        </div>
      </Card>

      {/* Section 2: graph */}
      <Card title="Sezione 2 · Grafico del Sé">
        <div className="grid gap-4 md:grid-cols-[1fr_260px] items-start">
          <div
            className="flex justify-center"
            onMouseLeave={() => setHoverId(null)}
          >
            <div
              onMouseMove={(e) => {
                const target = (e.target as SVGElement).closest("g");
                const label = target?.querySelector("text")?.textContent;
                const match = profile.positions.find((p) => p.label === label);
                setHoverId(match?.id ?? null);
              }}
            >
              <SelfGraph
                positions={profile.positions}
                continuum={profile.continuum}
              />
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-4 text-xs">
            {hovered ? (
              <>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {hovered.belonging === "internal"
                    ? "Sé Interno"
                    : "Sé Esterno"}
                </div>
                <div className="mt-1 font-serif text-lg">{hovered.label}</div>
                <div className="mt-2 text-muted-foreground">
                  Importanza: <span className="text-foreground">{hovered.dimension}</span>
                </div>
                <div className="text-muted-foreground">
                  Continuum:{" "}
                  <span className="text-foreground">{hoveredValue}/100</span>{" "}
                  ({orientation(hoveredValue ?? 50)})
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Passa il mouse su un cerchio per visualizzare i dettagli.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Section 3: continuum table */}
      <Card title="Sezione 3 · Valutazione Continuum">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="py-2 pr-4">I-Position</th>
                <th className="py-2 pr-4">Appartenenza</th>
                <th className="py-2 pr-4">Importanza</th>
                <th className="py-2 pr-4">Continuum (0–100)</th>
                <th className="py-2">Orientamento</th>
              </tr>
            </thead>
            <tbody>
              {profile.positions.map((p) => {
                const v = profile.continuum[p.id]?.value ?? 50;
                return (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="py-2 pr-4 font-medium">{p.label}</td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {p.belonging === "internal" ? "Sé Interno" : "Sé Esterno"}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {p.dimension}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-32 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-foreground"
                            style={{ width: `${v}%` }}
                          />
                        </div>
                        <span className="tabular-nums">{v}</span>
                      </div>
                    </td>
                    <td className="py-2 text-xs">{orientation(v)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 4: narratives */}
      <Card title="Sezione 4 · Mappa delle Narrazioni">
        <div className="grid gap-6 md:grid-cols-2">
          <NarrativeBlock
            title="Narrazioni Performative"
            tone="performative"
            items={PERFORMATIVE_NARRATIVES}
            profile={profile}
          />
          <NarrativeBlock
            title="Contro-Narrazioni del Benessere"
            tone="protective"
            items={PROTECTIVE_NARRATIVES}
            profile={profile}
          />
        </div>
      </Card>

      {/* Section 5: scenarios */}
      <Card title="Sezione 5 · Analisi Scenari di Akrasia">
        <div className="space-y-6">
          {SCENARIOS.map((s) => {
            const e = profile.scenarios[s.id];
            return (
              <article
                key={s.id}
                className="rounded-md border border-border bg-background p-5"
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.theme}
                </div>
                <h3 className="mt-1 font-serif text-lg">{s.title}</h3>

                <blockquote className="mt-4 border-l-2 border-foreground/40 bg-muted/40 py-2 pl-4 text-sm italic leading-relaxed">
                  «{e.openResponse}»
                </blockquote>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-foreground/60 bg-foreground px-2.5 py-0.5 text-background">
                    Opzione {e.choice ?? "—"}
                  </span>
                  {e.choice && (
                    <span className="text-muted-foreground">
                      Polarità: {CHOICE_POLARITY[e.choice]}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <VoiceList
                    title="Voci Vincenti (Alleanza)"
                    ids={e.winningVoiceIds}
                    profile={profile}
                    tone="win"
                  />
                  <VoiceList
                    title="Voci Perdenti (Sottomissione)"
                    ids={e.losingVoiceIds}
                    profile={profile}
                    tone="lose"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </Card>
    </>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}

function NarrativeBlock({
  title,
  tone,
  items,
  profile,
}: {
  title: string;
  tone: "performative" | "protective";
  items: readonly string[];
  profile: Profile;
}) {
  return (
    <div>
      <div
        className={cn(
          "mb-3 inline-block rounded px-2 py-0.5 text-[10px] uppercase tracking-widest",
          tone === "performative"
            ? "bg-foreground text-background"
            : "border border-foreground/40 text-foreground",
        )}
      >
        {title}
      </div>
      <ul className="space-y-3">
        {items.map((n) => {
          const ids = profile.narrativeColonization[n] ?? [];
          return (
            <li
              key={n}
              className="rounded-md border border-border bg-background p-3"
            >
              <p className="text-xs italic text-foreground">«{n}»</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {ids.length === 0 ? (
                  <span className="text-[10px] text-muted-foreground">
                    Nessuna voce colonizzata.
                  </span>
                ) : (
                  ids.map((id) => {
                    const p = profile.positions.find((x) => x.id === id);
                    if (!p) return null;
                    return (
                      <span
                        key={id}
                        className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px]"
                      >
                        {p.label}
                      </span>
                    );
                  })
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function VoiceList({
  title,
  ids,
  profile,
  tone,
}: {
  title: string;
  ids: string[];
  profile: Profile;
  tone: "win" | "lose";
}) {
  return (
    <div>
      <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ids.length === 0 ? (
          <span className="text-[11px] text-muted-foreground">—</span>
        ) : (
          ids.map((id) => {
            const p = profile.positions.find((x) => x.id === id);
            if (!p) return null;
            return (
              <span
                key={id}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px]",
                  tone === "win"
                    ? "border-foreground/60 bg-muted text-foreground"
                    : "border-border bg-background text-muted-foreground",
                )}
              >
                {p.label}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}

function orientation(v: number): string {
  if (v <= 20) return "Fortemente qualitativo";
  if (v <= 40) return "Qualitativo";
  if (v <= 60) return "Bilanciato";
  if (v <= 80) return "Quantitativo";
  return "Fortemente quantitativo";
}

function formatDateTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
